import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { WsException } from '@nestjs/websockets';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Player, PlayerDocument } from '../player/player.schema';
import { PlayerAnswer, PlayerAnswerDocument } from '../player-answer/player-answer.schema';
import { Quiz, QuizDocument } from '../quiz/quiz.schema';
import { Room, RoomDocument } from '../room/room.schema';
import { AdminControlDto } from './dto/admin-control.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';
import { GetSnapshotDto } from './dto/get-snapshot.dto';
import { RoomStateService, GamePhase } from './room-state.service';

/** ms between allowed submits from the same player (anti-spam). */
const SUBMIT_COOLDOWN_MS = 1_000;

/** Number of tiles in each team board. */
const BOARD_SIZE = 9;

@Injectable()
export class RealtimeService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
    @InjectModel(Player.name) private readonly playerModel: Model<PlayerDocument>,
    @InjectModel(PlayerAnswer.name)
    private readonly playerAnswerModel: Model<PlayerAnswerDocument>,
    private readonly roomState: RoomStateService,
  ) {}

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async findRoomByKey(roomKey: string) {
    if (isValidObjectId(roomKey)) {
      return this.roomModel.findById(roomKey).exec();
    }
    return this.roomModel.findOne({ pin: roomKey }).exec();
  }

  private async findRoom(payload: JoinRoomDto) {
    if (payload.pin) {
      return this.roomModel.findOne({ pin: payload.pin }).exec();
    }
    if (payload.roomId && isValidObjectId(payload.roomId)) {
      return this.roomModel.findById(payload.roomId).exec();
    }
    if (payload.roomId) {
      return this.roomModel.findOne({ pin: payload.roomId }).exec();
    }
    return null;
  }

  // ─── Join / Leave / Disconnect ───────────────────────────────────────────

  async joinRoom(payload: JoinRoomDto, socketId: string) {
    const room = await this.findRoom(payload);
    if (!room) throw new WsException('Room not found');

    let player = await this.playerModel
      .findOne({ roomId: room._id, nickname: payload.nickname })
      .exec();

    if (player) {
      player.socketId = socketId;
      player.connected = true;
      if (payload.team) player.team = payload.team;
      await player.save();
    } else {
      player = await this.playerModel.create({
        roomId: room._id,
        socketId,
        nickname: payload.nickname,
        team: payload.team,
        score: 0,
        streak: 0,
        resetCount: 0,
        connected: true,
      });
    }

    return { room, player };
  }

  async markDisconnected(socketId: string) {
    const player = await this.playerModel
      .findOneAndUpdate({ socketId }, { connected: false, socketId: null }, { new: true })
      .exec();
    return { player };
  }

  async leaveRoom(payload: LeaveRoomDto, _socketId: string) {
    const player = await this.playerModel
      .findByIdAndUpdate(payload.playerId, { connected: false, socketId: null }, { new: true })
      .exec();
    return { player, roomId: payload.roomId };
  }

  // ─── Snapshot / Reconnect ────────────────────────────────────────────────

  async getSnapshot(payload: GetSnapshotDto, socketId?: string) {
    const roomId = payload.roomId;

    // Re-attach socket if playerId is provided and is a valid ObjectId
    let reconnectedPlayer: PlayerDocument | null = null;
    if (payload.playerId && isValidObjectId(payload.playerId) && socketId) {
      reconnectedPlayer = await this.playerModel
        .findByIdAndUpdate(
          payload.playerId,
          { socketId, connected: true },
          { new: true },
        )
        .exec();
    }

    const snap = this.roomState.snapshot(roomId);
    const leaderboard = await this.getLeaderboard(roomId);
    const players = await this.playerModel.find({ roomId: new Types.ObjectId(roomId) }).exec();
    const connectedCount = players.filter((p) => p.connected).length;

    const room = await this.roomModel.findById(roomId).exec();
    const pin = room?.pin ?? '';
    const quiz = room ? await this.quizModel.findById(room.quizId).exec() : null;
    const imageBase64 = quiz?.imageBase64 ?? null;

    return { snapshot: snap, leaderboard, connectedPlayers: connectedCount, pin, imageBase64, reconnectedPlayer };
  }

  // ─── Submit Answer ───────────────────────────────────────────────────────

  /**
   * Returns:
   *  - standard answer result fields
   *  - boardUpdate: which tile was cleared (or null)
   *  - resetBoard: true when the team's board is fully reset
   *  - winEvent: { winner } if a team just won
   *  - timerCallback: function the gateway should schedule for time-out (if start caused a new timer)
   */
  async submitAnswer(
    payload: AnswerQuestionDto,
    /** callback the gateway passes in so we can schedule time-out emission */
    onTimeout: (roomId: string, winner: 'red' | 'blue' | 'tie') => void,
  ) {
    const room = await this.roomModel.findById(payload.roomId).exec();
    if (!room) throw new WsException('Room not found');

    // ── Anti-cheat: rate-limit per player ──────────────────────────────────
    const state = this.roomState.get(payload.roomId);
    if (!state) throw new WsException('Game not started');
    if (state.phase !== 'playing') throw new WsException('Game is not in playing phase');

    const lastSubmit = state.submitCooldown.get(payload.playerId) ?? 0;
    if (Date.now() - lastSubmit < SUBMIT_COOLDOWN_MS) {
      throw new WsException('Submit too fast – slow down');
    }
    state.submitCooldown.set(payload.playerId, Date.now());

    // ── Resolve correct answer ─────────────────────────────────────────────
    const quiz = await this.quizModel.findById(room.quizId).exec();
    if (!quiz) throw new WsException('Quiz not found');

    const question = quiz.questions.find((q) => q.id === payload.questionId);
    if (!question) throw new WsException('Question not found');

    const option = question.options.find((o) => o.id === payload.selectedOptionId);
    const isCorrect = Boolean(option?.isCorrect);

    // Speed bonus: up to +50 extra if answered within first 50% of timeLimit
    let earnedScore = 0;
    if (isCorrect) {
      const speedBonus =
        payload.responseTime < question.timeLimit * 500 // half the time in ms
          ? Math.round(50 * (1 - payload.responseTime / (question.timeLimit * 1000)))
          : 0;
      earnedScore = question.points + speedBonus;
    }

    // ── Persist answer ────────────────────────────────────────────────────
    await this.playerAnswerModel.create({
      roomId: room._id,
      playerId: payload.playerId,
      questionId: payload.questionId,
      selectedOptionId: payload.selectedOptionId,
      isCorrect,
      responseTime: payload.responseTime,
      earnedScore,
    });

    // ── Update player stats ───────────────────────────────────────────────
    const playerUpdate = isCorrect
      ? { $inc: { score: earnedScore, streak: 1 } }
      : { $set: { streak: 0 }, $inc: { resetCount: 1 } };

    const player = await this.playerModel
      .findByIdAndUpdate(payload.playerId, playerUpdate, { new: true })
      .exec();

    const team = player?.team as 'red' | 'blue' | undefined;

    // ── Update team board ─────────────────────────────────────────────────
    let clearedTileIndex: number | null = null;
    let resetBoard = false;
    let winEvent: { winner: 'red' | 'blue' | 'tie' } | null = null;

    if (team && (team === 'red' || team === 'blue')) {
      const board = state.teamBoards[team];

      if (isCorrect) {
        // Find first locked tile (0-8 not yet cleared)
        for (let i = 0; i < BOARD_SIZE; i++) {
          if (!board.clearedTiles.has(i)) {
            board.clearedTiles.add(i);
            clearedTileIndex = i;
            break;
          }
        }

        // Check win condition
        if (board.clearedTiles.size === BOARD_SIZE) {
          board.tilesWonAt = Date.now();
          winEvent = { winner: team };
          // End the game
          await this.resolveWin(payload.roomId, team, state, onTimeout);
        }
      } else {
        // RESET the team board
        board.clearedTiles.clear();
        board.resets += 1;
        resetBoard = true;
      }
    }

    const leaderboard = await this.getLeaderboard(room._id.toString());

    return {
      player,
      isCorrect,
      earnedScore,
      leaderboard,
      shouldReset: !isCorrect,
      clearedTileIndex,
      resetBoard,
      team: team ?? null,
      winEvent,
    };
  }

  // ─── Admin Controls ──────────────────────────────────────────────────────

  async handleAdminControl(
    payload: AdminControlDto,
    onTimeout: (roomId: string, winner: 'red' | 'blue' | 'tie') => void,
  ) {
    // ── Host token check ──────────────────────────────────────────────────
    const state = this.roomState.get(payload.roomId);

    if (payload.action !== 'start') {
      // For non-start actions a state must already exist
      if (!state) throw new WsException('Room state not initialised');
      if (state.hostToken !== payload.hostToken) throw new WsException('Unauthorized: invalid host token');
    }

    const updates: Partial<Room> = {};

    if (payload.action === 'start') {
      // Load room + quiz to init in-memory state
      const room = await this.roomModel.findById(payload.roomId).exec();
      if (!room) throw new WsException('Room not found');

      const quiz = await this.quizModel.findById(room.quizId).exec();
      if (!quiz) throw new WsException('Quiz not found');

      if (!quiz.questions.length) throw new WsException('Quiz has no questions');

      // Init state if first start; validate token afterward
      if (!state) {
        // First start: token is implicitly accepted (room creator)
        this.roomState.init(
          payload.roomId,
          room.quizId.toString(),
          quiz.questions.length,
          payload.hostToken,
          room.settings.shuffleQuestions,
        );
      } else {
        // Resuming from paused
        if (state.hostToken !== payload.hostToken) throw new WsException('Unauthorized: invalid host token');
      }

      const s = this.roomState.get(payload.roomId)!;
      s.phase = 'playing';
      s.startedAt = s.startedAt ?? Date.now();

      // Start timer for current question
      const currentQ = quiz.questions[s.questionOrder[s.currentQuestionIndex]];
      const timeLimitMs = (currentQ?.timeLimit ?? 30) * 1000;
      s.timerEndsAt = Date.now() + timeLimitMs;

      // Clear any stale timer then schedule new one
      this.roomState.clearTimer(payload.roomId);
      const handle = setTimeout(async () => {
        await this.handleQuestionTimeout(payload.roomId, onTimeout);
      }, timeLimitMs);
      this.roomState.setTimerHandle(payload.roomId, handle);

      updates.status = 'playing';
      updates.startedAt = new Date(s.startedAt);
    }

    if (payload.action === 'pause') {
      state!.phase = 'paused';
      this.roomState.clearTimer(payload.roomId);
      updates.status = 'waiting';
    }

    if (payload.action === 'reset') {
      // Full game reset: boards, indices, timers
      const room = await this.roomModel.findById(payload.roomId).exec();
      const quiz = await this.quizModel.findById(room?.quizId).exec();
      const questionCount = quiz?.questions.length ?? 0;

      this.roomState.init(
        payload.roomId,
        state!.quizId,
        questionCount,
        payload.hostToken,
        room?.settings.shuffleQuestions ?? false,
      );

      // Reset all player stats
      await this.playerModel.updateMany(
        { roomId: payload.roomId },
        { $set: { score: 0, streak: 0, resetCount: 0 } },
      );

      updates.status = 'waiting';
      updates.currentQuestionIndex = 0;
    }

    if (payload.action === 'end') {
      this.roomState.clearTimer(payload.roomId);
      state!.phase = 'finished';

      // Determine winner by tiles cleared
      const winner = this.determineWinnerByTiles(payload.roomId);
      state!.winnerId = winner;

      updates.status = 'finished';
      updates.endedAt = new Date();
    }

    const room = await this.roomModel
      .findByIdAndUpdate(payload.roomId, updates, { new: true })
      .exec();

    if (!room) throw new WsException('Room not found');

    const snap = this.roomState.snapshot(payload.roomId);
    return { room, action: payload.action, snapshot: snap };
  }

  // ─── Question Timeout ────────────────────────────────────────────────────

  private async handleQuestionTimeout(
    roomId: string,
    onTimeout: (roomId: string, winner: 'red' | 'blue' | 'tie') => void,
  ) {
    const state = this.roomState.get(roomId);
    if (!state || state.phase !== 'playing') return;

    const quiz = await this.quizModel.findById(state.quizId).exec();
    if (!quiz) return;

    const nextIndex = state.currentQuestionIndex + 1;

    if (nextIndex >= quiz.questions.length) {
      // All questions exhausted → end game by tile count
      state.phase = 'finished';
      state.timerHandle = null;
      const winner = this.determineWinnerByTiles(roomId);
      state.winnerId = winner;
      await this.roomModel.findByIdAndUpdate(roomId, { status: 'finished', endedAt: new Date() }).exec();
      onTimeout(roomId, winner);
      return;
    }

    // Advance question
    state.currentQuestionIndex = nextIndex;
    await this.roomModel.findByIdAndUpdate(roomId, { currentQuestionIndex: nextIndex }).exec();

    const currentQ = quiz.questions[state.questionOrder[nextIndex]];
    const timeLimitMs = (currentQ?.timeLimit ?? 30) * 1000;
    state.timerEndsAt = Date.now() + timeLimitMs;

    const handle = setTimeout(async () => {
      await this.handleQuestionTimeout(roomId, onTimeout);
    }, timeLimitMs);
    this.roomState.setTimerHandle(roomId, handle);

    // Signal gateway to broadcast new question + updated timer
    onTimeout(roomId, null as unknown as 'red');
  }

  // ─── Win Resolution ──────────────────────────────────────────────────────

  private async resolveWin(
    roomId: string,
    winner: 'red' | 'blue',
    state: ReturnType<typeof this.roomState.get> & object,
    onTimeout: (roomId: string, winner: 'red' | 'blue' | 'tie') => void,
  ) {
    this.roomState.clearTimer(roomId);
    state.phase = 'finished';
    state.winnerId = winner;
    await this.roomModel.findByIdAndUpdate(roomId, { status: 'finished', endedAt: new Date() }).exec();
    onTimeout(roomId, winner);
  }

  private determineWinnerByTiles(roomId: string): 'red' | 'blue' | 'tie' {
    const state = this.roomState.get(roomId);
    if (!state) return 'tie';
    const redTiles = state.teamBoards.red.clearedTiles.size;
    const blueTiles = state.teamBoards.blue.clearedTiles.size;
    if (redTiles > blueTiles) return 'red';
    if (blueTiles > redTiles) return 'blue';
    return 'tie';
  }

  // ─── Queries ─────────────────────────────────────────────────────────────

  async getLeaderboard(roomId: string) {
    const players = await this.playerModel
      .find({ roomId: new Types.ObjectId(roomId) })
      .sort({ score: -1, resetCount: 1, streak: -1, joinedAt: 1 })
      .exec();

    return players.map((p) => ({
      id: p._id.toString(),
      nickname: p.nickname,
      team: p.team ?? null,
      score: p.score,
      resetCount: p.resetCount,
      streak: p.streak,
      connected: p.connected,
    }));
  }

  async getRoomState(roomKey: string) {
    const room = await this.findRoomByKey(roomKey);
    if (!room) throw new WsException('Room not found');

    const roomId = room.id.toString();
    const players = await this.playerModel.find({ roomId: new Types.ObjectId(roomId) }).exec();
    const leaderboard = await this.getLeaderboard(roomId);
    const snap = this.roomState.snapshot(roomId);

    const teamStats = players.reduce(
      (acc, player) => {
        const team = player.team ?? 'unassigned';
        const current = acc[team] ?? { total: 0, connected: 0 };
        current.total += 1;
        if (player.connected) current.connected += 1;
        acc[team] = current;
        return acc;
      },
      {} as Record<string, { total: number; connected: number }>,
    );

    return {
      room: {
        id: room.id,
        pin: room.pin,
        status: room.status,
        currentQuestionIndex: room.currentQuestionIndex,
        startedAt: room.startedAt ?? null,
        endedAt: room.endedAt ?? null,
        settings: room.settings,
      },
      stats: {
        totalPlayers: players.length,
        connectedPlayers: players.filter((p) => p.connected).length,
        teamStats,
      },
      leaderboard,
      realtimeState: snap,
    };
  }

  async getLeaderboardByKey(roomKey: string) {
    const room = await this.findRoomByKey(roomKey);
    if (!room) throw new WsException('Room not found');
    return this.getLeaderboard(room.id.toString());
  }

  async getPlayersByKey(
    roomKey: string,
    filters?: { team?: 'red' | 'blue' | 'unassigned'; connected?: boolean },
  ) {
    const room = await this.findRoomByKey(roomKey);
    if (!room) throw new WsException('Room not found');

    const query: Record<string, unknown> = { roomId: new Types.ObjectId(room.id) };
    if (filters?.team) {
      if (filters.team === 'unassigned') {
        query.$or = [{ team: null }, { team: { $exists: false } }];
      } else {
        query.team = filters.team;
      }
    }
    if (typeof filters?.connected === 'boolean') {
      query.connected = filters.connected;
    }

    const players = await this.playerModel.find(query).sort({ joinedAt: 1 }).exec();

    return players.map((p) => ({
      id: p._id.toString(),
      nickname: p.nickname,
      team: p.team ?? null,
      score: p.score,
      resetCount: p.resetCount,
      streak: p.streak,
      connected: p.connected,
      joinedAt: p.joinedAt ?? null,
    }));
  }

  /** Get quiz questions (stripped of isCorrect) for a room – safe to send to clients. */
  async getQuestionsForRoom(roomId: string) {
    const state = this.roomState.get(roomId);
    if (!state) return null;

    const quiz = await this.quizModel.findById(state.quizId).exec();
    if (!quiz) return null;

    return state.questionOrder.map((qi, displayIndex) => {
      const q = quiz.questions[qi];
      return {
        displayIndex,
        id: q.id,
        text: q.text,
        timeLimit: q.timeLimit,
        points: q.points,
        options: q.options.map((o) => ({ id: o.id, text: o.text })), // no isCorrect
      };
    });
  }
}
