const moment = require('moment');

module.exports = {
    relativeTime(time) {
        return moment(new Date(time * 1000)).fromNow();
    },
    foo(param) {
        // this 是 helper 对象，在其中可以调用其他 helper 方法
        // this.ctx => context 对象
        // this.app => application 对象
    },
    money(val) {
        const lang = this.ctx.get('Accept-Language');
        if (lang.includes('zh-CN')) {
            return `￥ ${val}`;
        }
        return `$ ${val}`;
    },
    parseMsg(action, payload = {}, metadata = {}) {
        const meta = Object.assign({}, {
            timestamp: Date.now(),
        }, metadata);

        return {
            meta,
            data: {
                action,
                payload,
            },
        };
    },
};