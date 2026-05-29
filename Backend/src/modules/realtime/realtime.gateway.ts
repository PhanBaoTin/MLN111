import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AdminControlDto } from './dto/admin-control.dto';
import { AnswerQuestionDto } from './dto/answer-question.dto';
import { GetSnapshotDto } from './dto/get-snapshot.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { LeaderboardDto } from './dto/leaderboard.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';
import { RealtimeService } from './realtime.service';

const WS_PIPE = new ValidationPipe({
  whitelist: true,
  transform: true,
  forbidUnknownValues: false,
});

@WebSocketGateway({
  cors: { origin: true, credentials: true },
})
export class RealtimeGateway implements OnGatewayInit {
  @WebSocketServer()
  server: Server;

  constructor(private readonly realtimeService: RealtimeService) {}

  afterInit(_server: Server) {
    // Gateway is ready
  }

  // ─── Connection lifecycle ────────────────────────────────────────────────

  handleConnection(client: Socket) {
    client.emit('socket:connected', { socketId: client.id });
  }

  async handleDisconnect(client: Socket) {
    const result = await this.realtimeService.markDisconnected(client.id);
    
    // Broadcast player left and updated leaderboard to the room
    if (result.player && result.player.roomId) {
      const roomId = result.player.roomId.toString();
      this.server.to(roomId).emit('room:player-left', {
        socketId: client.id,
        playerId: result.player.id,
        connected: false,
      });

      const leaderboard = await this.realtimeService.getLeaderboard(roomId);
      this.server.to(roomId).emit('game:leaderboard', { roomId, leaderboard });
    }
  }

  // ─── Room join / leave ───────────────────────────────────────────────────

  @UsePipes(WS_PIPE)
  @SubscribeMessage('room:info')
  async handleRoomInfo(@MessageBody() payload: { key: string }) {
    try {
      const info = await this.realtimeService.getRoomInfoByKey(payload.key);
      return { ok: true, info };
    } catch (err) {
      return { ok: false, message: (err as Error).message };
    }
  }

  @SubscribeMessage('room:join')
  async handleRoomJoin(@ConnectedSocket() client: Socket, @MessageBody() payload: JoinRoomDto) {
    const { room, player } = await this.realtimeService.joinRoom(payload, client.id);
    const roomId = room.id.toString();
    client.join(roomId);

    this.server.to(roomId).emit('room:player-joined', {
      roomId,
      player: {
        id: player._id.toString(),
        nickname: player.nickname,
        team: player.team ?? null,
        score: player.score,
        streak: player.streak,
      },
    });

    const leaderboard = await this.realtimeService.getLeaderboard(roomId);
    this.server.to(roomId).emit('game:leaderboard', { roomId, leaderboard });

    return { ok: true, roomId, playerId: player._id.toString(), team: player.team };
  }

  @UsePipes(WS_PIPE)
  @SubscribeMessage('room:leave')
  async handleRoomLeave(@ConnectedSocket() client: Socket, @MessageBody() payload: LeaveRoomDto) {
    client.leave(payload.roomId);
    const { player, roomId } = await this.realtimeService.leaveRoom(payload, client.id);
    this.server.to(roomId).emit('room:player-left', {
      socketId: client.id,
      playerId: payload.playerId,
      connected: player?.connected ?? false,
    });

    const leaderboard = await this.realtimeService.getLeaderboard(roomId);
    this.server.to(roomId).emit('game:leaderboard', { roomId, leaderboard });

    return { ok: true, roomId, playerId: payload.playerId };
  }

  // ─── Snapshot / Reconnect ────────────────────────────────────────────────

  @UsePipes(WS_PIPE)
  @SubscribeMessage('room:snapshot')
  async handleSnapshot(@ConnectedSocket() client: Socket, @MessageBody() payload: GetSnapshotDto) {
    // Re-join the socket room so they receive subsequent events
    client.join(payload.roomId);

    const data = await this.realtimeService.getSnapshot(payload, client.id);
    const questions = await this.realtimeService.getQuestionsForRoom(payload.roomId);

    // If a player successfully reconnected, broadcast player joined to the room
    if (data.reconnectedPlayer) {
      this.server.to(payload.roomId).emit('room:player-joined', {
        roomId: payload.roomId,
        player: {
          id: data.reconnectedPlayer._id.toString(),
          nickname: data.reconnectedPlayer.nickname,
          team: data.reconnectedPlayer.team ?? null,
          score: data.reconnectedPlayer.score,
          streak: data.reconnectedPlayer.streak,
        },
      });

      // Also broadcast updated leaderboard to keep everyone in sync
      const leaderboard = await this.realtimeService.getLeaderboard(payload.roomId);
      this.server.to(payload.roomId).emit('game:leaderboard', { roomId: payload.roomId, leaderboard });
    }

    client.emit('room:state-snapshot', { ...data, questions });
    return { ok: true };
  }

  // ─── Answer ──────────────────────────────────────────────────────────────

  @UsePipes(WS_PIPE)
  @SubscribeMessage('game:answer')
  async handleAnswer(@ConnectedSocket() client: Socket, @MessageBody() payload: AnswerQuestionDto) {
    const onTimeout = this.buildTimeoutCallback();

    const result = await this.realtimeService.submitAnswer(payload, onTimeout);

    // Answer result (only to the answering player's room for full context,
    // but board update goes to everyone in the room)
    this.server.to(payload.roomId).emit('game:answer-result', {
      roomId: payload.roomId,
      playerId: payload.playerId,
      questionId: payload.questionId,
      selectedOptionId: payload.selectedOptionId,
      responseTime: payload.responseTime,
      isCorrect: result.isCorrect,
      earnedScore: result.earnedScore,
      streak: result.player?.streak ?? 0,
      score: result.player?.score ?? 0,
      team: result.team,
      socketId: client.id,
    });

    // Board update
    if (result.clearedTileIndex !== null || result.resetBoard) {
      this.server.to(payload.roomId).emit('game:board-update', {
        roomId: payload.roomId,
        team: result.team,
        clearedTileIndex: result.clearedTileIndex,
        resetBoard: result.resetBoard,
        clearedTiles: this.getBoardSnapshot(payload.roomId, result.team as string),
        resets: this.getTeamResets(payload.roomId, result.team as string),
      });
    }

    // Reset event (backwards compat + streak reset notification)
    if (result.shouldReset) {
      this.server.to(payload.roomId).emit('game:reset', {
        roomId: payload.roomId,
        playerId: payload.playerId,
        team: result.team,
      });
    }

    // Leaderboard
    this.server.to(payload.roomId).emit('game:leaderboard', {
      roomId: payload.roomId,
      leaderboard: result.leaderboard,
    });

    // Win event
    if (result.winEvent) {
      this.server.to(payload.roomId).emit('game:winner', {
        roomId: payload.roomId,
        winner: result.winEvent.winner,
      });
    }

    return { ok: true };
  }

  // ─── Leaderboard poll ────────────────────────────────────────────────────

  @UsePipes(WS_PIPE)
  @SubscribeMessage('game:leaderboard')
  async handleLeaderboard(@MessageBody() payload: LeaderboardDto) {
    const leaderboard = await this.realtimeService.getLeaderboard(payload.roomId);
    this.server.to(payload.roomId).emit('game:leaderboard', { roomId: payload.roomId, leaderboard });
    return { ok: true };
  }

  // ─── Admin controls ──────────────────────────────────────────────────────

  @UsePipes(WS_PIPE)
  @SubscribeMessage('admin:control')
  async handleAdminControl(@MessageBody() payload: AdminControlDto) {
    const onTimeout = this.buildTimeoutCallback();
    const result = await this.realtimeService.handleAdminControl(payload, onTimeout);

    // Emit action event to the whole room
    this.server.to(payload.roomId).emit(`admin:${payload.action}`, {
      action: payload.action,
      snapshot: result.snapshot,
      roomStatus: result.room.status,
    });

    // Also send updated questions list if starting
    if (payload.action === 'start') {
      const questions = await this.realtimeService.getQuestionsForRoom(payload.roomId);
      this.server.to(payload.roomId).emit('game:questions', {
        roomId: payload.roomId,
        questions,
        currentIndex: result.snapshot?.currentQuestionIndex ?? 0,
        timerEndsAt: result.snapshot?.timerEndsAt ?? null,
      });
    }

    return { ok: true, action: payload.action };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  /**
   * Builds a callback that the service calls when a question times out
   * or a winner is determined.  The callback has a closure over `this.server`.
   */
  private buildTimeoutCallback() {
    return (roomId: string, winner: string | 'tie' | null) => {
      if (winner !== null) {
        // Game over (win or time-based end)
        this.server.to(roomId).emit('game:winner', { roomId, winner });
      } else {
        // Question advanced – send new question info
        void this.realtimeService.getQuestionsForRoom(roomId).then((questions) => {
          if (!questions) return;
          void this.realtimeService['roomState'].get(roomId); // just to read state
          const snap = this.realtimeService['roomState'].snapshot(roomId);
          this.server.to(roomId).emit('game:next-question', {
            roomId,
            currentIndex: snap?.currentQuestionIndex ?? 0,
            timerEndsAt: snap?.timerEndsAt ?? null,
            currentQuestion: questions[(snap?.currentQuestionIndex as number) ?? 0],
          });
        });
      }
    };
  }

  private getBoardSnapshot(roomId: string, team: string): number[] {
    const state = this.realtimeService['roomState'].get(roomId);
    return state && state.teamBoards[team] ? Array.from(state.teamBoards[team].clearedTiles) : [];
  }

  private getTeamResets(roomId: string, team: string): number {
    const state = this.realtimeService['roomState'].get(roomId);
    return state?.teamBoards[team]?.resets ?? 0;
  }
}
