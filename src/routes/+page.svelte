<script lang="ts">
    import { WebSocket } from "ws";
    import { onMount } from "svelte";
    import { batch, chunk, createRxBackwardReq, createRxForwardReq, createRxNostr, latestEach, now, sortEvents, uniq, type EventPacket } from "rx-nostr";
    import { zapPool } from "../stores/ZapPool";
    import { ZapReceipt } from "$lib/ZapReceipt";
    import { botRelay, dicRelay, localRelay } from "$lib/Relay";
    import { profilePool } from "../stores/ProfilePool";
    import { bufferTime } from "rxjs";
    import Loading from "./Loading.svelte";
    import ZapCardView from "./ZapCardView.svelte";
    import 'spinkit/spinkit.min.css'
    import { sinceDate } from "$lib/Helper";

    let follow: string[]; // nostr-japanese-users follow list
    onMount(() => {
        const rxNostr = createRxNostr({ websocketCtor: WebSocket });
        const forward = createRxForwardReq();
        const backward = createRxBackwardReq();
        const botPubkey = "087c51f1926f8d3cb4ff45f53a8ee2a8511cfe113527ab0e87f9c5821201a61e"; // nostr-japanese-users

        const addZapPool = (packet: EventPacket) => {
            const event = new ZapReceipt(packet.event);
            const existSenderInFollow = follow.find((item) => item === event.sender) !== undefined;
            const existReceiverInFollow = follow.find((item) => item === event.receiver) !== undefined;
            if ( existSenderInFollow || existReceiverInFollow ){
                $zapPool.unshift(event);
                $zapPool.sort((a, b) => { return b.created_at - a.created_at; });
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
        };

        rxNostr
            .use(forward, {relays: localRelay})
            .pipe(uniq())
            .subscribe({
                next: (packet) => { addZapPool(packet) }
            });

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
    {#if $zapPool.length > 0}
        <ZapCardView />
        <div class="sk-flow mx-auto my-3">
            <div class="sk-flow-dot"></div>
            <div class="sk-flow-dot"></div>
            <div class="sk-flow-dot"></div>
        </div>
    {:else}
        <Loading {follow} />
    {/if}
</main>

<style>
    .sk-flow {
        width: 6rem;
        height: 2rem;
    }

    .sk-flow-dot {
        width: 1rem;
        height: 1rem;
        background-color: #00aaff;
    }
</style>
