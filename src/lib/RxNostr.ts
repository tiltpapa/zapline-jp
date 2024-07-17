import { WebSocket } from "ws";
import { createRxBackwardReq, createRxForwardReq, createRxNostr } from "rx-nostr";

export const rxNostr = createRxNostr({ websocketCtor: WebSocket });
export const forward = createRxForwardReq();
export const backward = createRxBackwardReq();
export const backwardZap = createRxBackwardReq();