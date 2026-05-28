import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
export declare class Player {
    roomId: Types.ObjectId;
    socketId?: string | null;
    nickname: string;
    team?: 'red' | 'blue';
    score: number;
    streak: number;
    resetCount: number;
    connected: boolean;
    joinedAt?: Date;
}
export type PlayerDocument = HydratedDocument<Player>;
export declare const PlayerSchema: MongooseSchema<Player, import("mongoose").Model<Player, any, any, any, import("mongoose").Document<unknown, any, Player, any, {}> & Player & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Player, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Player>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Player> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
