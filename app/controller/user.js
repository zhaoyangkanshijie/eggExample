const Controller = require('egg').Controller;
const ms = require('ms');

class UserController extends Controller {
    async fetch() {
        const { app, ctx } = this;
        const id = ctx.request.query.id;
        ctx.response.body = id;//app.cache.get(id);
    }

    async info() {
        const { ctx } = this;
        const userId = ctx.params.id;
        const userInfo = await ctx.service.user.find(userId);
        ctx.body = userInfo;
    }

    async get(name) {
        const { ctx } = this;
        const userInfo = await ctx.service.user.get(name);
        return userInfo;
    }

    async login() {
        const ctx = this.ctx;
        const { username, password, rememberMe } = ctx.request.body;
        const user = await ctx.loginAndGetUser(username, password);

        // 设置 Session
        ctx.session.user = user;
        // 如果用户勾选了 `记住我`，设置 30 天的过期时间
        if (rememberMe) ctx.session.maxAge = ms('30d');
    }
}

module.exports = UserController;