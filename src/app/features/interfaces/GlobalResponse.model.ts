export interface GlobalResponse<T> {
    message: string;
    statusCode: number;
    data: T;
    timestamp: string;
    traceId: string;
    error: any;
}
