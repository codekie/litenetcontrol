import {
    Coords,
    LuminairePattern,
    LuminairePatternArgs,
    LuminairePatternBuilder,
} from './luminaire-pattern-builder.ts';
import { Command } from './command.ts';
import { Action } from './action.ts';

class LightPattern {
    static dim(action: Action, levels: number): Action[] {
        const actions = [];
        for (let i = 0; i < levels; i++) {
            actions.push(action);
        }
        return actions;
    }

    static spread(commands: Command[], duration = 50): Command[] {
        return commands.reduce((res, command, idx, arr) => {
            res.push(command);
            if (idx === arr.length - 1) return res;
            res.push(Command.wait(duration));
            return res;
        }, [] as Command[]);
    }
    static trail(commands: Command[], duration = 500): Command[] {
        commands = (Array.isArray(commands) ? commands : [commands]).slice();
        commands.push(Command.wait(duration));
        commands.forEach((command) => {
            if (!command.luminaire || command.luminaire.disabled) return;
            commands.push(new Command(command.luminaire, Action.off));
        });
        return commands;
    }

    static shutterRow(idxRow: number, { spread = 250 } = {}): Command[] {
        return LightPattern.spread(
            [
                ...LightPattern.byLuminairePattern(
                    Action.on,
                    LuminairePatternBuilder.getRow,
                    idxRow
                ),
                Command.wait(500),
                ...LightPattern.byLuminairePattern(
                    Action.off,
                    LuminairePatternBuilder.getRow,
                    idxRow,
                    { fromRightToLeft: true }
                ),
            ],
            spread
        );
    }
    static dimSingle(action: Action, levels: number, coords: Coords) {
        return LightPattern.dimArea(action, levels, coords, coords);
    }
    static dimArea(
        action: Action,
        levels: number,
        coordsLeftTop: Coords,
        coordsRightBottom: Coords
    ) {
        return LightPattern.byLuminairePattern(
            LightPattern.dim(action, levels),
            LuminairePatternBuilder.getArea,
            coordsLeftTop,
            coordsRightBottom
        );
    }
    static switchOffArea(coordsLeftTop: Coords, coordsRightBottom: Coords) {
        return LightPattern.byLuminairePattern(
            Action.off,
            LuminairePatternBuilder.getArea,
            coordsLeftTop,
            coordsRightBottom
        );
    }
    static switchOffColumn(idxCol: number) {
        return LightPattern.switchOffArea(
            [idxCol, 0],
            [idxCol, LuminairePatternBuilder.ROWS]
        );
    }
    static switchOnArea(coordsLeftTop: Coords, coordsRightBottom: Coords) {
        return LightPattern.byLuminairePattern(
            Action.on,
            LuminairePatternBuilder.getArea,
            coordsLeftTop,
            coordsRightBottom
        );
    }
    static switchOffRow(idxRow: number) {
        return LightPattern.switchOffArea(
            [idxRow, 0],
            [idxRow, LuminairePatternBuilder.ROWS]
        );
    }
    static switchOffSingle(coords: Coords) {
        return LightPattern.switchOffArea(coords, coords);
    }
    static switchOnSingle(coords: Coords) {
        return LightPattern.switchOnArea(coords, coords);
    }
    static switchOnColumn(idxCol: number) {
        return LightPattern.switchOnArea(
            [idxCol, 0],
            [idxCol, LuminairePatternBuilder.ROWS]
        );
    }
    static byLuminairePattern(
        action: Action,
        luminairePattern: LuminairePattern,
        ...args: LuminairePatternArgs[]
    ): Command[] {
        if (typeof action === 'function') action = action();
        const actions = Array.isArray(action) ? action.slice() : [action];
        return actions.reduce((res, action) => {
            res.splice(
                res.length,
                0,
                // @ts-ignore TS2684
                ...luminairePattern
                    .apply(null, args)
                    .map((luminaire) => new Command(luminaire, action))
            );
            return res;
        }, [] as Command[]);
    }
    static marqueeColumn(column: number, duration: number) {
        return ([] as Command[])
            .concat(
                LightPattern.byLuminairePattern(
                    Action.on,
                    LuminairePatternBuilder.getColumn,
                    column
                )
            )
            .concat([Command.wait(duration)])
            .concat(
                LightPattern.byLuminairePattern(
                    Action.off,
                    LuminairePatternBuilder.getColumn,
                    column
                )
            );
    }
}

export { LightPattern };
