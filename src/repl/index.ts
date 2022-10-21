import { Command } from '../deps.ts';
import { executeCommand } from './commands/index.ts';
import { Repl, ReplCommand, ResultProcessor } from './repl.ts';
import { ApplicationError, MissingArgumentError } from './errors/index.ts';
import { Request, setUrl } from '../lighting/request.ts';
import { LitenetController } from '../lighting/index.ts';
import { Context } from './context.ts';

(async () => {
    const start = Date.now();
    const program = new Command()
        .version('0.0.1')
        .arguments('<url>')
        .requiredOption('-u, --username <username>', 'Username for the login')
        .requiredOption('-p, --password <password>', 'Password for the login')
        .option(
            '-r, --record <file-path>',
            'Records commands and writes them to file'
        )
        .action(async function (url: string, command: Command) {
            await run(url, command.username, command.password, command.record);
        });
    await program.parseAsync(Deno.args);
    console.log(`Session duration: ${Date.now() - start}ms`);
    await Deno.exit();
})();

async function run(
    url: string,
    username: string,
    password: string,
    filePathRecording?: string
) {
    const context = _createContext();
    setUrl(url);
    try {
        await Request.login(context, username, password);
    } catch (e) {
        console.log('Unable to connect to server');
        throw e;
    }
    LitenetController.setContext(context);
    const session = await Repl.start(context, {
        prompt: '> ',
        evalFunc: evalCmd,
    });
    filePathRecording && _writeHistory(session, filePathRecording);
}

async function evalCmd(
    line: string,
    context: Context,
    callback: ResultProcessor
) {
    let result;
    try {
        const replCommand = parseCommand(line);
        const start = Date.now();
        result = await executeCommand(context, replCommand);
        result = `${result} (${Date.now() - start}ms)`;
    } catch (e) {
        //        return callback(new repl.Recoverable(e));
        if (e instanceof ApplicationError) {
            callback(null, e.toString());
        } else {
            callback(null, e);
        }
        return;
    }
    callback(null, result);
}

function parseCommand(line: string): ReplCommand {
    const normalizedCmd = line.replace(/^\s*/g, '').replace(/\s+/g, ' ');
    const args = normalizedCmd.split(' ');
    const action = args.shift();
    if (!action) throw new MissingArgumentError('No ReplCommand found');
    return {
        action,
        args,
    };
}

function _createContext() {
    return new Context();
}

function _writeHistory(session: Repl, filePathRecording: string) {
    Deno.writeTextFileSync(filePathRecording, session.getHistory().join('\n'));
}
