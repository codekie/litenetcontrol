import { handleDimMode } from './modes/index.ts';
import { Command } from '../../deps.ts';
import { handleCommanderError } from './utils/index.ts';
import { Action } from '../../lighting/action.ts';

// PUBLIC API

export { executeDarker };

// IMPLEMENTATION DETAILS

async function executeDarker(
    action: Action,
    args: string[]
): Promise<string | null> {
    const program = new Command()
        .name('darker')
        .description(
            'Turns luminaires darker by a defined pattern and the given level.'
        )
        .exitOverride(handleCommanderError);
    program
        .command('all <level>')
        .description('All luminaires')
        .action(async () => await handleDimMode(action, args));
    program
        .command('area <top-left-coords> <bottom-right-coords> <level>')
        .description('Luminaires in an area')
        .action(async () => await handleDimMode(action, args));
    program
        .command('col <column-number> <level>')
        .description('Column')
        .action(async () => await handleDimMode(action, args));
    program
        .command('row <row-number> <level>')
        .description('Row')
        .action(async () => await handleDimMode(action, args));
    program
        .command('single <coords> <level>')
        .description('A single luminaire')
        .action(async () => await handleDimMode(action, args));
    program
        .command('spiral <level>')
        .description('All luminaires as a spiral')
        .action(async () => await handleDimMode(action, args));
    try {
        await program.parseAsync(args);
        return program._actionResults[0] || 'Execution failed';
    } catch (_e) {
        // The command already handles and logs the error
        return null;
    }
}
