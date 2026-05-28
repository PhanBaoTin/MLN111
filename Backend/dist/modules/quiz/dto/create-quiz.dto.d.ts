export declare class CreateQuizOptionDto {
    id: string;
    text: string;
    isCorrect: boolean;
}
export declare class CreateQuizQuestionDto {
    id: string;
    text: string;
    type: 'single_choice';
    timeLimit: number;
    points: number;
    order: number;
    options: CreateQuizOptionDto[];
}
export declare class CreateQuizDto {
    title: string;
    description?: string;
    visibility: 'public' | 'private';
    imageBase64?: string;
    questions: CreateQuizQuestionDto[];
}
