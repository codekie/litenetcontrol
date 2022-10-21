import { readLines } from '../deps.ts';
import { Context } from './context.ts';

export type ResultProcessor = (
    error: Error | null,
    output: string | null
) => void;

type EvalFunc = (
    line: string,
    context: Context,
    callback: ResultProcessor
) => void;

interface ReplOptions {
    prompt?: string;
    evalFunc?: EvalFunc;
}

export interface ReplCommand {
    action: string;
    args: string[];
}

const _encoder = new TextEncoder();

class Repl {
    prompt: string;
    evalFunc: EvalFunc;
    context: Context;

    private history: string[] = [];

    static async start(
        context: Context,
        { prompt, evalFunc }: ReplOptions = {}
    ) {
        const session = new Repl(context, { prompt, evalFunc });
        await _run(session);
        return session;
    }

    constructor(
        context: Context,
        { prompt = '>', evalFunc = _echo }: ReplOptions
    ) {
        this.context = context;
        this.prompt = prompt;
        this.evalFunc = evalFunc;
    }

    getHistory() {
        return this.history.slice();
    }

    pushHistory(command: string) {
        this.history.push(command);
    }
}

export { Repl };

function _echo(line: string, _context: Context, callback: ResultProcessor) {
    callback(null, line);
}

async function _run(session: Repl): Promise<void> {
    await _writePrompt(session);
    for await (const line of readLines(Deno.stdin)) {
        try {
            session.pushHistory(line);
            await session.evalFunc(line, session.context, _processResult);
        } catch (e) {
            _processResult(e);
        }
        await _writePrompt(session);
        if (line.trim() === 'exit') {
            break;
        }
    }
}

async function _writePrompt(session: Repl): Promise<void> {
    const encPrompt = _encoder.encode(session.prompt);
    await Deno.stdout.write(encPrompt);
}

function _processResult(error: Error | null, result?: string | null) {
    if (error) {
        console.log(`\n${error}\n`);
        return;
    }
    result !== null && console.log(`${result}`);
}
