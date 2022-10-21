import { serve } from 'https://deno.land/std@0.140.0/http/server.ts';
import { Action, ActionDefinition } from '../lighting/action.ts';
import {readFile} from './utils/fs.ts';

serve(handleRequest);

async function handleRequest(request: Request): Promise<Response> {
    const start = Date.now();
    const { pathname } = new URL(request.url);
    const fileName = pathname.split('/').pop();
    let file: Uint8Array;
    try {
        file = await readFile(`./data/html/${fileName}`);
    } catch (_e) {
        return new Response(`Error reading file`);
    }
    return new Promise((resolve, reject) => {
        let response: Response;
        try {
            response = new Response(file, {
                headers: {
                    'content-type': 'text/html; charset=utf-8',
                },
            });
        } catch (e) {
            reject(e);
            return;
        }
        _logParameters(request, start)
            .then(() => {
                if (fileName === 'login.aspx') {
                    response.headers.set('Set-Cookie', 'foo=bar');
                }
                resolve(response);
            })
            .catch((e) => {
                reject(e);
            });
    });
}

async function _logParameters(request: Request, start: number): Promise<void> {
    let formData: FormData;
    try {
        formData = await request.formData();
    } catch (e) {
        // If no data has been submitted, the content-type may not be set
        if (e.message === 'Missing content type') return;
        throw e;
    }
    const luminaire: string | null = formData.get(
        'ctl00_cphBody_tvDevices_SelectedNode'
    ) as string;
    const action = _getAction(formData);
    _log(luminaire || action, start);
}

function _log(message: string | null, start: number) {
    const now = Date.now();
    console.log(`${now} (${now - start}ms): ${message}`);
}

function _getAction(formData: FormData): string | null {
    const x = formData.get('ctl00$cphBody$ibLight.x');
    const y = formData.get('ctl00$cphBody$ibLight.y');
    if (x == null || y == null) return null;
    return (
        Object.entries(Action).find(
            ([_key, actionDef]: [string, ActionDefinition]) => {
                return actionDef.x === +x && actionDef.y === +y;
            }
        )?.[0] || null
    );
}
