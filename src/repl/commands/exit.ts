import { Action } from '../../lighting/action.ts';

export { exit };

async function exit(_action: Action, _args: string[]): Promise<string> {
    return 'Exiting';
}
