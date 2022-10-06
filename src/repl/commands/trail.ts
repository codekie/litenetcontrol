import { UnknownMode } from '../errors/index.ts';
import { parseCoords } from './utils/index.ts';
import { LightPattern } from '../../lighting/light-pattern.ts';
import { LitenetController } from '../../lighting/index.ts';
import { Action } from '../../lighting/action.ts';
import { LuminairePatternBuilder } from '../../lighting/luminaire-pattern-builder.ts';
import { CommandHandlers } from './index.ts';

// CONSTANTS

const Mode: CommandHandlers = {
    all: _executeModeAll,
    area: _executeModeArea,
    col: _executeModeCol,
    row: _executeModeRow,
    spiral: _executeSpiral,
};

// PUBLIC API

export { executeTrail };

async function executeTrail(action: string, args: string[] = []) {
    const mode = args[0];
    const modeHandler = Mode[mode];
    if (mode && !modeHandler) {
        throw new UnknownMode(args[0]);
    }
    return await modeHandler(action, args.slice(1));
}

async function _executeModeAll(
    _action: string,
    _args: string[]
): Promise<string> {
    // TODO implement me
    return await 'Trailing all lights completed';
}

async function _executeModeArea(
    _action: string,
    args: string[]
): Promise<string> {
    const topLeft = parseCoords(args[0]);
    const bottomRight = parseCoords(args[1]);
    await LitenetController.run(
        LightPattern.trail(LightPattern.switchOnArea(topLeft, bottomRight))
    );
    return `Trailing the lights in the area [${topLeft}] to [${bottomRight}] completed`;
}

async function _executeModeCol(
    _action: string,
    args: string[]
): Promise<string> {
    const col = +args[0];
    await LitenetController.run(
        LightPattern.trail(LightPattern.switchOnColumn(col))
    );
    return `Trailing the lights in the ${col}. column completed`;
}

async function _executeModeRow(
    _action: string,
    args: string[]
): Promise<string> {
    const row = args[0];
    // TODO implement me
    return await `Trailing the lights in the ${row}. row completed`;
}

async function _executeSpiral() {
    await LitenetController.run(
        LightPattern.trail(
            LightPattern.byLuminairePattern(
                Action.on,
                LuminairePatternBuilder.getSpiral
            )
        )
    );
    return `Trailing spiral completed`;
}
