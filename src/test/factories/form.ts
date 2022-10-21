import {Document, DOMParser} from 'https://deno.land/x/deno_dom@v0.1.32-alpha/deno-dom-wasm.ts';
import {getDetailPage} from '../utils/fs.ts';

export {
    createAspNetForm
}

async function createAspNetForm(): Promise<Document | null> {
    return new DOMParser().parseFromString(await getDetailPage(), 'text/html');
}
