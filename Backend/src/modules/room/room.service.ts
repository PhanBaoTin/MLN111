import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { Quiz, QuizDocument } from '../quiz/quiz.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { QuickCreateRoomDto } from './dto/quick-create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room, RoomDocument } from './room.schema';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
    @InjectModel(Quiz.name) private readonly quizModel: Model<QuizDocument>,
  ) {}

  async create(dto: CreateRoomDto) {
    return this.roomModel.create({
      pin: dto.pin,
      quizId: new Types.ObjectId(dto.quizId),
      hostPlayerId: dto.hostPlayerId,
      status: 'waiting',
      currentQuestionIndex: dto.currentQuestionIndex ?? 0,
      settings: {
        shuffleQuestions: dto.shuffleQuestions ?? false,
        shuffleOptions: dto.shuffleOptions ?? false,
        maxPlayers: dto.maxPlayers,
      },
    });
  }

  /**
   * Creates a quiz and a room in one shot.
   * Returns { quiz, room, hostToken } — the hostToken is stored by the admin page.
   */
  async quickCreate(dto: QuickCreateRoomDto) {
    const hostToken = randomUUID();

    const quiz = await this.quizModel.create({
      title: dto.title,
      description: dto.description,
      visibility: dto.visibility ?? 'private',
      imageBase64: dto.imageBase64,
      questions: dto.questions,
    });

    const room = await this.roomModel.create({
      pin: dto.pin,
      quizId: quiz._id,
      hostPlayerId: 'admin', // will be updated when host joins via socket
      status: 'waiting',
      currentQuestionIndex: 0,
      settings: {
        shuffleQuestions: dto.shuffleQuestions ?? false,
        shuffleOptions: dto.shuffleOptions ?? false,
        maxPlayers: dto.maxPlayers,
      },
    });

    return {
      quiz,
      room,
      hostToken,
    };
  }

  async launchExisting(dto: import('./dto/launch-existing-room.dto').LaunchExistingRoomDto) {
    const hostToken = randomUUID();

    const quiz = await this.quizModel.findById(dto.quizId).exec();
    if (!quiz) throw new NotFoundException('Quiz not found');

    const room = await this.roomModel.create({
      pin: dto.pin,
      quizId: quiz._id,
      hostPlayerId: 'admin',
      status: 'waiting',
      currentQuestionIndex: 0,
      settings: {
        shuffleQuestions: dto.shuffleQuestions ?? false,
        shuffleOptions: dto.shuffleOptions ?? false,
        maxPlayers: dto.maxPlayers,
      },
    });

    return {
      quiz,
      room,
      hostToken,
    };
  }

  async findAll() {
    return this.roomModel.find().exec();
  }

  async findById(id: string) {
    const room = await this.roomModel.findById(id).exec();
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async update(id: string, dto: UpdateRoomDto) {
    const room = await this.roomModel
      .findByIdAndUpdate(
        id,
        {
          ...dto,
          quizId: dto.quizId ? new Types.ObjectId(dto.quizId) : undefined,
          settings: {
            shuffleQuestions: dto.shuffleQuestions,
            shuffleOptions: dto.shuffleOptions,
            maxPlayers: dto.maxPlayers,
          },
        },
        { new: true },
      )
      .exec();

    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async remove(id: string) {
    const room = await this.roomModel.findByIdAndDelete(id).exec();
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }
}
