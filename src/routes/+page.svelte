<script lang="ts">
    import { WebSocket } from "ws";
//  import * as Nostr from "nostr-typedef";
    import { onMount } from "svelte";
    import { batch, createRxBackwardReq, createRxForwardReq, createRxNostr, latestEach, sortEvents, uniq } from "rx-nostr";
    import ZapCard from "./ZapCard.svelte";
    import { zapPool } from "../stores/ZapPool";
    import { ZapReceipt } from "$lib/ZapReceipt";
    import { dicRelay, localRelay } from "$lib/Relay";
    import { profilePool } from "../stores/profilePool";
    import { bufferTime } from "rxjs";

    onMount(() => {
        const rxNostr = createRxNostr({ websocketCtor: WebSocket });
//      rxNostr.addDefaultRelays(["wss://yabu.me", "wss://r.kojira.io"]);
        const forward = createRxForwardReq();
        const backward = createRxBackwardReq();

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
                    
                    let authorArray = [];
                    if ( !existSenderInPool ) {
                        authorArray.push($zapPool[0].sender);
                    }
                    if ( !existReceiverInPool ) {
                        authorArray.push($zapPool[0].receiver);
                    }
                    if ( authorArray.length !== 0 ) {
                        backward.emit({
                            kinds: [0],
                            authors: authorArray,
                            limit: 1
                        });
                    }
                }
            });
        forward.emit({ kinds:[9735], limit: 10 });

        const batcher = backward.pipe(bufferTime(1000), batch());
        rxNostr
            .use(batcher, {relays: dicRelay})
            .pipe(latestEach((packet) => packet.event.pubkey))
            .subscribe({
                next: (packet) => {
                    const event = packet.event;
                    let metadata = JSON.parse(event.content);
                    metadata.pubkey = event.pubkey;
                    $profilePool.push(metadata);
                    profilePool.set($profilePool);
                }    
            });

        return () => rxNostr.dispose();
    });
</script>

<main>
    {#each $zapPool as event, i (event.id)}
        <ZapCard {event} />
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
