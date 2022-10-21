import { handleMode } from './modes/index.ts';
import { Command } from '../../deps.ts';
import { handleCommanderError } from './utils/index.ts';

// PUBLIC API

export { executeOn };

// IMPLEMENTATION DETAILS

async function executeOn(
    action: string,
    args: string[]
): Promise<string | null> {
    const program = new Command()
        .name('on')
        .description(
            'Turns luminaires on by a defined pattern and the given level.'
        )
        .exitOverride(handleCommanderError);
    program
        .command('all')
        .description('All luminaires')
        .action(async () => await handleMode(action, args));
    program
        .command('area <top-left-coords> <bottom-right-coords>')
        .description('Luminaires in an area')
        .action(async () => await handleMode(action, args));
    program
        .command('col <column-number>')
        .description('Column')
        .action(async () => await handleMode(action, args));
    program
        .command('row <row-number>')
        .description('Row')
        .action(async () => await handleMode(action, args));
    program
        .command('single <coords>')
        .description('A single luminaire')
        .action(async () => await handleMode(action, args));
    program
        .command('spiral')
        .description('All luminaires as a spiral')
        .action(async () => await handleMode(action, args));
    try {
        await program.parseAsync(args);
        return program._actionResults[0] || 'Execution failed';
    } catch (_e) {
        // The command already handles and logs the error
        return null;
    }
}
