import {
    Document,
    DOMParser,
    Element,
} from '../deps.ts';
import { Context } from '../repl/context.ts';
import { UnparsableHtmlResponseError } from '../repl/errors/index.ts';

interface PostOpts {
    data?: Record<string, number | string>;
    url?: string;
}

// CONSTANTS

const PATH__LOGIN = `/incontrol.web/login.aspx?ReturnUrl=%2fincontrol.web%2fdetail.aspx`;
const PATH__MAIN = `/incontrol.web/detail.aspx`;

// LOCAL VARIABLES

let _urlServer: string;

// CLASS DEFINITIONS

class Request {
    static async login(context: Context, username: string, password: string) {
        const dom = await Request.get(context, `${_urlServer}${PATH__LOGIN}`);
        const form = dom.querySelector('form[name="frmMain"]');
        const loginResponse = await _post(context, form, {
            url: `${_urlServer}${PATH__LOGIN}`,
            data: {
                txtLoginName: username,
                txtPassword: password,
                cmdOK: 'OK',
            },
        });
        context.setCookies(loginResponse.headers.get('set-cookie'));
        return await loginResponse.text();
    }

    static async get(context: Context, url = `${_urlServer}${PATH__MAIN}`) {
        const response = await fetch(url, {
            headers: {
                Cookie: context.getCookieString(),
            },
            //            agent: proxyAgent,
        });
        context.setCookies(response.headers.get('set-cookie'));
        return _parseDom(await response.text());
    }

    static async post(
        context: Context,
        form: Element | null,
        { data }: PostOpts = {}
    ): Promise<Document> {
        const response = await _post(context, form, { data });
        return _parseDom(await response.text());
    }
}

// PUBLIC API

export { Request, setUrl };

function setUrl(urlServer: string) {
    _urlServer = urlServer;
}

// IMPLEMENTATION DETAILS

async function _post(
    context: Context,
    form: Element | null,
    { data, url = `${_urlServer}${PATH__MAIN}` }: PostOpts = {}
) {
    const searchParams = new URLSearchParams();
    if (form) {
        const formFields: Element[] = Array.from(
            form.querySelectorAll(`input`)
        ) as Element[];
        formFields.forEach((field) => {
            const type = field.getAttribute('type');
            const name = field.getAttribute('name');
            const value = field.getAttribute('value');
            if (!name) return;
            if (!value) return;
            if (type === 'button') return;
            if (
                [
                    'cmdCancel',
                    'cmdChangePassword',
                    'txtLoginName',
                    'txtPassword',
                ].includes(name)
            )
                return;
            searchParams.append(name, value);
        });
    }
    if (data) {
        Object.entries(data).forEach(([key, value]) =>
            searchParams.append(key, '' + value)
        );
    }
    return await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'text/html',
            'Content-Type': 'application/x-www-form-urlencoded',
            Cookie: context.getCookieString(),
        },
        body: searchParams,
        redirect: 'manual',
        //        agent: proxyAgent,
    });
}

function _parseDom(domString: string): Document {
    const dom = new DOMParser().parseFromString(domString, 'text/html');
    if (!dom) throw new UnparsableHtmlResponseError(domString);
    return dom;
}
