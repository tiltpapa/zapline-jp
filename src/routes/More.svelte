<script lang="ts">
    import { onMount } from "svelte";
    import { backwardZap } from "$lib/RxNostr";
    import { sinceDate, untilDate } from "$lib/Helper";

    onMount(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    console.debug("intersecting")
                    backwardZap.emit({ kinds:[9735], since: sinceDate, until: untilDate });
                }
            });
        });
        const more = document.getElementById('more');
        observer.observe(more);
    });
</script>

<div id="more" class="sk-flow mx-auto my-3">
    <div class="sk-flow-dot"></div>
    <div class="sk-flow-dot"></div>
    <div class="sk-flow-dot"></div>
</div>