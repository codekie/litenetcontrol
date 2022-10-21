// command | deno run --allow-run manage.ts <task> |

_run();

async function _run() {
    const task: string | undefined = Deno.args[0];
    const args: string[] = Deno.args.slice(1);

    // switch statement for each possible task
    switch (task) {
        case 'start':
            await _start(args);
            break;

        case 'test':
            await _test();
            break;

        case 'test-watch':
            await _testWatch();
            break;

        case 'coverage':
            await _coverage();
            break;

        // default output if not a script you made

        default:
            console.log(`No task "${task}" found`);
    }
}

async function _start(args: string[]) {
    await Deno.run({
        cmd: [
            'deno',
            'run',
            '--allow-net',
            '--allow-env',
            '--allow-read',
            '--allow-write',
            'src/repl/index.ts',
            ...args,
        ],
    }).status();
}

async function _test() {
    await Deno.run({
        cmd: ['deno', 'test', '--allow-read'],
    }).status();
}

async function _testWatch() {
    await Deno.run({
        cmd: ['deno', 'test', '--watch', '--allow-read'],
    }).status();
}

async function _coverage() {
    await Deno.run({
        cmd: [
            'deno',
            'test',
            '--allow-read',
            '--coverage=coverage',
        ],
    }).status();
    await Deno.run({
        cmd: ['deno', 'coverage', 'coverage', '--lcov', '--output=lcov.info'],
    }).status();
}
