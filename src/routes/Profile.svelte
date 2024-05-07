<script lang="ts">
    import type { pubkey } from '$lib/Type';
    import * as Nostr from 'nostr-typedef';
    import { profilePool } from '../stores/profilePool';
        
    export let pubkey: pubkey;
    const unknownPic = "https://robohash.org/" + pubkey + ".png?set=set4";
/*    
    const isPubkey = (str: pubkey): boolean => {
        const regex = /^[0-9a-fA-F]{64}$/;
        return regex.test(str ?? '');
    };
*/  
    let profile: Nostr.Content.Metadata;
    profilePool.subscribe((store) => {
        const metadata = store.find((data) => data.pubkey === pubkey);
        if (metadata !== undefined && profile === undefined) {
            profile = metadata;
            console.debug('[Profile picture]', profile.picture);
        }
    });
</script>

<div class="text-center">
    
    {#if profile}
        <img class="w-50 h-auto rounded-circle" src={profile.picture ?? unknownPic} alt={profile.name ?? 'unknown'} />
    {:else}
        <img class="w-50 h-auto rounded-circle" src={unknownPic} alt="unknown" />
    {/if}
    <!--<img class="w-50 h-auto rounded-circle" src={unknownPic} alt="unknown" />-->

    <p class="card-text">
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

</style>