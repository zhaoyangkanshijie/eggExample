const Controller = require('egg').Controller;

class ProxyController extends Controller {
    async proxy() {
        const ctx = this.ctx;
        const result = await ctx.curl(url, {
            streaming: true,
        });
        ctx.set(result.header);
        // result.res 是一个 stream
        ctx.body = result.res;
    }

    async show() {
        const ctx = this.ctx;
        const start = Date.now();
        ctx.body = await ctx.service.post.get();
        const used = Date.now() - start;
        // 设置一个响应头
        ctx.set('show-response-time', used.toString());
    }
};

module.exports = ProxyController;