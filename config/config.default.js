exports.keys = '<此处改为你自己的 Cookie 安全字符串>';// 承载 Session 的 Cookie 键值对名字
// exports.maxAge = 86400000; // Session 的最大有效时间

exports.session = {
    key: 'EGG_SESS',
    maxAge: 24 * 3600 * 1000, // 1 天
    httpOnly: true,
    encrypt: true,
};

// 配置需要的中间件，数组顺序即为中间件的加载顺序
exports.middleware = [
    'robot', 'gzip', 'notfoundHandler', 'errorHandler'
];
// robot's configurations
exports.robot = {
    ua: [
        /curl/i,
        /Baiduspider/i,
    ]
};
// 配置 gzip 中间件的配置
exports.gzip = {
    threshold: 1024, // 小于 1k 的响应体不压缩
};


exports.jsonp = {
    callback: 'callback', // 识别 query 中的 `callback` 参数
    limit: 100, // 函数名最长为 100 个字符
    csrf: true,
    whiteList: /^https?:\/\/test.com\//,//whiteList: [ 'sub.test.com', 'sub2.test.com' ],
};

exports.security = {
    domainWhiteList: ['.domain.com'],  // 安全白名单，以 . 开头
};

exports.mysql = {
    client: {
        host: '127.0.0.1',
        port: '3306',
        user: 'root',
        password: '123456',
        database: 'test',
    },
};

exports.httpclient = {
    // 是否开启本地 DNS 缓存，默认关闭，开启后有两个特性
    // 1. 所有的 DNS 查询都会默认优先使用缓存的，即使 DNS 查询错误也不影响应用
    // 2. 对同一个域名，在 dnsCacheLookupInterval 的间隔内（默认 10s）只会查询一次
    enableDNSCache: false,
    // 对同一个域名进行 DNS 查询的最小间隔时间
    dnsCacheLookupInterval: 10000,
    // DNS 同时缓存的最大域名数量，默认 1000
    dnsCacheMaxLength: 1000,

    request: {
        // 默认 request 超时时间
        timeout: 3000,
    },

    httpAgent: {
        // 默认开启 http KeepAlive 功能
        keepAlive: true,
        // 空闲的 KeepAlive socket 最长可以存活 4 秒
        freeSocketTimeout: 4000,
        // 当 socket 超过 30 秒都没有任何活动，就会被当作超时处理掉
        timeout: 30000,
        // 允许创建的最大 socket 数
        maxSockets: Number.MAX_SAFE_INTEGER,
        // 最大空闲 socket 数
        maxFreeSockets: 256,
    },

    httpsAgent: {
        // 默认开启 https KeepAlive 功能
        keepAlive: true,
        // 空闲的 KeepAlive socket 最长可以存活 4 秒
        freeSocketTimeout: 4000,
        // 当 socket 超过 30 秒都没有任何活动，就会被当作超时处理掉
        timeout: 30000,
        // 允许创建的最大 socket 数
        maxSockets: Number.MAX_SAFE_INTEGER,
        // 最大空闲 socket 数
        maxFreeSockets: 256,
    },
};


exports.onerror = {
    all(err, ctx) {
        // 在此处定义针对所有响应类型的错误处理方法
        // 注意，定义了 config.all 之后，其他错误处理方法不会再生效
        ctx.body = 'error';
        ctx.status = 500;
    },
    html(err, ctx) {
        // html hander
        ctx.body = '<h3>error</h3>';
        ctx.status = 500;
    },
    json(err, ctx) {
        // json hander
        ctx.body = { message: 'error' };
        ctx.status = 500;
    },
    jsonp(err, ctx) {
        // 一般来说，不需要特殊针对 jsonp 进行错误定义，jsonp 的错误处理会自动调用 json 错误处理，并包装成 jsonp 的响应格式
    },
}

exports.errorHandler = {
    match: '/api',
}

exports.io = {
    init: {}, // passed to engine.io
    namespace: {
        '/': {
            connectionMiddleware: [],
            packetMiddleware: [],
        },
        '/example': {
            connectionMiddleware: [],
            packetMiddleware: [],
        },
    },
};