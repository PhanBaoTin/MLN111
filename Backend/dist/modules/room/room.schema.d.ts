import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
export type RoomStatus = 'waiting' | 'playing' | 'finished';
export declare class RoomSettings {
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    maxTeams: number;
    globalTimeLimit: number;
}
export declare class Room {
    pin: string;
    quizId: Types.ObjectId;
    hostPlayerId: string;
    status: RoomStatus;
    currentQuestionIndex: number;
    startedAt?: Date;
    endedAt?: Date;
    settings: RoomSettings;
}
export type RoomDocument = HydratedDocument<Room>;
export declare const RoomSchema: MongooseSchema<Room, import("mongoose").Model<Room, any, any, any, import("mongoose").Document<unknown, any, Room, any, {}> & Room & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Room, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Room>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Room> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
