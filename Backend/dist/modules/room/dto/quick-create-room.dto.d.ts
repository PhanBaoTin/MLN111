import { CreateQuizQuestionDto } from '../../quiz/dto/create-quiz.dto';
export declare class QuickCreateRoomDto {
    title: string;
    description?: string;
    imageBase64?: string;
    visibility?: 'public' | 'private';
    questions: CreateQuizQuestionDto[];
    pin: string;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    maxPlayers?: number;
}
