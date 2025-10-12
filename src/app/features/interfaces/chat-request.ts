export interface ChatRequest {
    query: string;
    modelName: string;
    conversationId: number | null;
    modelId: number;
    userName: string;
}
