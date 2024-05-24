import type { PageServerData } from "../$types";
import { WebSocket } from "ws";
import * as Nostr from "nostr-typedef";
import { createRxBackwardReq, createRxNostr, createRxOneshotReq, latestEach } from "rx-nostr";
import { botRelay } from "$lib/Relay";
import { error } from "@sveltejs/kit";

export const load: PageServerLoad = async () => {
    const rxNostrSS = createRxNostr({ websocketCtor: WebSocket });
    const backwardSS = createRxBackwardReq();
    const botPubkey = "087c51f1926f8d3cb4ff45f53a8ee2a8511cfe113527ab0e87f9c5821201a61e"; // nostr-japanese-users

    let follow; // follow list
    rxNostrSS
        .use(backwardSS, {relays: botRelay})
        .pipe(latestEach((packet) => packet.event.pubkey))
        .subscribe({
            next: (packet) => {
                const event: Nostr.Event = packet.event;
                const plist = event.tags.filter((item) => item[0] === "p");
                follow = plist.map(item => item[1]);
            },
            error: (err) => {
                error(500, "Cannot get follow list: " + err);
            }
        });
    backwardSS.emit({ kinds: [3], authors: [botPubkey], limit: 1 });
    backwardSS.over();

    return { follow };
};