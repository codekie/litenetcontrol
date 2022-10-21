import {assertNotEquals} from "https://deno.land/std@0.160.0/testing/asserts.ts";

import {getForm} from './dom.ts';
import {createAspNetForm} from '../../test/factories/form.ts';

Deno.test({
    name: "getForm",
    fn: async () => {
        const page = await createAspNetForm();

        assertNotEquals(getForm(page!), null);
    }
});
