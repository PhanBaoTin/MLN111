import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { Player, PlayerDocument } from './player.schema';

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel(Player.name) private readonly playerModel: Model<PlayerDocument>,
  ) {}

  async create(dto: CreatePlayerDto) {
    return this.playerModel.create({
      roomId: new Types.ObjectId(dto.roomId),
      nickname: dto.nickname,
      team: dto.team,
      score: 0,
      streak: 0,
      resetCount: 0,
      connected: true,
    });
  }

  async findAll(roomId?: string) {
    if (roomId) {
      return this.playerModel.find({ roomId: new Types.ObjectId(roomId) }).exec();
    }
    return this.playerModel.find().exec();
  }

  async findById(id: string) {
    const player = await this.playerModel.findById(id).exec();
    if (!player) {
      throw new NotFoundException('Player not found');
    }
    return player;
  }

  async update(id: string, dto: UpdatePlayerDto) {
    const player = await this.playerModel
      .findByIdAndUpdate(
        id,
        {
          ...dto,
          roomId: dto.roomId ? new Types.ObjectId(dto.roomId) : undefined,
        },
        { new: true },
      )
      .exec();

    if (!player) {
      throw new NotFoundException('Player not found');
    }
    return player;
  }

  async remove(id: string) {
    const player = await this.playerModel.findByIdAndDelete(id).exec();
    if (!player) {
      throw new NotFoundException('Player not found');
    }
    return player;
  }
}
