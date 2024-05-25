<script lang="ts">
    import { WebSocket } from "ws";
//  import * as Nostr from "nostr-typedef";
    import { onMount } from "svelte";
    import { batch, chunk, createRxBackwardReq, createRxForwardReq, createRxNostr, latestEach, sortEvents, uniq } from "rx-nostr";
    import ZapCard from "./ZapCard.svelte";
    import { zapPool } from "../stores/ZapPool";
    import { ZapReceipt } from "$lib/ZapReceipt";
    import { botRelay, dicRelay, localRelay } from "$lib/Relay";
    import { profilePool } from "../stores/ProfilePool";
    import { bufferCount, bufferTime } from "rxjs";

    onMount(() => {
        const rxNostr = createRxNostr({ websocketCtor: WebSocket });
//      rxNostr.addDefaultRelays(["wss://yabu.me", "wss://r.kojira.io"]);
        const forward = createRxForwardReq();
        const backward = createRxBackwardReq();
        const botPubkey = "087c51f1926f8d3cb4ff45f53a8ee2a8511cfe113527ab0e87f9c5821201a61e"; // nostr-japanese-users
        let follow: string[]; // nostr-japanese-users follow list

        rxNostr
            .use(forward, {relays: localRelay})
            .pipe(uniq())
            .pipe(sortEvents(1 * 1000))
            .subscribe({
                next: (packet) => {
                    const event = new ZapReceipt(packet.event);
                    $zapPool.unshift(event);
                    zapPool.set($zapPool);

                    const existSenderInPool = ($profilePool.find((content) => content.pubkey === $zapPool[0].sender)) !== undefined;
                    const existReceiverInPool = ($profilePool.find((content) => content.pubkey === $zapPool[0].receiver)) !== undefined;
                    
                    if ( !existSenderInPool ) {
                        backward.emit({ kinds: [0], authors: [$zapPool[0].sender], limit: 1});
                    }
                    if ( !existReceiverInPool ) {
                        backward.emit({ kinds: [0], authors: [$zapPool[0].receiver], limit: 1});
                    }
                }
            });
//      forward.emit({ kinds:[9735], limit: 10 });

        const batcher = backward
                            .pipe(
                                bufferTime(1 * 1000), 
                                batch(), 
                                chunk(
                                    (filters) => filters.length > 10,
                                    (filters) => {
                                        const pile = [...filters];
                                        const chunks = [];

                                        while (pile.length > 0) {
                                            chunks.push(pile.splice(0, 10));
                                        }

                                        return chunks;
                                    }
                            ));
        rxNostr
            .use(batcher, {relays: dicRelay})
            .pipe(latestEach((packet) => packet.event.pubkey))
            .subscribe({
                next: (packet) => {
                    const event = packet.event;
                    if (event.kind === 3){
                        follow = event.tags.filter((item) => item[0] === "p")?.map(item => item[1]);
                        console.debug('[Follow]', follow);
                        if (follow !== undefined){
                            forward.emit({ kinds:[9735], limit: 20 });
                        }
                    }
                    let metadata = JSON.parse(event.content);
                    metadata.pubkey = event.pubkey;
                    $profilePool.push(metadata);
                    profilePool.set($profilePool);
                }    
            });
        backward.emit({ kinds: [3], authors: [botPubkey], limit: 1 }, {relays: botRelay});

        return () => rxNostr.dispose();
    });
</script>

<main>
    {#each $zapPool as event, i (event.id)}
        <ZapCard {event} />
    {:else}
        <p class="text-center"><i>loading...</i></p>
    {/each}
</main>

<style>
    main {
        width: 100%;
        padding: 0;
    }

    @media (min-width: 768px) {
        main {
            width: 768px;
            margin: 0 auto;
        }
    }
</style>
