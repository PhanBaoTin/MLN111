import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
export declare class PlayerAnswer {
    roomId: Types.ObjectId;
    playerId: Types.ObjectId;
    questionId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    responseTime: number;
    earnedScore: number;
}
export type PlayerAnswerDocument = HydratedDocument<PlayerAnswer>;
export declare const PlayerAnswerSchema: MongooseSchema<PlayerAnswer, import("mongoose").Model<PlayerAnswer, any, any, any, import("mongoose").Document<unknown, any, PlayerAnswer, any, {}> & PlayerAnswer & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PlayerAnswer, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<PlayerAnswer>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<PlayerAnswer> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
