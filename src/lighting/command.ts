import { Document } from 'https://deno.land/x/deno_dom@v0.1.32-alpha/deno-dom-wasm.ts';
import { InvalidActionCoordsError } from '../repl/errors/index.ts';
import { ActionDefinition } from './action.ts';
import { Luminaire } from './luminaire.ts';

type CommandHandler = (dom: Document) => Promise<unknown>;

class Command {
    luminaire: Luminaire | null;
    action: ActionDefinition | CommandHandler;

    static wait(duration: number): Command {
        return new Command(
            null,
            () => new Promise((resolve) => setTimeout(resolve, duration))
        );
    }

    constructor(
        luminaire: Luminaire | null,
        action: ActionDefinition | CommandHandler
    ) {
        this.luminaire = luminaire;
        this.action = action;
    }

    getActionCoords() {
        if (typeof this.action === 'function') {
            throw new InvalidActionCoordsError();
        }
        return {
            'ctl00$cphBody$ibLight.x': this.action.x,
            'ctl00$cphBody$ibLight.y': this.action.y,
        };
    }
}

export { Command };
