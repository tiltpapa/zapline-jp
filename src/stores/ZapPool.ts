
import type { ZapReceipt } from "$lib/ZapReceipt";
import { writable, type Writable } from "svelte/store";

export const zapPool: Writable<ZapReceipt[]> = writable([]);