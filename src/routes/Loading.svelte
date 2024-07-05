<script>
    import 'spinkit/spinkit.min.css'
    import 'checkbox.css/dist/css/inout/inout.min.css'
    
    export let follow; // nostr-japanese-users follow list
</script>

<div class="container p-3">
    <div class="row gx-2 gy-4 loading-row-h">
        <div class="col-1 col-sm-3"><!-- blank --></div>
        <div class="col-2 col-sm-1 text-center">
            {#if follow}
                <input type="checkbox" class="checkbox-inout" id="follow" autocomplete="off" checked readonly/>
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
        <div class="col-1 col-sm-3"><!-- blank --></div>
        <div class="col-2 col-sm-1 text-center">
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
                <input type="checkbox" autocomplete="off" readonly/>
            {/if}
        </div>
        <div class="col-9 col-sm-8 mx-auto">Collecting Zap event & Sorting</div>
    </div>
</div>

<style>
    .loading-row-h {
        height: 1.5rem;
    }

    .sk-circle {
        width: 1.5rem;
        height: 1.5rem;
        margin-left: auto;
        margin-right: auto;
    }

    .sk-circle-dot:before {
        background-color: #00ff00;
    }
</style>