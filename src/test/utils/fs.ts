const BASE_PATH__HTML = 'src/test/data/html/';
const FILENAME__LOGIN = 'login.aspx';
const FILENAME__DETAIL = 'detail.aspx';

let _detailPage: string | undefined;
let _loginPage: string | undefined;

export {
    getDetailPage,
    getLoginPage,
    readFile
}

async function getDetailPage(): Promise<string> {
    if (!_detailPage) {
        const page: Uint8Array = await readFile(`${BASE_PATH__HTML}${FILENAME__DETAIL}`);
        _detailPage = new TextDecoder().decode(page);
    }
    return _detailPage;
}

async function getLoginPage(): Promise<string> {
    if (!_loginPage) {
        const page: Uint8Array = await readFile(`${BASE_PATH__HTML}${FILENAME__LOGIN}`);
        _loginPage = new TextDecoder().decode(page);
    }
    return _loginPage;
}

async function readFile(filePath: string): Promise<Uint8Array> {
    const start = Date.now();
    try {
        return await Deno.readFile(filePath);
    } catch (e) {
        _log(`${filePath} could not be read`, start);
        throw e
    }
}

function _log(message: string | null, start: number) {
    const now = Date.now();
    console.log(`${now} (${now - start}ms): ${message}`);
}
