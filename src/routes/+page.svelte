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
    import { bufferTime } from "rxjs";
    import Loading from "./Loading.svelte";
//  import 'spinkit/spinkit.min.css'
//  import 'checkbox.css/dist/css/inout/inout.min.css'
//  import { fly } from "svelte/transition";

    let follow: string[]; // nostr-japanese-users follow list
    onMount(() => {
        const rxNostr = createRxNostr({ websocketCtor: WebSocket });
//      rxNostr.addDefaultRelays(["wss://yabu.me", "wss://r.kojira.io"]);
        const forward = createRxForwardReq();
        const backward = createRxBackwardReq();
        const botPubkey = "087c51f1926f8d3cb4ff45f53a8ee2a8511cfe113527ab0e87f9c5821201a61e"; // nostr-japanese-users

        rxNostr
            .use(forward, {relays: localRelay})
            .pipe(uniq())
            .pipe(sortEvents(2 * 1000))
            .subscribe({
                next: (packet) => {
                    const event = new ZapReceipt(packet.event);
                    const existSenderInFollow = follow.find((item) => item === event.sender) !== undefined;
                    const existReceiverInFollow = follow.find((item) => item === event.receiver) !== undefined;
                    if ( existSenderInFollow || existReceiverInFollow ){
                        $zapPool.unshift(event);
                        zapPool.set($zapPool);

                        const existSenderInPool = ($profilePool.find((content) => content.pubkey === event.sender)) !== undefined;
                        const existReceiverInPool = ($profilePool.find((content) => content.pubkey === event.receiver)) !== undefined;
                        
                        if ( !existSenderInPool ) {
                            backward.emit({ kinds: [0], authors: [event.sender], limit: 1 });
                        }
                        if ( !existReceiverInPool ) {
                            backward.emit({ kinds: [0], authors: [event.receiver], limit: 1 });
                        }   
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
                    if ( event.kind === 3 ){
                        follow = event.tags.filter((item) => item[0] === "p")?.map(item => item[1]);
                        console.debug('[Follow]', follow);
                        if (follow !== undefined){
                            const sinceDate = Math.floor(Date.now() / 1000) - (6 * 60 * 60);
                            forward.emit({ kinds:[9735], since: sinceDate });
                        }
                    }else if ( event.kind === 0 ){
                        let metadata = JSON.parse(event.content);
                        metadata.pubkey = event.pubkey;
                        $profilePool.push(metadata);
                        profilePool.set($profilePool);
                    }
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
        <Loading follow />
<!--    <div class="container p-3" out:fly={{y: 100}}>
            <div class="row gy-4 loading-row-h">
                <div class="col-3 col-sm-4 ms-auto text-end">
                    {#if follow}
                        <input type="checkbox" class="checkbox-inout" checked readonly/>
                    {:else}
                        <div class="sk-circle">
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                        </div>
                    {/if}
                </div>
                <div class="col-9 col-sm-8 mx-auto">Collecting a List of Japanese users</div>
                <div class="col-3 col-sm-4 ms-auto text-end">
                    {#if follow}
                        <div class="sk-circle">
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                            <div class="sk-circle-dot"></div>
                        </div>
                    {:else}
                        <input type="checkbox" class="checkbox-inout" readonly/>
                    {/if}
                </div>
                <div class="col-9 col-sm-8 mx-auto">Collecting Zap event & Sorting</div>
            </div>
        </div>-->
    {/each}
</main>

<style>
/*  :root {
        --sk-size: 1.5rem;
        --sk-color: #00ff00;
    }

    .loading-row-h {
        height: var(--sk-size);
    }

    .sk-circle {
        margin-left: auto;
    }*/
</style>
