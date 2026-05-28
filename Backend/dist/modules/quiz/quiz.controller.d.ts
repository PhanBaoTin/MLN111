import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizService } from './quiz.service';
export declare class QuizController {
    private readonly quizService;
    constructor(quizService: QuizService);
    create(dto: CreateQuizDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./quiz.schema").Quiz, {}, {}> & import("./quiz.schema").Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./quiz.schema").Quiz, {}, {}> & import("./quiz.schema").Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    parseDocx(file: Express.Multer.File): Promise<{
        questions: unknown[];
        warnings: string[];
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./quiz.schema").Quiz, {}, {}> & import("./quiz.schema").Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./quiz.schema").Quiz, {}, {}> & import("./quiz.schema").Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./quiz.schema").Quiz, {}, {}> & import("./quiz.schema").Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./quiz.schema").Quiz, {}, {}> & import("./quiz.schema").Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    update(id: string, dto: UpdateQuizDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./quiz.schema").Quiz, {}, {}> & import("./quiz.schema").Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./quiz.schema").Quiz, {}, {}> & import("./quiz.schema").Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("./quiz.schema").Quiz, {}, {}> & import("./quiz.schema").Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("./quiz.schema").Quiz, {}, {}> & import("./quiz.schema").Quiz & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
