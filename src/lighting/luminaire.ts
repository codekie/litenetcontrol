import { getForm } from './utils/dom.ts';
import { Request } from './request.ts';
import { Context } from '../repl/context.ts';
import {
    Document,
    Element,
    Node,
} from 'https://deno.land/x/deno_dom@v0.1.32-alpha/deno-dom-wasm.ts';
import { MissingAttributeError } from '../repl/errors/index.ts';

class Luminaire {
    // Luminaires that don't exist (in a rectangular pattern, e.g. OG1_SUED), or may cause issues
    static DISABLED_LUMINAIRES: Array<string> = ['Leuchte_R21G01B12'];

    // Static private properties

    static _luminaires = new Map<string, Luminaire>();
    static _context: Context;

    // Static methods

    static get(name: string) {
        return Luminaire._luminaires.get(name);
    }
    static setContext(context: Context) {
        Luminaire._context = context;
    }

    // Public attributes

    name: string;
    disabled = false;

    // Private properties

    constructor(name: string) {
        this.name = name;
        this.disabled = Luminaire.DISABLED_LUMINAIRES.includes(name);
        Luminaire._luminaires.set(name, this);
    }

    getNode(dom: Document): Element {
        return Array.from(dom.querySelectorAll('a'))
            .filter((node: Node) => node.textContent === this.name)
            .pop() as Element;
    }

    async select(dom: Document) {
        const luminaireNode = this.getNode(dom);
        if (!luminaireNode) {
            // This only happens when the `LuminairePatternBuilder` creates a rectangular map of a floor,
            // where the luminaires are not installed in a fully rectangular way (e.g. `OG1_SUED`)
            throw new Error(`luminaire "${this.name}" could not be found`);
        }
        const form = getForm(dom);
        const luminaireId = luminaireNode.getAttribute('id');
        if (!luminaireId) throw new MissingAttributeError(luminaireNode, 'id');
        return await Request.post(Luminaire._context, form, {
            data: {
                ctl00_cphBody_tvDevices_SelectedNode: luminaireId,
            },
        });
    }
}

export { Luminaire };
