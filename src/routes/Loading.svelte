<script>
    import 'spinkit/spinkit.min.css'
    import 'checkbox.css/dist/css/inout/inout.min.css'
    import { fly } from "svelte/transition";

    export let follow; // nostr-japanese-users follow list
</script>

<div class="container p-3" out:fly={{y: 100}}>
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
</div>

<style>
    :root {
        --sk-size: 1.5rem;
        --sk-color: #00ff00;
    }

    .loading-row-h {
        height: var(--sk-size);
    }

    .sk-circle {
        margin-left: auto;
    }
</style>