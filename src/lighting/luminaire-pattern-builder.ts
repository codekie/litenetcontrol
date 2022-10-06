import { Context } from '../repl/context.ts';
import { Luminaire } from './luminaire.ts';

export type Coords = [number, number];

export interface GetRowOpts {
    fromRightToLeft?: boolean;
}

export type LuminairePatternArgs =
    | number
    | string
    | GetRowOpts
    | Coords
    | undefined;

export type LuminairePattern =
    | ((this: null, coords: Coords) => Luminaire[]) // getSingle
    | ((
          this: null,
          coordsLeftTop: Coords,
          coordsRightBottom: Coords
      ) => Luminaire[]) // getArea
    | ((this: null, col: number) => Luminaire[]) // getColumn
    | ((this: null, row: number, opts?: GetRowOpts) => Luminaire[]) // getRow
    | ((this: null) => Luminaire[]); // getSpiral

interface LuminaireMatrixOpts {
    pattern: string;
    columnNumbers: number[];
    rowStartIndices: number[];
    rows: number;
}

class LuminairePatternBuilder {
    static ROWS = 12;
    static luminaires = LuminairePatternBuilder._createLuminaireMatrix({
        pattern: 'Leuchte_R21G{colnum}B{rownum}',
        columnNumbers: [1, 13, 25, 37],
        rowStartIndices: [1, 13, 25, 37],
        rows: LuminairePatternBuilder.ROWS,
    });

    static _context: Context;

    static setContext(context: Context): void {
        LuminairePatternBuilder._context = context;
        Luminaire.setContext(context);
    }

    static getSingle(coords: Coords): Luminaire[] {
        return LuminairePatternBuilder.getArea(coords, coords);
    }
    static getArea(
        coordsLeftTop: Coords = [0, 0],
        coordsRightBottom: Coords = [
            LuminairePatternBuilder.luminaires.length,
            LuminairePatternBuilder.luminaires[0].length,
        ]
    ): Luminaire[] {
        const cols = LuminairePatternBuilder.luminaires.slice();
        const isColsFlipped = _flip(cols, coordsLeftTop, coordsRightBottom, 0);
        return cols.reduce((res, col, idxCol, arrCols) => {
            idxCol = isColsFlipped ? arrCols.length - 1 - idxCol : idxCol;
            if (!_isInRange(coordsLeftTop[0], coordsRightBottom[0], idxCol))
                return res;
            const rows = col.slice();
            const isRowsFlipped = _flip(
                rows,
                coordsLeftTop,
                coordsRightBottom,
                1
            );
            rows.forEach((_row, idxRow, arrRows) => {
                idxRow = isRowsFlipped ? arrRows.length - 1 - idxRow : idxRow;
                if (!_isInRange(coordsLeftTop[1], coordsRightBottom[1], idxRow))
                    return;
                res.push(LuminairePatternBuilder.luminaires[idxCol][idxRow]);
            });
            return res;
        }, [] as Luminaire[]);
    }
    static getColumn(idx: number): Luminaire[] {
        return LuminairePatternBuilder.luminaires[idx];
    }
    static getRow(
        idx: number,
        { fromRightToLeft }: GetRowOpts = {}
    ): Luminaire[] {
        const luminaires = LuminairePatternBuilder.luminaires;
        const cols = fromRightToLeft
            ? luminaires.slice().reverse()
            : luminaires;
        return cols.reduce((res, column) => {
            res.push(column[idx]);
            return res;
        }, []);
    }
    static getSpiral(): Luminaire[] {
        const pattern = [];
        const cols = LuminairePatternBuilder.luminaires.length;
        const rows = LuminairePatternBuilder.luminaires[0].length;

        for (const luminaire of genSpiral(cols, rows)) {
            pattern.push(luminaire);
        }
        return pattern;

        function* genSpiral(cols: number, rows: number) {
            const directions = ['right', 'down', 'left', 'up'];
            // [x, y]: top-right, bottom-right, bottom-left, top-left
            const limits: Coords[] = [
                [cols - 1, 0],
                [cols - 1, rows - 1],
                [0, rows - 1],
                [0, 1],
            ];
            let idxDirection = 0;
            let idxLimit = 0;
            let coords: Coords = [0, 0];
            let direction = directions[idxDirection];
            for (let i = 0; i < cols * rows; i++) {
                const limit: Coords = limits[idxLimit];
                yield LuminairePatternBuilder.luminaires[coords[0]][coords[1]];
                coords = move(direction, coords);
                if (reachedLimit(limit, coords)) {
                    limits[idxLimit] = narrowLimit(direction, limit);
                    idxLimit = ++idxLimit % limits.length;
                    idxDirection = ++idxDirection % directions.length;
                    direction = directions[idxDirection];
                }
            }
        }

        function move(direction: string, [x, y]: Coords): Coords {
            if (direction === 'right') return [x + 1, y];
            if (direction === 'down') return [x, y + 1];
            if (direction === 'left') return [x - 1, y];
            if (direction === 'up') return [x, y - 1];
            throw new Error(`Unknown direction ${direction}`);
        }

        function narrowLimit(direction: string, [x, y]: Coords): Coords {
            if (direction === 'right') return [x - 1, y + 1];
            if (direction === 'down') return [x - 1, y - 1];
            if (direction === 'left') return [x + 1, y - 1];
            if (direction === 'up') return [x + 1, y + 1];
            throw new Error(`Unknown direction ${direction}`);
        }

        function reachedLimit([limX, limY]: Coords, [x, y]: Coords) {
            return limX === x && limY === y;
        }
    }

    static _createLuminaireMatrix({
        pattern,
        columnNumbers,
        rowStartIndices,
        rows,
    }: LuminaireMatrixOpts): Luminaire[][] {
        return columnNumbers.reduce((res, colNumber, idxCol) => {
            const resRows: Luminaire[] = [];
            for (let idxRow = 0; idxRow < rows; idxRow++) {
                const name = pattern
                    .replace('{colnum}', `${colNumber}`.padStart(2, '0'))
                    .replace(
                        '{rownum}',
                        `${rowStartIndices[idxCol] + idxRow}`.padStart(2, '0')
                    );
                resRows.push(new Luminaire(name));
            }
            res.push(resRows);
            return res;
        }, [] as Luminaire[][]);
    }
}

export { LuminairePatternBuilder };

// IMPLEMENTATION DETAILS

function _isInRange(border1: number, border2: number, value: number): boolean {
    return (
        value <= Math.max(border1, border2) &&
        value >= Math.min(border1, border2)
    );
}

function _flip(
    arr: Array<any>,
    coordsLeftTop: Coords,
    coordsRightBottom: Coords,
    idxCoord: number
): boolean {
    if (coordsLeftTop[idxCoord] <= coordsRightBottom[idxCoord]) return false;
    arr.reverse();
    return true;
}
