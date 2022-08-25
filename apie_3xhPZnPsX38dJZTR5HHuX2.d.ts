export declare const callUntitledAPIEndpoint: (publishableKey: string, params: {
    name: string;
}) => Promise<{
    success: false;
    error: string;
} | {
    success: true;
    data: string;
}>;
