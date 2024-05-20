import * as Nostr from "nostr-typedef";
import { writable, type Writable } from "svelte/store";

export const profilePool: Writable<Nostr.Content.Metadata[]> = writable([]);