<script lang="ts">
    import { zapPool } from "../stores/ZapPool";
    import ZapCard from "./ZapCard.svelte";
</script>

{#each $zapPool as event, i (event.id)}
    <ZapCard {event} />
{/each}