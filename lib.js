var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { useEffect, useState } from 'react';
class EventIdProvider {
    constructor(host, pkey) {
        this.eventId = undefined;
        this.isFetching = false;
        this.subscribers = [];
        this.subscriberId = 0;
        const protocol = host.includes("localhost") ? "ws" : "wss";
        const ws = new WebSocket(`${protocol}://${host}?authKey=${pkey}`);
        ws.onmessage = (message) => {
            try {
                if (typeof message.data !== 'string') {
                    return;
                }
                const json = JSON.parse(message.data);
                const { latestEventId } = json;
                if (typeof latestEventId !== 'number') {
                    return;
                }
                const didUpdate = this.updateEventId(latestEventId);
                if (!this.isFetching && didUpdate) {
                    console.log('updated event id from websocket');
                    this.doFetch();
                }
            }
            catch (error) {
                console.log('error parsing websocket message?', error);
            }
        };
        ws.onopen = (event) => {
            console.log('open', event);
            ws.send('heyhihello');
        };
        ws.onerror = (event) => {
            console.log('websocket error', event);
        };
        ws.onclose = (closeevent) => {
            console.log('closeevent', closeevent);
        };
    }
    subscribe(eventIdUpdated, allDataReady) {
        const s = {
            eventIdUpdated,
            allDataReady,
            id: `subscriber ${this.subscriberId += 1}`
        };
        this.subscribers.push(s);
        if (!this.isFetching) {
            this.doFetch();
        }
        return s.id;
    }
    doFetch() {
        if (this.subscribers.length === 0) {
            return;
        }
        if (this.isFetching) {
            console.warn('Tried to start doFetch() when another fetch was ongoing');
            return;
        }
        const eventId = this.eventId;
        if (eventId === undefined) {
            return;
        }
        /**
         * Copy fields into local variables, as they may change between now
         */
        this.isFetching = true;
        let participants = this.subscribers.slice(); // get a new copy of the array so that if new subscribers are added
        const allFetches = participants.map(subscriber => subscriber.eventIdUpdated(eventId));
        Promise.all(allFetches).then(results => {
            if (results.length !== participants.length) {
                console.error('Got a different number of fetch results than participants (', results.length, 'vs', participants.length, ')');
            }
            participants.forEach((s, i) => {
                s.allDataReady(eventId !== null && eventId !== void 0 ? eventId : results[i].data.eventId, results[i].data.output);
            });
            return results[0].data.eventId;
        }).then((resultEventId) => {
            if (this.eventId === undefined) {
                console.log('result event id', resultEventId);
                this.eventId = resultEventId;
            }
            this.isFetching = false;
            const subscribersHaveChanged = participants.length !== this.subscribers.length;
            const eventIdHasChanged = eventId !== this.eventId;
            if (subscribersHaveChanged || eventIdHasChanged) {
                this.doFetch();
            }
        });
    }
    unsubscribe(id) {
        this.subscribers = this.subscribers.filter(s => s.id !== id);
    }
    updateEventId(to) {
        if (this.eventId === undefined || this.eventId < to) {
            this.eventId = to;
            if (!this.isFetching) {
                this.doFetch();
            }
            else {
                console.log('event id updated but fetch is in progress');
            }
            return true;
        }
        return false;
    }
}
export const useViewEndpoint = (host, publishableKey, viewEndpointId, key, authKey) => {
    const [eventId, setEventId] = useState(undefined);
    const [isLoading, setLoading] = useState(false);
    const [data, setData] = useState(undefined);
    useEffect(() => {
        if (!window.eventIdProvider) {
            window.eventIdProvider = new EventIdProvider(host, publishableKey);
        }
        if (key === null || authKey === null) {
            return;
        }
        const subscriptionId = window.eventIdProvider.subscribe((eventId) => {
            setLoading(true);
            let url = `https://${host}/view-endpoints/${viewEndpointId}/view?`;
            if (eventId) {
                url += `&eventId=${eventId}`;
            }
            if (key) {
                url += `&key=${encodeURIComponent(key)}`;
            }
            if (authKey) {
                url += `&authKey=${encodeURIComponent(authKey)}`;
            }
            return fetch(url, { headers: { Authorization: `Bearer ${publishableKey}` } }).then(res => res.json()).catch(error => {
                console.log('error fetching view', error);
                return undefined;
            });
        }, (eventId, data) => {
            setEventId(eventId);
            setLoading(false);
            setData(data);
        });
        return () => {
            var _a;
            (_a = window.eventIdProvider) === null || _a === void 0 ? void 0 : _a.unsubscribe(subscriptionId);
        };
    }, [host, publishableKey, viewEndpointId, key, authKey]);
    return { data, isLoading, eventId };
};
export function getFormBodyFromJSON(json) {
    const form = new FormData();
    Object.keys(json).forEach(key => {
        if (json[key] === undefined) { // don't add (e.g.) foo = 'undefined' to the form
            return;
        }
        if (json[key] instanceof File) {
            form.append(key, json[key]);
        }
        else {
            form.append(key, JSON.stringify(json[key]));
        }
    });
    return form;
}
export const invokeAPIEndpoint = (host, publishableKey, endpointId, body) => __awaiter(void 0, void 0, void 0, function* () {
    if (!window.eventIdProvider) {
        window.eventIdProvider = new EventIdProvider(host, publishableKey);
    }
    return fetch(`https://${host}/api-endpoints/${endpointId}/call`, {
        headers: {
            Authorization: `Bearer ${publishableKey}`
        },
        method: 'POST',
        body
    }).then(res => res.json()).then(json => {
        var _a;
        if (json.success && json.data.eventId) {
            (_a = window.eventIdProvider) === null || _a === void 0 ? void 0 : _a.updateEventId(json.data.eventId);
            return { success: true, data: json.data.output };
        }
        return { success: false, error: json.error.message };
    });
});
