export interface ParsedOption {
    id: string;
    text: string;
    isCorrect: boolean;
}
export interface ParsedQuestion {
    id: string;
    text: string;
    type: 'single_choice';
    timeLimit: number;
    points: number;
    order: number;
    options: ParsedOption[];
}
