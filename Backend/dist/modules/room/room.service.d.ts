import { Model, Types } from 'mongoose';
import { Quiz, QuizDocument } from '../quiz/quiz.schema';
import { CreateRoomDto } from './dto/create-room.dto';
import { QuickCreateRoomDto } from './dto/quick-create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room, RoomDocument } from './room.schema';
export declare class RoomService {
    private readonly roomModel;
    private readonly quizModel;
    constructor(roomModel: Model<RoomDocument>, quizModel: Model<QuizDocument>);
    create(dto: CreateRoomDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    quickCreate(dto: QuickCreateRoomDto): Promise<{
        quiz: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
        room: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
        hostToken: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    launchExisting(dto: import('./dto/launch-existing-room.dto').LaunchExistingRoomDto): Promise<{
        quiz: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
        room: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: Types.ObjectId;
        }>;
        hostToken: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    update(id: string, dto: UpdateRoomDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Room, {}, {}> & Room & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
}
