const Controller = require('egg').Controller;

class PostController extends Controller {
    async create() {
        const { ctx, service } = this;
        const createRule = {
            title: { type: 'string' },
            content: { type: 'string' },
        };
        // 校验参数
        ctx.validate(createRule);
        // 组装参数
        const author = ctx.session.userId;
        const req = Object.assign(ctx.request.body, { author });
        // 调用 Service 进行业务处理
        const res = await service.post.create(req);
        // 设置响应内容和响应状态码
        ctx.body = { id: res.id };
        ctx.status = 201;
    }

    async fetchPosts() {
        const ctx = this.ctx;
        // 获取 Session 上的内容
        const userId = ctx.session.userId;
        const posts = await ctx.service.post.fetch(userId);
        // 修改 Session 的值
        ctx.session.visited = ctx.session.visited ? ++ctx.session.visited : 1;
        ctx.body = {
            success: true,
            posts,
        };
    }

    async show() {
        this.ctx.body = {
            name: 'egg',
            category: 'framework',
            language: 'Node.js',
        };
    }
}

module.exports = PostController;