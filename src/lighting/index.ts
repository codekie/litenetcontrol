import { CommandQueue } from './command-queue.ts';
import { Request } from './request.ts';
import { LuminairePatternBuilder } from './luminaire-pattern-builder.ts';
import { Context } from '../repl/context.ts';
import { Command } from './command.ts';

let _context: Context;
const _queue: CommandQueue = new CommandQueue();

class LitenetController {
    static add(commands: Array<Command>): LitenetController {
        _queue.add(commands);
        return LitenetController;
    }

    static clear() {
        _queue.clear();
        return LitenetController;
    }

    static async run(commands: Array<Command>) {
        if (commands) {
            LitenetController.clear();
            LitenetController.add(commands);
        }
        const dom = await Request.get(_context);
        await _queue.run(dom);
    }

    static setContext(context: Context) {
        _context = context;
        CommandQueue.setContext(context);
        LuminairePatternBuilder.setContext(context);
    }

    static setConcurrent(concurrent: boolean) {
        _queue.setConcurrent(concurrent);
    }
}

export { LitenetController };

/*
Sample calls:

LitenetController.run(LightPattern.dimSingle(Action.darker, 10, [2, 11]));

LitenetController
    .add(LightPattern.switchOffArea([0, 10], [3, 10]))
    .add(Command.wait(1000))
    .add(LightPattern.shutterRow(10))
    .add(Command.wait(1000))
    .add(LightPattern.dimArea(Action.brighter, 5, [0, 10], [3, 10]))
    .add(LightPattern.dimArea(Action.brighter, 55, [0, 10], [2, 10]))
    .run();
*/
