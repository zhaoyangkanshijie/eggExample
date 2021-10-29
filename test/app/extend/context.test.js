const { app, mock, assert } = require('egg-mock/bootstrap');

describe('isXHR()', () => {
    it('should true', () => {
        const ctx = app.mockContext({
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
            },
        });
        assert(ctx.isXHR === true);
    });

    it('should false', () => {
        const ctx = app.mockContext({
            headers: {
                'X-Requested-With': 'SuperAgent',
            },
        });
        assert(ctx.isXHR === false);
    });
});