export interface ActionDefinition {
    x: number;
    y: number;
}

class Action {
    static brighter: ActionDefinition = {
        x: 64,
        y: 19,
    };
    static darker: ActionDefinition = {
        x: 64,
        y: 89,
    };
    static off: ActionDefinition = {
        x: 19,
        y: 89,
    };
    static on: ActionDefinition = {
        x: 19,
        y: 19,
    };
}

export { Action };
