import { Document } from 'https://deno.land/x/deno_dom@v0.1.32-alpha/deno-dom-wasm.ts';

export { getForm };

function getForm(dom: Document) {
    return dom.querySelector('form[name="aspnetForm"]');
}
