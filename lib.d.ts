interface EventIdUpdatedCallback<T> {
    (eventId: number | undefined): Promise<{
        data: {
            eventId: number;
            output: T;
        };
    }>;
}
interface AllDataReadyCallback<T> {
    (eventId: number, data: T | undefined): void;
}
declare class EventIdProvider {
    private eventId;
    private isFetching;
    private subscribers;
    private subscriberId;
    constructor(host: string, pkey: string);
    subscribe<T>(eventIdUpdated: EventIdUpdatedCallback<T>, allDataReady: AllDataReadyCallback<T>): string;
    doFetch(): void;
    unsubscribe(id: string): void;
    updateEventId(to: number): boolean;
}
declare global {
    interface Window {
        eventIdProvider?: EventIdProvider;
    }
}
export declare const useViewEndpoint: <T>(host: string, publishableKey: string, viewEndpointId: string, key?: string | null, authKey?: string | null) => {
    data: T | undefined;
    isLoading: boolean;
    eventId: number | undefined;
};
declare type InvokeAPIEndpointSuccessResult<E> = {
    success: true;
    data: E;
};
declare type InvokeAPIEndpointErrorResult = {
    success: false;
    error: string;
};
export declare function getFormBodyFromJSON(json: Record<string, any>): FormData;
export declare const invokeAPIEndpoint: <E>(host: string, publishableKey: string, endpointId: string, body: FormData) => Promise<InvokeAPIEndpointErrorResult | InvokeAPIEndpointSuccessResult<E>>;
export {};
