const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    this.ctx.body = 'Hello world';
    //await this.ctx.render('home.tpl', { name: 'egg' });
  }

  async post() {
    this.ctx.body = this.ctx.request.body;
  }

  async httpclient() {
    const res = await this.ctx.curl('https://eggjs.org');
    this.ctx.body = res.data.toString();
  }

  async add() {
    const ctx = this.ctx;
    let count = ctx.cookies.get('count');
    count = count ? Number(count) : 0;
    ctx.cookies.set('count', ++count);
    ctx.body = count;
  }

  async remove() {
    const ctx = this.ctx;
    ctx.cookies.set('count', null);
    ctx.status = 204;
  }

  async fetchPosts() {
    const ctx = this.ctx;
    // 获取 Session 上的内容
    const userId = ctx.session.userId;
    const posts = await ctx.service.post.fetch(userId);
    // 修改 Session 的值
    ctx.session.visited = ctx.session.visited ? (ctx.session.visited + 1) : 1;
    ctx.body = {
      success: true,
      posts,
    };
  }
}

module.exports = HomeController;