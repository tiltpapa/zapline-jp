<script lang="ts">
    import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
    import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';
    import Profile from './Profile.svelte';
    import { ZapReceipt } from '$lib/ZapReceipt';
    import { unixTimeFormat } from '$lib/Helper';

    export let event: ZapReceipt;

    console.debug('[Card event]', event.id);
    if (event.sender === undefined) {
      console.warn('sender is undefined', event);
    }
</script>

<div class="card">
    <div class="card-header">
        <div class="row">
            <div class="col-8 col-sm-9">
                <p class="text-truncate">
                    {#if event.content.length !== 0}
                        {event.content}
                    {:else}
                        {event.message}
                    {/if}
                </p>
            </div>
            <div class="col-4 col-sm-3"><p class="fw-light text-end">{unixTimeFormat(event.created_at)}</p></div>
        </div>
    </div>
    <div class="card-body">
        <div class="row">
            <div class="col-5">
                {#if event.sender !== undefined}<Profile pubkey={event.sender} />{/if}
            </div>
            
            <div class="col-2 my-auto text-center">
                <div class="d-block d-sm-none">
                    <FontAwesomeIcon icon={faArrowRight} size="2x" />
                </div>
                <div class="d-none d-sm-block">
                    <FontAwesomeIcon icon={faArrowRight} size="4x" />
                </div>
            </div>

            <div class="col-5">
                <Profile pubkey={event.receiver} />
            </div>
        </div>

        <div class="row">
            <p class="col card-text text-end">
                <strong>{event.amount}</strong>
            </p>
            <p class="col card-text text-start">
                {event.amount === 1 ? 'sat' : 'sats'}
            </p>
        </div>
    </div>
</div>

<style>
    .card p {
        margin-top: 0;
        margin-bottom: 0;
    }
</style>
