const { app, mock, assert } = require('egg-mock/bootstrap');

describe('isChrome()', () => {
    it('should true', () => {
        const ctx = app.mockContext({
            headers: {
                'User-Agent': 'Chrome/56.0.2924.51',
            },
        });
        assert(ctx.request.isChrome === true);
    });

    it('should false', () => {
        const ctx = app.mockContext({
            headers: {
                'User-Agent': 'FireFox/1',
            },
        });
        assert(ctx.request.isChrome === false);
    });
});