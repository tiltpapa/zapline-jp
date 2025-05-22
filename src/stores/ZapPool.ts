import type { ZapReceipt } from "$lib/ZapReceipt";
import { writable, type Writable, get } from "svelte/store";
import { lastUntilDate, sinceDate, untilDate } from "../stores/Date";
import { backwardZap } from "$lib/RxNostr";
import { unixTimeFormat } from "$lib/Helper";

export const zapPool: Writable<ZapReceipt[]> = writable([]);

export const zapPoolIntervalId: Writable<number> = writable(0);
/**
 * zapPoolの数が変動するまで再帰的に処理する関数
 * @param initialLength - 初期のzapPool長さ
 */
export const checkZapPoolRepeatedly = (initialLength: number): void => {
    if (get(zapPoolIntervalId) !== 0) {
        console.debug("zapPoolIntervalId:", get(zapPoolIntervalId));
        return;
    }

    const req = (initialLength: number) => {
        if (initialLength === get(zapPool).length) {
            lastUntilDate.set(get(untilDate));
            console.debug("since:", unixTimeFormat(get(sinceDate)), "until:", unixTimeFormat(get(untilDate)));
            backwardZap.emit({ kinds:[9735], since: get(sinceDate), until: get(untilDate) });
        } else {
            window.clearInterval(get(zapPoolIntervalId));
            zapPoolIntervalId.set(0);
        }
    }

    const intervalId = window.setInterval(() => req(initialLength), 2000);
//    console.debug("intervalId:", intervalId);
    zapPoolIntervalId.set(Number(intervalId));
//    console.debug("zapPoolIntervalId:", get(zapPoolIntervalId));
};