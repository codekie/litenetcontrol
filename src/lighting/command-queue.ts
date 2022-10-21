import { getForm } from './utils/dom.ts';
import { Request } from './request.ts';
import { Context } from '../repl/context.ts';
import { Document } from '../deps.ts';
import { Command } from './command.ts';
import {
    ElementNotFoundError,
    InvalidActionHandlerError,
    UninitializedError,
} from '../repl/errors/index.ts';

interface RunOptions {
    concurrent?: boolean;
}

class CommandQueue {
    static _context: Context;

    _queue: Array<Command> = [];
    _concurrent = false;

    static async executeCommand(
        dom: Document,
        command: Command
    ): Promise<Document> {
        if (!command.luminaire) {
            if (typeof command.action !== 'function') {
                throw new InvalidActionHandlerError();
            }
            await command.action(dom);
            return dom;
        }
        try {
            dom = await command.luminaire.select(dom);
            const form = getForm(dom);
            if (!form) throw new ElementNotFoundError();
            return await Request.post(CommandQueue._context, form, {
                data: command.getActionCoords(),
            });
        } catch (e) {
            // Proceed if a single command can't be executed
            console.warn(e);
            return dom;
        }
    }

    static async run(
        dom: Document,
        commands: Array<Command>,
        { concurrent }: RunOptions = {}
    ) {
        return await new CommandQueue({ concurrent }).add(commands).run(dom);
    }

    static setContext(context: Context) {
        CommandQueue._context = context;
    }

    constructor({ concurrent = false } = {}) {
        // Run all luminaires concurrently, but all commands for each luminaire sequentially
        this._concurrent = concurrent;
    }

    add(command: Command | Array<Command>) {
        if (Array.isArray(command)) {
            this._queue.splice(this._queue.length, 0, ...command);
        } else {
            this._queue.push(command);
        }
        return this;
    }

    setConcurrent(concurrent: boolean) {
        this._concurrent = concurrent;
        return this;
    }

    clear() {
        this._queue.splice(0, this._queue.length);
    }

    async run(dom: Document): Promise<Document> {
        return await (this._concurrent
            ? this._runConcurrently(dom)
            : this._runSequentially(dom));
    }

    async *_asyncGeneratorCommandQueue(
        dom: Document,
        commands: Array<Command>
    ): AsyncGenerator<Document, Document, void> {
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            if (command.luminaire?.disabled) {
                yield dom;
                continue;
            }
            dom = await CommandQueue.executeCommand(dom!, command);
            yield dom;
        }
        return dom;
    }

    async _runSequentially(dom: Document): Promise<Document> {
        const genCommands = this._asyncGeneratorCommandQueue(dom, this._queue);
        for await (const result of genCommands) {
            dom = result;
        }
        return dom;
    }

    async _runConcurrently(dom: Document): Promise<Document> {
        if (this._queue.length === 0) throw new UninitializedError();
        return (
            await Promise.all(
                Array.from(
                    this._queue
                        // Group commands by luminaire-name
                        .reduce((res, command) => {
                            const name = command.luminaire?.name;
                            let queue = res.get(name);
                            if (!queue) {
                                queue = [];
                                res.set(name, queue);
                            }
                            queue.push(command);
                            return res;
                        }, new Map())
                        .values()
                ).map((commands) => {
                    const queue = new CommandQueue();
                    queue.add(commands);
                    return queue.run(dom);
                })
            )
        ).pop()!;
    }
}

export { CommandQueue };
