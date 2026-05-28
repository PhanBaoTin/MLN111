import { HydratedDocument } from 'mongoose';
export declare class QuizOption {
    id: string;
    text: string;
    isCorrect: boolean;
}
export declare const QuizOptionSchema: import("mongoose").Schema<QuizOption, import("mongoose").Model<QuizOption, any, any, any, import("mongoose").Document<unknown, any, QuizOption, any, {}> & QuizOption & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, QuizOption, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<QuizOption>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<QuizOption> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class QuizQuestion {
    id: string;
    text: string;
    type: 'single_choice';
    timeLimit: number;
    points: number;
    order: number;
    options: QuizOption[];
}
export declare const QuizQuestionSchema: import("mongoose").Schema<QuizQuestion, import("mongoose").Model<QuizQuestion, any, any, any, import("mongoose").Document<unknown, any, QuizQuestion, any, {}> & QuizQuestion & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, QuizQuestion, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<QuizQuestion>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<QuizQuestion> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
export declare class Quiz {
    title: string;
    description?: string;
    visibility: 'public' | 'private';
    imageBase64?: string;
    questions: QuizQuestion[];
}
export type QuizDocument = HydratedDocument<Quiz>;
export declare const QuizSchema: import("mongoose").Schema<Quiz, import("mongoose").Model<Quiz, any, any, any, import("mongoose").Document<unknown, any, Quiz, any, {}> & Quiz & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Quiz, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Quiz>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Quiz> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
