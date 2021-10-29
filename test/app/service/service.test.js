const { app, mock, assert } = require('egg-mock/bootstrap');

describe('get()', () => {
    it('should get exists user', async () => {
        // 创建 ctx
        const ctx = app.mockContext();
        // 通过 ctx 访问到 service.user
        const user = await ctx.service.user.get('fengmk2');
        assert(user);
        assert(user === 'fengmk2');
    });

    // it('should get null when user not exists', async () => {
    //     const ctx = app.mockContext();
    //     const user = await ctx.service.user.get('fengmk1');
    //     assert(!user);
    // });

    // it('should mock fengmk1 exists', () => {
    //     app.mockService('user', 'get', () => {
    //         return 'fengmk1';
    //     });

    //     return app.httpRequest()
    //         .get('/user?name=fengmk1')
    //         .expect(200)
    //         // 返回了原本不存在的用户信息
    //         .expect('fengmk1');
    // });

    // it('should mock service error', () => {
    //     app.mockServiceError('user', 'get', 'mock user service error');
    //     return app.httpRequest()
    //         .get('/user?name=fengmk2')
    //         // service 异常，触发 500 响应
    //         .expect(500)
    //         .expect(/mock user service error/);
    // });
});