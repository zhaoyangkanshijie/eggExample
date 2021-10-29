const { app, mock, assert } = require('egg-mock/bootstrap');

describe('test/controller/home.test.js', () => {
    describe('GET /', () => {
        it('should status 200 and get the body', () => {
            // 对 app 发起 `GET /` 请求
            return app.httpRequest()
                .get('/')
                .expect(200) // 期望返回 status 200
                .expect('Hello world'); // 期望 body 是 hello world
        });

        it('should send multi requests', async () => {
            // 使用 generator function 方式写测试用例，可以在一个用例中串行发起多次请求
            await app.httpRequest()
                .get('/')
                .expect(200) // 期望返回 status 200
                .expect('Hello world'); // 期望 body 是 hello world

            // 再请求一次
            const result = await app.httpRequest()
                .get('/')
                .expect(200)
                .expect('Hello world');

            // 也可以这样验证
            assert(result.status === 200);
        });

        it('should status 200 and get the request body', () => {
            // 模拟 CSRF token，下文会详细说明
            app.mockCsrf();
            return app.httpRequest()
                .post('/post')
                .type('form')
                .send({
                    foo: 'bar',
                })
                .expect(200)
                .expect({
                    foo: 'bar',
                });
        });
    });

    describe('GET /httpclient', () => {
        it('should mock httpclient response', () => {
            app.mockHttpclient('https://eggjs.org', {
                // 模拟的参数，可以是 buffer / string / json，
                // 都会转换成 buffer
                // 按照请求时的 options.dataType 来做对应的转换
                data: 'mock eggjs.org response',
            });
            return app.httpRequest()
                .get('/httpclient')
                .expect('mock eggjs.org response');
        });
    });
});