export interface ChatResponse {
    query: string;
    answer: string;
    modelName: string;
    inputToken: number;
    outPutToken: number;
    totalToken: number;
    conversationId: number;
    title: string;
    error: string | null;
    streamId?: string;
}
