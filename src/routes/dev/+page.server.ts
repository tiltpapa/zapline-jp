import type { PageServerData } from "../$types";
import { WebSocket } from "ws";
import * as Nostr from "nostr-typedef";
import { createRxNostr, createRxOneshotReq } from "rx-nostr";

export const load: PageServerLoad = async () => {
    const rxNostrSS = createRxNostr({ websocketCtor: WebSocket });
    const backwardSS = createRxOneshotReq();
};