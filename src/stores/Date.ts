import { now } from "rx-nostr";
import { derived, writable, type Readable, type Writable } from "svelte/store";

export const untilDate: Writable<number> = writable(now());
export const sinceDate: Readable<number> = derived(untilDate, $untilDate => $untilDate  - (3 * 60 * 60));