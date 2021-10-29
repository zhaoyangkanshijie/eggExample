const { app, mock, assert } = require('egg-mock/bootstrap');

describe('isSuccess()', () => {
    it('should true', () => {
        const ctx = app.mockContext();
        ctx.status = 200;
        assert(ctx.response.isSuccess === true);
    });

    it('should false', () => {
        const ctx = app.mockContext();
        ctx.status = 404;
        assert(ctx.response.isSuccess === false);
    });
});