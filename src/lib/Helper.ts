export const unixTimeFormat =
                        (unixTime) => 
                            new Intl.DateTimeFormat('en-US',{
                                month: "numeric",
                                day: "2-digit",
                                hour: "numeric",
                                minute: "2-digit",
                                hourCycle: "h23"
                            }).format(new Date(unixTime * 1000));