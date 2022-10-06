import {
    Coords,
    LuminairePattern,
    LuminairePatternArgs,
} from '../../../lighting/luminaire-pattern-builder.ts';
import {
    HelpCall,
    InvalidCoordinatesError,
    MissingArgumentError,
    UnknownCommandError,
} from '../../errors/index.ts';
import { Action } from '../../../lighting/action.ts';
import { ModeOptions } from '../interfaces/mode-opations.ts';
import { LitenetController } from '../../../lighting/index.ts';
import { LightPattern } from '../../../lighting/light-pattern.ts';
import { CommanderError } from 'https://deno.land/x/cmd@v1.2.0/commander/index.ts';

export { parseCoords, runByLuminairePattern, handleCommanderError };

function parseCoords(rawInput: string | undefined): Coords {
    if (!rawInput) throw new InvalidCoordinatesError(rawInput);
    const normalized = rawInput.replace(/\s*/g, '');
    if (!/^\d+,\d+$/.test(normalized)) new InvalidCoordinatesError(rawInput);
    const coords = normalized.split(',');
    // The RegExp makes sure that the Array has two entries
    return coords.map((val) => +val).slice(0, 2) as Coords;
}

async function runByLuminairePattern(
    action: Action,
    luminairePattern: LuminairePattern,
    modeOptions?: ModeOptions,
    ...args: LuminairePatternArgs[]
) {
    const { dimLevel } = modeOptions || {};
    await LitenetController.run(
        LightPattern.byLuminairePattern(
            dimLevel != null ? LightPattern.dim(action, dimLevel) : action,
            luminairePattern,
            ...args
        )
    );
}

function handleCommanderError(error: CommanderError) {
    switch (error.code) {
        case 'commander.help':
            throw new HelpCall();
        case 'commander.helpDisplayed':
        case 'commander.unknownCommand':
            throw new UnknownCommandError();
        case 'commander.missingArgument':
            throw new MissingArgumentError();
        default:
            throw error;
    }
}
