export interface ChatResponse {
    query: string;
    answer: string;
    modelFamily: string;            
    promptToken: number;
    completionToken: number;
    totalToken: number;
    modelName: string;
    error: string | null;
    message: string | null;
}
