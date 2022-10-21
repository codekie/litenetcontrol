import { Document } from '../../deps.ts';

export { getForm };

function getForm(dom: Document) {
    return dom.querySelector('form[name="aspnetForm"]');
}
