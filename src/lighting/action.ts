import { InvalidArgumentError } from '../repl/errors/index.ts';

export interface ActionDefinition {
    x: number;
    y: number;
}

// If you add any values here, also add them to `actionNames` as well
export enum ActionName {
    brighter = 'brighter',
    darker = 'darker',
    off = 'off',
    on = 'on',
    exit = 'exit'
}
// There seems to be no way to iterate over enums, so we make an explicit iterator
function* actionNames(): IterableIterator<ActionName> {
    yield ActionName.brighter;
    yield ActionName.darker;
    yield ActionName.off;
    yield ActionName.on;
    yield ActionName.exit;
}
export namespace ActionName {
    export function valueOf(value: string): ActionName {
        for (const entry of actionNames()) {
            if (entry.toString() === value) return entry;
        }
        throw new InvalidArgumentError(value);
    }
}

class Action {
    static [ActionName.brighter]: ActionDefinition = {
        x: 64,
        y: 19,
    };
    static [ActionName.darker]: ActionDefinition = {
        x: 64,
        y: 89,
    };
    static [ActionName.off]: ActionDefinition = {
        x: 19,
        y: 89,
    };
    static [ActionName.on]: ActionDefinition = {
        x: 19,
        y: 19,
    };
    static [ActionName.exit]: ActionDefinition = {
        x: -1,
        y: -1,
    };
}

export { Action };
