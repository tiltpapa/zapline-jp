<script lang="ts">
    import { onMount } from "svelte";
    import { backwardZap } from "$lib/RxNostr";
    import { lastUntilDate, sinceDate, untilDate } from "../stores/Date";
    import { unixTimeFormat } from "$lib/Helper";
    import { zapPool } from "../stores/ZapPool";
//  import { sinceDate, untilDate } from "$lib/Helper";

    onMount(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    console.debug("intersecting");
                    window.scrollBy({
                        top: - entry.intersectionRect.width,
                        behavior: "smooth"
                    });

                    lastUntilDate.set($untilDate);
                    console.debug("since:", unixTimeFormat($sinceDate), "until:", unixTimeFormat($untilDate));
                    backwardZap.emit({ kinds:[9735], since: $sinceDate, until: $untilDate });

                    // zapPoolの数が変動するまで再起的に処理する
                    const currentZapPoolLength = $zapPool.length;
                    const checkZapPool = () => {
                        if (currentZapPoolLength === $zapPool.length) {
                            lastUntilDate.set($untilDate);
                            console.debug("since:", unixTimeFormat($sinceDate), "until:", unixTimeFormat($untilDate));
                            backwardZap.emit({ kinds:[9735], since: $sinceDate, until: $untilDate });
                            setTimeout(checkZapPool, 2000);
                        }
                    };
                    setTimeout(checkZapPool, 2000);
                }
            });
        });
        const more = document.getElementById('more');
        if (more) {
            observer.observe(more);
        }
    });
</script>

<div id="more" class="sk-flow mx-auto my-3">
    <div class="sk-flow-dot"></div>
    <div class="sk-flow-dot"></div>
    <div class="sk-flow-dot"></div>
</div>

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