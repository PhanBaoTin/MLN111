import { CreateRoomDto } from './dto/create-room.dto';
import { QuickCreateRoomDto } from './dto/quick-create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomService } from './room.service';
export declare class RoomController {
    private readonly roomService;
    constructor(roomService: RoomService);
    quickCreate(dto: QuickCreateRoomDto): Promise<{
        quiz: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../quiz/quiz.schema").Quiz, {}, {}> & import("../quiz/quiz.schema").Quiz & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("../quiz/quiz.schema").Quiz, {}, {}> & import("../quiz/quiz.schema").Quiz & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
        room: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
        hostToken: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    launchExisting(dto: import('./dto/launch-existing-room.dto').LaunchExistingRoomDto): Promise<{
        quiz: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../quiz/quiz.schema").Quiz, {}, {}> & import("../quiz/quiz.schema").Quiz & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("../quiz/quiz.schema").Quiz, {}, {}> & import("../quiz/quiz.schema").Quiz & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
        room: import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }, {}, {}> & import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        } & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
        hostToken: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    create(dto: CreateRoomDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    update(id: string, dto: UpdateRoomDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./room.schema").Room, {}, {}> & import("./room.schema").Room & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
