import { Model } from 'mongoose';
import type { ParsedQuestion } from './types/parsed-question';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { Quiz, QuizDocument } from './quiz.schema';
export declare class QuizService {
    private readonly quizModel;
    constructor(quizModel: Model<QuizDocument>);
    create(dto: CreateQuizDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    findById(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    update(id: string, dto: UpdateQuizDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Quiz, {}, {}> & Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    parseDocx(buffer: Buffer): Promise<{
        questions: ParsedQuestion[];
        warnings: string[];
    }>;
}
