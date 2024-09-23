<script lang="ts">
    import type { pubkey } from '$lib/Type';
    import * as Nostr from 'nostr-typedef';
    import { profilePool } from '../stores/ProfilePool';
    import * as nip19 from 'nostr-tools/nip19'
        
    export let pubkey: pubkey;
    const unknownPic = "https://robohash.org/" + pubkey + ".png?set=set4&size=150x150";
    const npub = nip19.npubEncode(pubkey);

    let profile: Nostr.Content.Metadata;
    profilePool.subscribe((store) => {
        const metadata = store.find((data) => data.pubkey === pubkey);
        if (metadata !== undefined && profile === undefined) {
            profile = metadata;
//          console.debug('[Profile picture]', profile.picture);
        }
    });
</script>

<div class="text-center">
    <a href={"https://njump.me/" + npub} target="_blank">
        <div class="icon-container">
            {#if profile}
                <img src={profile.picture ?? unknownPic} class="rounded-circle img-fluid" alt={profile.name ?? 'unknown'} />
            {:else}
                <img src={unknownPic} class="rounded-circle img-fluid" alt="unknown" />
            {/if}
        </div>
    </a>

    <p class="card-text text-truncate">
        {#if profile}
            {#if profile.display_name}
                {profile.display_name}
            {:else}
                {profile.name}
            {/if}
        {:else}
            <i>unknown</i>
        {/if}
    </p>
</div>

<style>
    .icon-container img {
        width: 50%; /* Set the width of the image to 50% of its parent */
        height: auto; /* Maintain the aspect ratio */
        aspect-ratio: 1 / 1; /* Set a fixed aspect ratio of 1:1 */
        object-fit: cover; /* Ensure the image covers the space without distortion */
    }
</style>