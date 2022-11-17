import { ModeOptions } from '../interfaces/mode-opations.ts';
import { parseCoords, runByLuminairePattern } from '../utils/index.ts';
import { Action } from '../../../lighting/action.ts';
import {
    Coords,
    LuminairePatternBuilder,
} from '../../../lighting/luminaire-pattern-builder.ts';

enum Mode {
    All,
    Area,
    Col,
    Row,
    Single,
    Spiral,
}

const Handlers: ModeHandlers = {
    all: _executeModeAll,
    area: _executeModeArea,
    col: _executeModeCol,
    row: _executeModeRow,
    single: _executeModeSingle,
    spiral: _executeModeSpiral,
};

// PUBLIC API

export type ModeHandler = (
    action: Action,
    args: string[],
    modeOptions?: ModeOptions
) => Promise<string>;

export interface ModeHandlers {
    [key: string]: (
        action: Action,
        args: string[],
        modeOptions?: ModeOptions
    ) => Promise<string>;
}

export {
    // Mode-handlers
    handleDimMode,
    handleMode,
};

// IMPLEMENTATION DETAILS

// Public

async function handleDimMode(action: Action, argsRaw: string[]) {
    const args = argsRaw.slice();
    // Determine the dim-level
    const dimLevelRaw = args.pop();
    const dimLevel = +(dimLevelRaw || NaN);
    if (isNaN(dimLevel)) {
        return `Invalid dim-level: ${dimLevelRaw}`;
    }
    // Run the right mode
    return await _handleMode(action, args, { dimLevel });
}

async function handleMode(action: Action, argsRaw: string[]) {
    return await _handleMode(action, argsRaw);
}

// Private

async function _handleMode(
    action: Action,
    argsRaw: string[],
    modeOptions?: ModeOptions
) {
    const args = argsRaw.slice();
    const mode = args.shift();
    // Get the right mode-handler
    const modeHandler: ModeHandler | undefined =
        mode === undefined ? Handlers.all : Handlers[mode];
    if (mode && !modeHandler) {
        return `Unknown mode: ${mode}`;
    }
    // Run the right mode
    return await modeHandler(action, args, modeOptions);
}

async function _executeModeAll(
    action: Action,
    _args: string[],
    modeOptions: ModeOptions = {}
): Promise<string> {
    await runByLuminairePattern(
        action,
        LuminairePatternBuilder.getArea,
        modeOptions,
        [0, 0],
        [
            LuminairePatternBuilder.luminaires.length - 1,
            LuminairePatternBuilder.ROWS,
        ]
    );
    return _composeResult(Mode.All, action, [], modeOptions.dimLevel);
}

async function _executeModeArea(
    action: Action,
    args: string[],
    modeOptions: ModeOptions = {}
): Promise<string> {
    const topLeft = parseCoords(args[0]);
    const bottomRight = parseCoords(args[1]);
    await runByLuminairePattern(
        action,
        LuminairePatternBuilder.getArea,
        modeOptions,
        topLeft,
        bottomRight
    );
    return _composeResult(
        Mode.Area,
        action,
        [topLeft, bottomRight],
        modeOptions.dimLevel
    );
}

async function _executeModeCol(
    action: Action,
    args: string[],
    modeOptions: ModeOptions = {}
): Promise<string> {
    const col = +args[0];
    await runByLuminairePattern(
        action,
        LuminairePatternBuilder.getArea,
        modeOptions,
        [col, 0],
        [col, LuminairePatternBuilder.ROWS]
    );
    return _composeResult(Mode.Col, action, col, modeOptions.dimLevel);
}

async function _executeModeRow(
    action: Action,
    args: string[],
    modeOptions: ModeOptions = {}
): Promise<string> {
    const row = +args[0];
    await runByLuminairePattern(
        action,
        LuminairePatternBuilder.getArea,
        modeOptions,
        [0, row],
        [LuminairePatternBuilder.luminaires.length - 1, row]
    );
    return _composeResult(Mode.Row, action, row, modeOptions.dimLevel);
}

async function _executeModeSingle(
    action: Action,
    args: string[],
    modeOptions: ModeOptions = {}
): Promise<string> {
    const coords = parseCoords(args[0]);
    await runByLuminairePattern(
        action,
        LuminairePatternBuilder.getArea,
        modeOptions,
        coords,
        coords
    );
    return _composeResult(Mode.Single, action, coords, modeOptions.dimLevel);
}

async function _executeModeSpiral(
    action: Action,
    _args: string[],
    modeOptions: ModeOptions = {}
): Promise<string> {
    await runByLuminairePattern(
        action,
        LuminairePatternBuilder.getSpiral,
        modeOptions
    );
    return _composeResult(Mode.Spiral, action, null, modeOptions.dimLevel);
}

function _composeResult(
    mode: Mode,
    action: Action,
    args: Coords[] | number[] | number | null,
    dimLevel: number | undefined
): string {
    let result = 'The';

    if (Mode.All === mode) {
        result += ' whole area is';
    } else if (Mode.Area === mode) {
        const [topLeft, bottomRight] = args as Coords[];
        result += ` area [${topLeft}] to [${bottomRight}] is`;
    } else if (Mode.Col === mode) {
        result += ` column ${args} is`;
    } else if (Mode.Row === mode) {
        result += ` row ${args} is`;
    } else if (Mode.Single === mode) {
        result += ` luminaire at [${args}] is`;
    } else if (Mode.Spiral === mode) {
        result += ` luminaires as spiral are`;
    } else {
        result += ` unknown mode`;
    }

    result += ' turned';

    if (Action.brighter === action) {
        result += ' brighter';
    } else if (Action.darker === action) {
        result += ' darker';
    } else if (Action.off === action) {
        result += ' off';
    } else if (Action.on === action) {
        result += ' on';
    } else {
        result += ' unknown action';
    }
    if (dimLevel != null) {
        result += ` by ${dimLevel} levels`;
    }
    return result;
}
