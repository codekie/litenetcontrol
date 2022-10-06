import { Command } from 'https://deno.land/x/cmd@v1.2.0/commander/index.ts';
import { LitenetController } from '../../lighting/index.ts';
import { handleCommanderError } from './utils/index.ts';

// PUBLIC API

export { executeSet };

// IMPLEMENTATION DETAILS

async function executeSet(
    _action: string,
    args: string[]
): Promise<string | null> {
    const program = new Command()
        .name('set')
        .description('Set settings')
        .exitOverride(handleCommanderError);
    program
        .command('concurrent <flag>')
        .description('[ true | false ] To run commands concurrently')
        .action(_handleSettings);
    try {
        return program.parse(args)._actionResults[0] || 'Execution failed';
    } catch (_e) {
        // The command already handles and logs the error
        return null;
    }
}

function _handleSettings() {
    const valRaw = arguments[0];
    if (!valRaw || (valRaw !== 'true' && valRaw !== 'false')) {
        return `Invalid argument ${valRaw}`;
    }
    const enabled = valRaw === 'true';
    LitenetController.setConcurrent(enabled);
    return enabled ? 'Concurrency enabled' : 'Concurrency disabled';
}
