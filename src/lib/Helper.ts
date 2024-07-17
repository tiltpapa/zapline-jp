export const unixTimeFormat =
                        (unixTime) => 
                            new Intl.DateTimeFormat('en-US',{
                                month: "numeric",
                                day: "2-digit",
                                hour: "numeric",
                                minute: "2-digit",
                                hourCycle: "h23"
                            }).format(new Date(unixTime * 1000));
/*
export const untilDate = () => {
    const oldestEvent = get(zapPool)?.at(-1);
    if (oldestEvent === undefined) {
        return now();
    }
    return oldestEvent.created_at;
}

export const sinceDate = () => { return untilDate() - (3 * 60 * 60) };
*/