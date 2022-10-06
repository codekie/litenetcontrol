export class Context {
    _cookies = new Map();

    constructor() {}

    setCookies(cookieStr: string | null | undefined) {
        if (!cookieStr) return;
        cookieStr.split(',').forEach((cookie) => {
            const [key, value] = cookie.split('=');
            this._cookies.set(key, value.split(';').shift());
        });
    }

    getCookieString() {
        const cookies = [];
        for (const [key, value] of this._cookies.entries()) {
            cookies.push(`${key}=${value}`);
        }
        return cookies.join(';');
    }
}
