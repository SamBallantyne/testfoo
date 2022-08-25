export declare const callOneAss: (publishableKey: string, params: {
    name: string;
}) => Promise<{
    success: false;
    error: string;
} | {
    success: true;
    data: string;
}>;
