import { executeOn } from './on.ts';
import { executeOff } from './off.ts';
import { executeBrighter } from './brighter.ts';
import { executeDarker } from './darker.ts';
import { executeTrail } from './trail.ts';
import { executeSet } from './set.ts';
import { exit } from './exit.ts';
import { Context } from '../context.ts';
import { ReplCommand } from '../repl.ts';
import { Command } from '../../deps.ts';
import { Action } from '../../lighting/action.ts';
import { handleCommanderError } from './utils/index.ts';
import { HandlingError, HelpCall } from '../errors/index.ts';

export type CommandHandler = (
    action: string,
    args: string[]
) => Promise<string | null>;

export interface CommandHandlers {
    [key: string]: (action: string, args: string[]) => Promise<string | null>;
}

const Handler: CommandHandlers = {
    exit,
    on: executeOn,
    off: executeOff,
    brighter: executeBrighter,
    darker: executeDarker,
    trail: executeTrail,
    set: executeSet,
};

export { executeCommand };

async function executeCommand(
    _context: Context,
    command: ReplCommand
): Promise<string | null> {
    const program = new Command()
        .name(' ')
        .description('Controls luminaires')
        .usage('command <mode>')
        .exitOverride(handleCommanderError);
    program
        .command('on <mode>')
        .description('Turn lights on')
        .action(_handleAction);
    program
        .command('off <mode>')
        .description('Turn lights off')
        .action(_handleAction);
    program
        .command('brighter <mode>')
        .description('Dim lights brighter')
        .action(_handleAction);
    program
        .command('darker <mode>')
        .description('Dim lights darker')
        .action(_handleAction);
    program
        .command('trail <mode>')
        .description('Turn lights on with a trail and then turn them off again')
        .action(_handleAction);
    program
        .command('set <setting>')
        .description('Set settings')
        .action(_handleAction);
    program.command('exit').description('Quit program').action(_handleAction);

    try {
        await program.parseAsync([command.action, ...command.args]);
        return program._actionResults[0] || 'Execution failed';
    } catch (e) {
        // Handling errors and calling help, are handled by "commander"
        if (e instanceof HandlingError || e instanceof HelpCall) return null;
        console.log(e);
        return null;
    }
}

async function _handleAction() {
    const args = Array.from(arguments);
    const idxCommand = args.findIndex((arg) => arg instanceof Command);
    const command: Command = args
        .splice(idxCommand, 1)
        .pop() as unknown as Command;
    const actionName = '' + command.name();
    const action = Action[actionName];
    // Get the right command-handler
    const commandHandler: CommandHandler | undefined = Handler[actionName];
    if (action && !commandHandler) {
        return `Unknown command: ${action}`;
    }
    // Run the right mode
    return await commandHandler(action, args.flat());
}
