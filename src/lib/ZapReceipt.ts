import * as Nostr from "nostr-typedef";
import type { pubkey } from "./Type";
import { decode } from 'light-bolt11-decoder';

export class ZapReceipt implements Nostr.Event<Nostr.Kind.Zap> {
    readonly id: string;
    readonly sig: string;
    readonly kind = 9735;
    readonly tags: Nostr.Tag.Any[];
    readonly pubkey: string;
    readonly content: string;
    readonly created_at: number;

    private _sender?: pubkey;
    private _receiver?: pubkey;
    private _amount?: number;
    private _message?: string;

    constructor(event: Nostr.Event<Nostr.Kind.Zap>){
        this.id = event.id;
        this.sig = event.sig;
        this.tags = event.tags;
        this.pubkey = event.pubkey;
        this.content = event.content;
        this.created_at = event.created_at;
    }

    public get sender(): pubkey {
        if (this._sender !== undefined){
            return this._sender;
        }

        this._sender = this.tags.find((item) => item[0] === "P")?.at(1);
        if (this._sender === undefined){
            const request = this.tags.find((item) => item[0] === "description")?.at(1);
            if(request === undefined){
                return undefined;
            }
            try {
                this._sender = JSON.parse(request).pubkey;
            } catch (e) {
                return undefined;
            }
        }
        return this._sender;
    }

    public get receiver(): pubkey {
        if (this._receiver !== undefined){
            return this._receiver;
        }
        
        this._receiver = this.tags.find((item) => item[0] === "p")?.at(1);
        return this._receiver;
    }

    public get amount(): number {
        if (this._amount !== undefined){
            return this._amount;
        }

        const bolt11 = this.tags.find((item) => item[0] === "bolt11")?.at(1);
        const decoded = decode(bolt11);
        const msats = decoded.sections.find((section) => section.name === "amount")?.value;
        this._amount = Math.floor(msats / 1000);

        return this._amount;
    }

    public get message(): string {
        if (this._message !== undefined){
            return this._message;
        }
        
        const request = this.tags.find((item) => item[0] === "description")?.at(1);
        if (request === undefined){
            this._message = "";
            return this._message;
        }
        
        try {
            this._message = JSON.parse(request).content;
        } catch (e) {
            this._message = "";
        }

        return this._message;
    }
}