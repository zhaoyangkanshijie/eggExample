const Subscription = require('egg').Subscription;

class PullRefresh extends Subscription {
    // 通过 schedule 属性来设置定时任务的执行间隔等配置
    static get schedule() {
        return {
            interval: '10s', 
            type: 'worker', 
        };
    }

    // subscribe 是真正定时任务执行时被运行的函数
    async subscribe(ctx) {
        //     const needRefresh = await ctx.service.source.checkUpdate();
        //     if (!needRefresh) return;

        //     // notify all workers to update memory cache from `file`
        //     ctx.app.messenger.sendToApp('refresh', 'pull');
    }
}

module.exports = PullRefresh;