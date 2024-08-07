<script lang="ts">
    import { onMount } from "svelte";
    import { batch, chunk, latestEach, uniq, type EventPacket } from "rx-nostr";
    import { zapPool } from "../stores/ZapPool";
    import { ZapReceipt } from "$lib/ZapReceipt";
    import { backward, backwardZap, forward, rxNostr } from "$lib/RxNostr";
    import { botRelay, dicRelay, localRelay } from "$lib/Relay";
    import { profilePool } from "../stores/ProfilePool";
    import { bufferTime } from "rxjs";
    import Loading from "./Loading.svelte";
    import ZapCardView from "./ZapCardView.svelte";
    import 'spinkit/spinkit.min.css'
//  import { sinceDate, untilDate } from "$lib/Helper";
    import More from "./More.svelte";
    import { lastUntilDate, sinceDate, untilDate } from "../stores/Date";
    import { unixTimeFormat } from "$lib/Helper";

    let follow: string[]; // nostr-japanese-users follow list
    onMount(() => {
        const botPubkey = "087c51f1926f8d3cb4ff45f53a8ee2a8511cfe113527ab0e87f9c5821201a61e"; // nostr-japanese-users

        const addZapPool = (packet: EventPacket) => {
            const event = new ZapReceipt(packet.event);

            if ( event.created_at < $untilDate ) {
                untilDate.set(event.created_at);
            }

            const existZapInPool = $zapPool.find((item) => item.id === event.id) !== undefined;
            if (existZapInPool) {
                return;
            }

            const existSenderInFollow = follow.find((item) => item === event.sender) !== undefined;
            const existReceiverInFollow = follow.find((item) => item === event.receiver) !== undefined;
            
            if ( existSenderInFollow || existReceiverInFollow ){
                $zapPool.unshift(event);
                $zapPool.sort((a, b) => { return b.created_at - a.created_at; });
                zapPool.set($zapPool);

                const existSenderInPool = $profilePool.find((content) => content.pubkey === event.sender) !== undefined;
                const existReceiverInPool = $profilePool.find((content) => content.pubkey === event.receiver) !== undefined;
                
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

        rxNostr
            .use(backwardZap, {relays: localRelay})
            .pipe(uniq())
            .subscribe({
                next: (packet) => { addZapPool(packet) },
/*              complete: () => {
                    const oldestEvent = $zapPool?.at(-1);
                    console.debug("oldest:", oldestEvent?.created_at, "lastUntil", $lastUntilDate);
                    if ( oldestEvent !== undefined && oldestEvent?.created_at < $lastUntilDate ) {
                        console.debug("re-request");
                        console.debug("since:", unixTimeFormat($sinceDate), "until:", unixTimeFormat($untilDate));
                        backwardZap.emit({ kinds:[9735], since: $sinceDate, until: $untilDate });
                    }
                } */
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
                            forward.emit({ kinds:[9735], since: $sinceDate });
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
        <More />
    {:else}
        <Loading {follow} />
    {/if}
</main>

<style>

</style>
