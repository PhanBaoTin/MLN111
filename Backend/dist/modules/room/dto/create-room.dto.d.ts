export declare class CreateRoomDto {
    pin: string;
    quizId: string;
    hostPlayerId: string;
    currentQuestionIndex?: number;
    shuffleQuestions?: boolean;
    shuffleOptions?: boolean;
    maxTeams?: number;
    globalTimeLimit?: number;
}
