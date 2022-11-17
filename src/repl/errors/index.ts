import {Element} from '../../deps.ts';

export class ApplicationError extends Error {}

export class ElementNotFoundError extends ApplicationError {}

export class InvalidActionCoordsError extends ApplicationError {}

export class InvalidActionHandlerError extends ApplicationError {}

export class InvalidArgumentError extends ApplicationError {
    argument: string | null | undefined;

    constructor(argument: string | null | undefined) {
        super();
        this.argument = argument;
    }

    toString() {
        return this.argument;
    }
}

export class InvalidCoordinatesError extends ApplicationError {
    rawCoords: string | null | undefined;

    constructor(rawCoords: string | null | undefined) {
        super();
        this.rawCoords = rawCoords;
    }

    toString() {
        return this.rawCoords;
    }
}

export class MissingAttributeError extends ApplicationError {
    element: Element;
    attribute: string;

    constructor(element: Element, attribute: string) {
        super();
        this.element   = element;
        this.attribute = attribute;
    }

    toString(): string {
        return `Attribute "${this.attribute}" is missing on ${this.element}`;
    }
}

export class UnparsableHtmlResponseError extends ApplicationError {
    response: string | null | undefined;

    constructor(response: string) {
        super();
        this.response = response;
    }

    toString(): string {
        if (typeof this.response === 'undefined') return 'undefined';
        if (this.response === null) return 'null';
        return this.response;
    }
}

export class UninitializedError extends ApplicationError {}

// Errors, occurring due to wrong handling

export class HandlingError extends ApplicationError {}

export class UnknownCommandError extends HandlingError {
    command?: string;

    constructor(command?: string) {
        super();
        this.command = command;
    }

    toString() {
        return `Unknown command ${this.command}`;
    }
}

export class UnknownMode extends HandlingError {
    mode: string | undefined;

    constructor(mode: string | undefined) {
        super();
        this.mode = mode;
    }

    toString() {
        return `Unknown mode ${this.mode}`;
    }
}

export class MissingArgumentError extends HandlingError {}

/**
 * This error will be thrown when the user calls the help on a command or mode.
 * Commander expects the app to throw an error or the program will exit.
 * This error has to be thrown in that case instead, to identify that specific case.
 */
export class HelpCall extends ApplicationError {}
