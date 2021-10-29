# eggExample

## 参考链接

* [Egg.js](https://eggjs.org/zh-cn/intro/)

## 目录

* [项目简介](#项目简介)
* [应用运行](#应用运行)
* [基础使用](#基础使用)
* [中间件](#中间件)
* [路由](#路由)
* [控制器](#控制器)
* [服务](#服务)
* [定时任务](#定时任务)
* [单元测试](#单元测试)
* [应用部署](#应用部署)
* [多进程模型](#多进程模型)
* [模板渲染](#模板渲染)
* [数据库](#数据库)
* [ORM框架](#ORM框架)

---

## 项目简介

* 概念

    Egg 是基于koa的企业级框架和应用，奉行“约定优于配置”的原则。

* 环境

    操作系统：支持 macOS，Linux，Windows

    运行环境：建议选择 LTS 版本，最低要求 8.x。npm >=6.1.0

    * 自定义运行环境

        windows: set EGG_SERVER_ENV=test && do something

        mac/linux: EGG_SERVER_ENV=test && do something

* 搭建

    * cli

        ```cmd
        mkdir egg-example && cd egg-example
        npm init egg --type=simple
        npm i
        ```

    * 手动创建

        ```cmd
        mkdir egg-example
        cd egg-example
        npm init
        npm i egg --save
        npm i egg-bin --save-dev
        ```

        package.json
        ```json
        "scripts": {
            "dev": "egg-bin dev --sticky",
            "test": "egg-bin test",
            "cov": "egg-bin cov",
            "debug": "egg-bin debug --inpsect=9229",
            "start": "egg-scripts start --daemon --sticky",
            "stop": "egg-scripts stop"
        },
        ```

        目录结构
        ```txt
        egg-project
        ├── package.json
        ├── app.js (可选)启动配置
        ├── agent.js (可选)代理配置
        ├── app
        │   ├── router.js路由
        │   ├── controller控制器
        │   │   └── home.js
        │   ├── service (可选)服务层
        │   │   └── user.js
        │   ├── model (可选)模型
        │   │   └── user.js
        │   ├── io (可选)websocket相关
        │   │   ├── controller
        │   │   │    └── default.js
        │   │   └── middleware
        │   │        ├── auth.js授权
        │   │        ├── connection.js连接或者退出
        │   │        └── packet.js消息处理
        │   ├── middleware (可选)中间件
        │   │   └── response_time.js
        │   ├── schedule (可选)定时任务
        │   │   └── my_task.js
        │   ├── public (可选)资源
        │   │   └── reset.css
        │   ├── view (可选)MVC页面
        │   │   └── home.tpl
        │   └── extend (可选)框架拓展
        │       ├── helper.js (可选)工具函数
        │       ├── request.js (可选)请求时相关函数
        │       ├── response.js (可选)响应时相关函数
        │       ├── context.js (可选)上下文相关函数(头部userAgent等)
        │       ├── application.js (可选)应用层函数(LRU等)
        │       └── agent.js (可选)代理函数
        ├── config配置文件
        │   ├── locale (可选)国际化文件
        │   │   └── zh-CN.js
        │   ├── plugin.js插件开关
        │   ├── config.default.js通用配置(sessionKey/中间件声明和顺序/数据库配置/log相关)
        │   ├── config.prod.js仅生产环境有效配置
        │   ├── config.test.js (可选)
        │   ├── config.local.js (可选)
        │   └── config.unittest.js (可选)
        ├── log日志文件 (可选)
        ├── └── 项目名称 (可选)
        │       ├── common-error.log logger.error() 调用输出的日志
        │       ├── egg-agent.log 代理进程日志
        │       ├── 项目名称-web.log 应用相关日志
        │       ├── egg-schedule.log 定时任务日志
        │       └── egg-web.log 框架内核、插件日志
        ├── coverage (可选) 覆盖率测试
        └── test测试相关
            ├── middleware
            |   └── response_time.test.js
            └── controller
                └── home.test.js
        ```

## 应用运行

* 文件加载顺序

    1. 加载 plugin，找到应用和框架，加载 config/plugin.js
    2. 加载 config，遍历 loadUnit 加载 config/config.{env}.js
    3. 加载 extend，遍历 loadUnit 加载 app/extend/xx.js
    4. 自定义初始化，遍历 loadUnit 加载 app.js 和 agent.js
    5. 加载 service，遍历 loadUnit 加载 app/service 目录
    6. 加载 middleware，遍历 loadUnit 加载 app/middleware 目录
    7. 加载 controller，加载应用的 app/controller 目录
    8. 加载 router，加载应用的 app/router.js

* 生命周期(app.js 和 agent.js)

    * 配置文件即将加载，这是最后动态修改配置的时机（configWillLoad）
    * 配置文件加载完成，可执行同步逻辑（如app修改中间件顺序）（configDidLoad）
    * 文件加载完成，可执行异步任务（如agent异步拉取配置加载client，检查client是否正常）（didLoad）
    * 插件加载完毕，可执行流量进入前的任务（willReady）
    * worker 准备就绪，可以正常工作,emit 'agent-start'或'app-start'（didReady）
    * 应用启动完成（serverDidReady）
    * 应用即将关闭（beforeClose）

* 启动过程

    1. 启动主进程
    2. 进入代理

        1. 代理worker
        2. 加载plugin、config，extend
        3. 加载agent，进入生命周期至didReady

    3. 进入app

        1. 开启app worker
        2. 加载plugin、config，extend
        3. 加载app，进入生命周期至configDidLoad
        4. 加载service/middleware/controller/router
        5. 进入生命周期至didReady

    4. emit 'egg-ready'
    5. async serverDidReady
    6. 主进程收到SIGTERM
    7. beforeClose应用关闭

## 基础使用

* 对象

    * koa继承对象

        * Application -> app
        * Context -> ctx
        * Request -> 同ctx.request
        * Response -> 同ctx.response

    * 扩展对象

        * Controller

            ```js
            const Controller = require('egg').Controller;
            class UserController extends Controller {
                // implement
            }
            module.exports = UserController;
            ```

        * Service
        
            ```js
            const Service = require('egg').Service;
            class UserService extends Service {
                // implement
            }
            module.exports = UserService;
            ```
        
        * Helper
        
            ```js
            ctx.helper.***(***);
            ```
            
        * Config

            ```js
            module.export = {
                a : {
                    ...
                },
                b : {
                    ...
                },
            }
            //或
            export.a = {
                ...
            }
            export.b = {
                ...
            }
            ```
        
        * Logger

            * logger.debug()
            * logger.info()
            * logger.warn()
            * logger.error()
            * app.logger
            * app.coreLogger
            * ctx.logger
            * ctx.coreLogger
            * this.logger(controller/service)

        * Subscription

            ```js
            const Subscription = require('egg').Subscription;

            class Schedule extends Subscription {
                // 需要实现此方法
                // subscribe 可以为 async function 或 generator function
                async subscribe() {}
            }
            ```

## 中间件

* 写法与koa一致,app/middleware/todo.js
```js
async function todo(ctx, next) {
    // to do
    await next();
    //next to do
}
```

* 使用配置项,options框架会将 app.config.${middlewareName}传递进来

app/config/config.default.js
```js
exports.middleware = [
    'todo',...//加载顺序从前往后
];
exports.todo = {
    threshold: 1024
};
```
app/middleware/todo.js
```js
module.exports = options => {
  return async function gzip(ctx, next) {
    await next();

    // options.threshold
  };
};
```
中间件开关app/config/plugin.js
```js
exports.todo = {
    enable: true,
    package: 'todo',
};
```

* 在框架和插件中使用中间件
```js
// app.js
module.exports = app => {
  // 在中间件最前面统计请求时间
  app.config.coreMiddleware.unshift('report');
};

// app/middleware/report.js
module.exports = () => {
  return async function (ctx, next) {
    const startTime = Date.now();
    await next();
    // 上报请求时间
    reportTime(Date.now() - startTime);
  }
};
```

* router 中使用中间件
```js
module.exports = app => {
  const gzip = app.middleware.gzip({ threshold: 1024 });
  app.router.get('/needgzip', gzip, app.controller.handler);
};
```

## 路由

app/router.js
```js
module.exports = app => {
    const jsonp = app.jsonp();
    const { router, controller } = app;
    router.${method}([可选别名],路由,[...可选N个中间件],(restful可只指定到controller,mvc需指定到action))
    router.post('/user', isLoginUser, hasAdminPermission, controller.user.create);
    router.resources('users', '/api/v1/users', controller.v1.users);
    app.router.get(/^\/package\/([\w-.]+\/[\w-.]+)$/, app.controller.package.detail);
};
```

method 包含 get,put,post,patch,head,option,del(delete是关键字，所以del是别名),redicrect(重定向)

resources(表示restful) 生成:
* method = get,path = /${controller}s,路由别名 = ${controller}s,action = app.controller.${controller}s.index
* method = get,path = /${controller}/new,路由别名 = new_${controller},action = app.controller.${controller}s.new
* method = get,path = /${controller}/:id,路由别名 = ${controller},action = app.controller.${controller}s.show
* method = get,path = /${controller}/:id/edit,路由别名 = edit_${controller},action = app.controller.${controller}s.edit
* method = post,path = /${controller}s,路由别名 = ${controller}s,action = app.controller.${controller}s.create
* method = put,path = /${controller}s/:id,路由别名 = ${controller},action = app.controller.${controller}s.update
* method = delete,path = /${controller}s/:id,路由别名 = ${controller},action = app.controller.${controller}s.destroy

分散式路由
```js
// app/router.js
module.exports = app => {
  require('./router/news')(app);
  require('./router/admin')(app);
};

// app/router/news.js
module.exports = app => {
  app.router.get('/news/list', app.controller.news.list);
  app.router.get('/news/detail', app.controller.news.detail);
};

// app/router/admin.js
module.exports = app => {
  app.router.get('/admin/user', app.controller.admin.user);
  app.router.get('/admin/log', app.controller.admin.log);
};
```

## 控制器

* egg-validate校验参数

npm install --save egg-validate

普通使用
```js
ctx.validate({
    userName: 'userName',	// 自定义的校验规则
    password: 'password',	// 自带的校验规则
    sex: ['men', 'women'],	// 性别是men或者women
    age: {
        type: 'number',// 年龄范围0-120
        min: 0,
        max: 120
    }
});
```

自定义规则
```js
app.validator.addRule('userName', (rule, value)=>{// value就是待检验的数据
    if (/^\d+$/.test(value)) {
      return "用户名应该是字符串";
    }
    else if (value.length < 3 || value.length > 10) {
      console.log("用户名的长度应该在3-10之间");
    }
});

ctx.validate(userName:{
    type: 'userName',
    isAdmin: true
});
```

```js
// app/controller/post.js
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
}
module.exports = PostController;
```

* 基类controller

```js
// app/core/base_controller.js
const { Controller } = require('egg');
class BaseController extends Controller {
  //...
}
module.exports = BaseController;
```

```js
const Controller = require('../core/base_controller');
class PostController extends Controller {
  //...
}
```

* 数据获取

1. ctx.query获取get参数:category=egg&language=node

```js
// {
//   category: 'egg',
//   language: 'node',
// }
```

2. ctx.queries获取get参数:category=egg&id=1&id=2&id=3

```js
// {
//   category: [ 'egg' ],
//   id: [ '1', '2', '3' ],
// }
```

3. ctx.params获取url参数:/projects/:projectId/app/:appId

    ctx.params.projectId

    ctx.params.appId

4. ctx.request.body获取post参数

    ctx.request.body.title

    ctx.request.body.content

5. ctx.request.files获取文件

```js
ctx.request.files获取文件
ctx.request.files.length
for (const file of ctx.request.files) {
    console.log('field: ' + file.fieldname);
    console.log('filename: ' + file.filename);
    console.log('encoding: ' + file.encoding);
    console.log('mime: ' + file.mime);
    console.log('tmp filepath: ' + file.filepath);
    let result;
    try {
        // 处理文件，比如上传到云端
        result = await ctx.oss.put('egg-multipart-test/' + file.filename, file.filepath);
    } finally {
        // 需要删除临时文件
        await fs.unlink(file.filepath);
    }
    console.log(result);
}
```

6. ctx.getFileStream()获取文件流

```js
const stream = await ctx.getFileStream();
```

7. 多个文件流

```js
const sendToWormhole = require('stream-wormhole');
const Controller = require('egg').Controller;

class UploaderController extends Controller {
  async upload() {
    const ctx = this.ctx;
    const parts = ctx.multipart();
    let part;
    // parts() 返回 promise 对象
    while ((part = await parts()) != null) {
      if (part.length) {
        // 这是 busboy 的字段
        console.log('field: ' + part[0]);
        console.log('value: ' + part[1]);
        console.log('valueTruncated: ' + part[2]);
        console.log('fieldnameTruncated: ' + part[3]);
      } else {
        if (!part.filename) {
          // 这时是用户没有选择文件就点击了上传(part 是 file stream，但是 part.filename 为空)
          // 需要做出处理，例如给出错误提示消息
          return;
        }
        // part 是上传的文件流
        console.log('field: ' + part.fieldname);
        console.log('filename: ' + part.filename);
        console.log('encoding: ' + part.encoding);
        console.log('mime: ' + part.mime);
        // 文件处理，上传到云存储等等
        let result;
        try {
          result = await ctx.oss.put('egg-multipart-test/' + part.filename, part);
        } catch (err) {
          // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
          await sendToWormhole(part);
          throw err;
        }
        console.log(result);
      }
    }
    console.log('and we are done parsing the form!');
  }
}

module.exports = UploaderController;
```

8. 获取header

```js
ctx.headers['name']
ctx.host
ctx.protocol//https,http
ctx.ips//获取请求经过所有的中间设备 IP 地址列表
ctx.ip//获取请求发起方的 IP 地址
ctx.set('show-response-time', used.toString());
```

9. 获取cookie

```js
class CookieController extends Controller {
  async add() {
    const ctx = this.ctx;
    let count = ctx.cookies.get('count');
    count = count ? Number(count) : 0;
    ctx.cookies.set('count', ++count);
    ctx.body = count;
  }

  async remove() {
    const ctx = this.ctx;
    const count = ctx.cookies.set('count', null);
    ctx.status = 204;
  }
}
```

10. 获取session

```js
class PostController extends Controller {
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
  async deleteSession() {
    this.ctx.session = null;
  }
}
```

config.default.js
```js
module.exports = {
  key: 'EGG_SESS', // 承载 Session 的 Cookie 键值对名字
  maxAge: 86400000, // Session 的最大有效时间
};
```

11. mvc渲染页面

```js
await ctx.render('home.tpl', { name: 'egg' });
```

12. jsonp

controller正常写，router添加jsonp插件

框架默认通过 query 中的 _callback 参数作为识别是否返回 JSONP 格式数据的依据，并且 _callback 中设置的方法名长度最多只允许 50 个字符。应用可以在 config/config.default.js 全局覆盖默认的配置：

```js
exports.jsonp = {
  callback: 'callback', // 识别 query 中的 `callback` 参数
  limit: 100, // 函数名最长为 100 个字符
  csrf: true
};
```

配置之后，如果用户请求 /api/posts/1?callback=fn，响应为 JSONP 格式，如果用户请求 /api/posts/1，响应格式为 JSON。

## 服务

* 完整示例

```js
// app/router.js
module.exports = app => {
  app.router.get('/user/:id', app.controller.user.info);
};

// app/controller/user.js
const Controller = require('egg').Controller;
class UserController extends Controller {
  async info() {
    const { ctx } = this;
    const userId = ctx.params.id;
    const userInfo = await ctx.service.user.find(userId);
    ctx.body = userInfo;
  }
}
module.exports = UserController;

// app/service/user.js
const Service = require('egg').Service;
class UserService extends Service {
  // 默认不需要提供构造函数。
  // constructor(ctx) {
  //   super(ctx); 如果需要在构造函数做一些处理，一定要有这句话，才能保证后面 `this.ctx`的使用。
  //   // 就可以直接通过 this.ctx 获取 ctx 了
  //   // 还可以直接通过 this.app 获取 app 了
  // }
  async find(uid) {
    // 假如 我们拿到用户 id 从数据库获取用户详细信息
    const user = await this.ctx.db.query('select * from user where uid = ?', uid);

    // 假定这里还有一些复杂的计算，然后返回需要的信息。
    const picture = await this.getPicture(uid);

    return {
      name: user.user_name,
      age: user.age,
      picture,
    };
  }

  async getPicture(uid) {
    const result = await this.ctx.curl(`http://photoserver/uid=${uid}`, { dataType: 'json' });
    return result.data;
  }
}
module.exports = UserService;

// curl http://127.0.0.1:7001/user/1234
```

* 发送请求

get
```js
const result = await ctx.curl('https://httpbin.org/get?foo=bar');
```

post
```js
const result = await ctx.curl('https://httpbin.org/post', {
    // 必须指定 method
    method: 'POST',
    // 通过 contentType 告诉 HttpClient 以 JSON 格式发送
    contentType: 'json',
    data: {
        hello: 'world',
        now: Date.now(),
    },
    // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
    dataType: 'json',
});
```

put
```js
const result = await ctx.curl('https://httpbin.org/put', {
    // 必须指定 method
    method: 'PUT',
    // 通过 contentType 告诉 HttpClient 以 JSON 格式发送
    contentType: 'json',
    data: {
        update: 'foo bar',
    },
    // 明确告诉 HttpClient 以 JSON 格式处理响应 body
    dataType: 'json',
});
```

delete
```js
const result = await ctx.curl('https://httpbin.org/delete', {
    // 必须指定 method
    method: 'DELETE',
    // 明确告诉 HttpClient 以 JSON 格式处理响应 body
    dataType: 'json',
});
```

Form 表单提交
```js
const result = await ctx.curl('https://httpbin.org/post', {
    // 必须指定 method，支持 POST，PUT 和 DELETE
    method: 'POST',
    // 不需要设置 contentType，HttpClient 会默认以 application/x-www-form-urlencoded 格式发送请求
    data: {
        now: Date.now(),
        foo: 'bar',
    },
    // 明确告诉 HttpClient 以 JSON 格式处理响应 body
    dataType: 'json',
});
```

Multipart上传文件
```js
const result = await ctx.curl('https://httpbin.org/post', {
    method: 'POST',
    dataType: 'json',
    data: {
        foo: 'bar',
    },

    // 单文件上传
    files: __filename,

    // 多文件上传
    // files: {
    //   file1: __filename,
    //   file2: fs.createReadStream(__filename),
    //   file3: Buffer.from('mock file content'),
    // },
});
```

Stream 上传文件
```js
// 上传当前文件本身用于测试
const fileStream = fs.createReadStream(__filename);
// httpbin.org 不支持 stream 模式，使用本地 stream 接口代替
const url = `${ctx.protocol}://${ctx.host}/stream`;
const result = await ctx.curl(url, {
    // 必须指定 method，支持 POST，PUT
    method: 'POST',
    // 以 stream 模式提交
    stream: fileStream,
});
```

options参数
```js
// config/config.default.js
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
```

## 定时任务

* 样例

app/schedule/update_cache.js
```js
const Subscription = require('egg').Subscription;

class UpdateCache extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      interval: '1m', // 1 分钟间隔
      type: 'all', // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const res = await this.ctx.curl('http://www.api.com/cache', {
      dataType: 'json',
    });
    this.ctx.app.cache = res.data;
  }
}

module.exports = UpdateCache;
```

* 定时方式

```js
module.exports = {
  schedule: {
    // 每 10 秒执行一次
    interval: '10s',
  },
};

module.exports = {
  schedule: {
    // 每三小时准点执行一次
    cron: '0 0 */3 * * *',
  },
};
```
cron-parser 支持可选的秒（linux crontab 不支持）
```txt
*    *    *    *    *    *
┬    ┬    ┬    ┬    ┬    ┬
│    │    │    │    │    |
│    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
│    │    │    │    └───── month (1 - 12)
│    │    │    └────────── day of month (1 - 31)
│    │    └─────────────── hour (0 - 23)
│    └──────────────────── minute (0 - 59)
└───────────────────────── second (0 - 59, optional)
```

* 配置定时任务的参数

```js
module.exports = app => {
  return {
    schedule: {
      interval: app.config.cacheTick,
      type: 'all',
    },
    async task(ctx) {
      const res = await ctx.curl('http://www.api.com/cache', {
        contentType: 'json',
      });
      ctx.app.cache = res.data;
    },
  };
};
```

* 手动执行定时任务

```js
module.exports = app => {
  app.beforeStart(async () => {
    // 保证应用启动监听端口前数据已经准备好了
    // 后续数据的更新由定时任务自动触发
    await app.runSchedule('update_cache');
  });
};
```

## 单元测试

* 基本样例

test/controller/home.test.js
```js
const { app, mock, assert } = require('egg-mock/bootstrap');

describe('test/controller/home.test.js', () => {
  // test cases
});
```

* 执行顺序

```js
describe('egg test', () => {
  before(() => console.log('order 1'));
  before(() => console.log('order 2'));
  beforeEach(() => console.log('order 3'));
  it('should worker', () => console.log('order 4'));
  afterEach(() => console.log('order 5'));
  after(() => console.log('order 6'));
});
```

* ctx

获取ctx
```js
it('should get a ctx', () => {
  const ctx = app.mockContext();
  const user = await ctx.service.user.get('fengmk2');
  assert(user);
  assert(ctx.method === 'GET');
  assert(ctx.url === '/');
});
```

模拟ctx.user数据
```js
it('should mock ctx.user', () => {
  const ctx = app.mockContext({
    user: {
      name: 'fengmk2',
    },
  });
  assert(ctx.user);
  assert(ctx.user.name === 'fengmk2');
});
```

* 异步测试

```js
it('should redirect', async () => {
  await app.httpRequest()
    .get('/')
    .expect(302);
});
```

* 通过csrf防护

框架的默认安全插件会自动开启 CSRF 防护,app.mockCsrf() 方法来模拟取 CSRF token 的过程
```js
it('should status 200 and get the request body', () => {
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
```

* mockSession

```js
describe('GET /session', () => {
  it('should mock session work', () => {
    app.mockSession({
      foo: 'bar',
      uid: 123,
    });
    return app.httpRequest()
      .get('/session')
      .expect(200)
      .expect({
        session: {
          foo: 'bar',
          uid: 123,
        },
      });
  });
});
```

因为 mock 之后会一直生效，我们需要避免每个单元测试用例之间是不能相互 mock 污染的， 所以通常我们都会在 afterEach 钩子里面还原掉所有 mock。

```js
describe('some test', () => {
  // before hook

  afterEach(mock.restore);

  // it tests
});
```

* Mock Service

app.mockService(service, methodName, fn) 模拟 Service 方法返回值
```js
it('should mock fengmk1 exists', () => {
  app.mockService('user', 'get', () => {
    return {
      name: 'fengmk1',
    };
  });

  return app.httpRequest()
    .get('/user?name=fengmk1')
    .expect(200)
    // 返回了原本不存在的用户信息
    .expect({
      name: 'fengmk1',
    });
});
```

app.mockServiceError(service, methodName, error) 可以模拟 Service 调用异常
```js
it('should mock service error', () => {
  app.mockServiceError('user', 'get', 'mock user service error');
  return app.httpRequest()
    .get('/user?name=fengmk2')
    // service 异常，触发 500 响应
    .expect(500)
    .expect(/mock user service error/);
});
```

* Mock HttpClient

app.mockHttpclient(url, method, data) 来 mock 掉 app.curl 和 ctx.curl 方法， 从而实现各种网络异常情况
```js
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
```

## 应用部署

* 环境配置

    服务器需要预装 Node.js，框架支持的 Node 版本为 >= 8.0.0。

    框架内置了 egg-cluster 来启动 Master 进程，Master 有足够的稳定性，不再需要使用 pm2 等进程守护模块。

    同时，框架也提供了 egg-scripts 来支持线上环境的运行和停止。

    npm i egg-scripts --save
    ```json
    {
        "scripts": {
            "start": "egg-scripts start --daemon",
            "stop": "egg-scripts stop"
        }
    }
    ```

* 启动命令:egg-scripts start

    * --port=7001 端口号，默认会读取环境变量 process.env.PORT，如未传递将使用框架内置端口 7001。
    * --daemon 是否允许在后台模式，无需 nohup。若使用 Docker 建议直接前台运行。
    * --env=prod 框架运行环境，默认会读取环境变量 process.env.EGG_SERVER_ENV， 如未传递将使用框架内置环境 prod。
    * --workers=2 框架 worker 线程数，默认会创建和 CPU 核数相当的 app worker 数，可以充分的利用 CPU 资源。
    * --title=egg-server-showcase 用于方便 ps 进程时 grep 用，默认为 egg-server-${appname}。
    * --framework=yadan 如果应用使用了自定义框架，可以配置 package.json 的 egg.framework 或指定该参数。
    * --ignore-stderr 忽略启动期的报错。
    * --https.key 指定 HTTPS 所需密钥文件的完整路径。
    * --https.cert 指定 HTTPS 所需证书文件的完整路径。

* 启动配置项

```js
// config/config.default.js

exports.cluster = {
  listen: {
    port: 7001,
    hostname: '127.0.0.1', // 不建议设置 hostname 为 '0.0.0.0'，它将允许来自外部网络和来源的连接，请在知晓风险的情况下使用
    // path: '/var/run/egg.sock',
  }
}
```

* 停止命令

egg-scripts stop [--title=egg-server]

该命令将杀死 master 进程，并通知 worker 和 agent 优雅退出。

--title=egg-server 用于杀死指定的 egg 应用，未传递则会终止所有的 Egg 应用。 

也可以直接通过 ps -eo "pid,command" | grep -- "--title=egg-server" 来找到 master 进程，并 kill 掉，无需 kill -9。

* 监控

1. Node.js 性能平台（alinode）仅支持 macOS 和 Linux，不支持 Windows，需使用阿里云

    [alinode](https://www.aliyun.com/product/nodejs)

2. NSolid

    [NSolid](https://nodesource.com/products/nsolid/)

## 多进程模型

* 异常处理

    1. 当一个 Worker 进程遇到 未捕获的异常

        * 关闭异常 Worker 进程所有的 TCP Server（将已有的连接快速断开，且不再接收新的连接），断开和 Master 的 IPC 通道，不再接受新的用户请求。
        * Master 立刻 fork 一个新的 Worker 进程，保证在线的 Worker 总数不变。
        * 异常 Worker 等待一段时间，处理完已经接受的请求后退出。

    2. 当一个进程出现异常导致 crash 或者 OOM 被系统杀死

        让当前进程直接退出，Master 立刻 fork 一个新的 Worker。

* 代理机制

    ```txt
                    +--------+          +-------+
                    | Master |<-------->| Agent |
                    +--------+          +-------+
                    ^   ^    ^
                /    |     \
                /      |       \
            /        |         \
            v          v          v
    +----------+   +----------+   +----------+
    | Worker 1 |   | Worker 2 |   | Worker 3 |
    +----------+   +----------+   +----------+
    ```

    有些工作不需要每个 Worker 都去做，例如日志文件我们按日期归档，多进程做同样的事会混乱，因此放到一个单独的进程（Agent Worker）上去执行。

    * 启动时序

        ```txt
        +---------+           +---------+          +---------+
        |  Master |           |  Agent  |          |  Worker |
        +---------+           +----+----+          +----+----+
            |      fork agent     |                    |
            +-------------------->|                    |
            |      agent ready    |                    |
            |<--------------------+                    |
            |                     |     fork worker    |
            +----------------------------------------->|
            |     worker ready    |                    |
            |<-----------------------------------------+
            |      Egg ready      |                    |
            +-------------------->|                    |
            |      Egg ready      |                    |
            +----------------------------------------->|
        ```

        * 注意

            1. 业务相关的工作不应该放到 Agent 上去做。但只想让代码运行在一个进程上的时候，Agent 进程就到了发挥作用的时候了。
            2. Agent 只有一个，而且会负责许多维持连接的脏活累活，因此它不能轻易挂掉和重启，需保证Agent相对稳定。当它发生未捕获异常，框架不会像 App Worker 一样让他退出重启，而是记录异常日志、报警等待人工处理。
            3. Master 进程承担了进程管理的工作（类似 pm2），不运行任何业务代码，我们只需要运行起一个 Master 进程它就会帮我们搞定所有的 Worker、Agent 进程的初始化以及重启等工作了。
            4. Worker 进程负责处理真正的用户请求和定时任务的处理。而 Egg 的定时任务也提供了只让一个 Worker 进程运行的能力，所以能够通过定时任务解决的问题就不要放到 Agent 上执行。

* 进程间通讯（IPC）

    * 发送

        * app.messenger.broadcast(action, data)：发送给所有的 agent / app 进程（包括自己）
        * app.messenger.sendToApp(action, data): 发送给所有的 app 进程
            * 在 app 上调用该方法会发送给自己和其他的 app 进程
            * 在 agent 上调用该方法会发送给所有的 app 进程
        * app.messenger.sendToAgent(action, data): 发送给 agent 进程
            * 在 app 上调用该方法会发送给 agent 进程
            * 在 agent 上调用该方法会发送给 agent 自己
        * agent.messenger.sendRandom(action, data):
            * app 上没有该方法（现在 Egg 的实现是等同于 sentToAgent）
            * agent 会随机发送消息给一个 app 进程（由 master 来控制发送给谁）
        * app.messenger.sendTo(pid, action, data): 发送给指定进程

        * 样例

            ```js
            // app.js
            module.exports = app => {
                // 注意，只有在 egg-ready 事件拿到之后才能发送消息
                app.messenger.once('egg-ready', () => {
                    app.messenger.sendToAgent('agent-event', { foo: 'bar' });
                    app.messenger.sendToApp('app-event', { foo: 'bar' });
                });
            }
            ```

    * 接收

        ```js
        app.messenger.on(action, data => {
            // process data
        });
        app.messenger.once(action, data => {
            // process data
        });
        ```

## 模板渲染

npm i egg-view-nunjucks --save

```js
// config/plugin.js
exports.nunjucks = {
  enable: true,
  package: 'egg-view-nunjucks',
};
```

默认为 ${baseDir}/app/view。支持配置多个目录
```js
// config/config.default.js
const path = require('path');
module.exports = appInfo => {
  const config = {};
  config.view = {
    root: [
      path.join(appInfo.baseDir, 'app/view'),
      path.join(appInfo.baseDir, 'path/to/another'),
    ].join(',')
  };
  return config;
};
```

指定 .nj 后缀的文件使用 Nunjucks 进行渲染
```js
module.exports = {
  view: {
    mapping: {
      '.nj': 'nunjucks',
    },
  },
};
```

渲染页面
```js
// {app_root}/app/controller/home.js
class HomeController extends Controller {
  async index() {
    const data = { name: 'egg' };

    // render a template, path relate to `app/view`
    await ctx.render('home/index.tpl', data);

    // or manually set render result to ctx.body
    ctx.body = await ctx.renderView('path/to/file.tpl', data);

    // or render string directly
    ctx.body = await ctx.renderString('hi, {{ name }}', data, {
      viewEngine: 'nunjucks',
    });
  }
}
```

## 数据库

npm i --save egg-mysql
```js
// config/plugin.js
exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};
```

单数据源
```js
// config/config.${env}.js
exports.mysql = {
  // 单数据库信息配置
  client: {
    // host
    host: 'mysql.com',
    // 端口号
    port: '3306',
    // 用户名
    user: 'test_user',
    // 密码
    password: 'test_password',
    // 数据库名
    database: 'test',
  },
  // 是否加载到 app 上，默认开启
  app: true,
  // 是否加载到 agent 上，默认关闭
  agent: false,
};
```

多数据源
```js
exports.mysql = {
  clients: {
    // clientId, 获取client实例，需要通过 app.mysql.get('clientId') 获取
    db1: {
      // host
      host: 'mysql.com',
      // 端口号
      port: '3306',
      // 用户名
      user: 'test_user',
      // 密码
      password: 'test_password',
      // 数据库名
      database: 'test',
    },
    db2: {
      // host
      host: 'mysql2.com',
      // 端口号
      port: '3307',
      // 用户名
      user: 'test_user',
      // 密码
      password: 'test_password',
      // 数据库名
      database: 'test',
    },
    // ...
  },
  // 所有数据库配置的默认值
  default: {

  },

  // 是否加载到 app 上，默认开启
  app: true,
  // 是否加载到 agent 上，默认关闭
  agent: false,
};
```

CRUD使用
```js
const user = await this.ctx.db.query('select * from user where id = ?', id);

 //SELECT * FROM `user` WHERE `id` = 12 LIMIT 0, 1;
const getOne = await this.app.mysql.get('user', { id: 12 });
//SELECT * FROM `user`;
const getAll = await this.app.mysql.select('user');

//SELECT `firstName`, `lastName` FROM `user` WHERE `firstName` = 'Timber' AND `lastName` IN('a','b') ORDER BY `age` DESC, `id` DESC LIMIT 0, 10;
const results = await this.app.mysql.select('user', { // 搜索 post 表
    where: { firstName: 'Timber', lastName: ['a', 'b'] }, // WHERE 条件
    columns: ['firstName', 'lastName'], // 要查询的表字段
    orders: [['age', 'desc'], ['id', 'desc']], // 排序方式
    limit: 10, // 返回数据量
    offset: 0, // 数据偏移量
});

const row = {
    id: 1,
    age: 22,
    firstName: 'a',
    lastName: 'b',
    //time: this.app.mysql.literals.now, // `now()` on db server
};
const result = await this.app.mysql.update('user', row); // 更新 user 表中的记录
// UPDATE `user` SET `age` = 22, `firstName` = 'a', `lastName` = 'b' WHERE id = 1 ;

// 判断更新成功
const updateSuccess = result.affectedRows === 1;

const row2 = {
    age: 22,
    firstName: 'a',
    lastName: 'b',
};

const options = {
    where: {
        custom_id: 1
    }
};
const result2 = await this.app.mysql.update('user', row2, options); // 更新 user 表中的记录
// UPDATE `user` SET `age` = 22, `firstName` = 'a', `lastName` = 'b' WHERE id = 1 ;

const result = await this.app.mysql.delete('user', {
    firstName: 'a',
});// DELETE FROM `user` WHERE `firstName` = 'a';
```

使用事务
```js
//手动控制
const conn = await app.mysql.beginTransaction(); // 初始化事务

try {
  await conn.insert(table, row1);  // 第一步操作
  await conn.update(table, row2);  // 第二步操作
  await conn.commit(); // 提交事务
} catch (err) {
  // error, rollback
  await conn.rollback(); // 一定记得捕获异常后回滚事务！！
  throw err;
}

//自动控制
const result = await app.mysql.beginTransactionScope(async conn => {
  // don't commit or rollback by yourself
  await conn.insert(table, row1);
  await conn.update(table, row2);
  return { success: true };
}, ctx);
```

表达式(Literal)
```js
await this.app.mysql.insert(table, {
  create_time: this.app.mysql.literals.now,
});
//INSERT INTO `$table`(`create_time`) VALUES(NOW())

const Literal = this.app.mysql.literals.Literal;
const first = 'James';
const last = 'Bond';
await this.app.mysql.insert(table, {
  id: 123,
  fullname: new Literal(`CONCAT("${first}", "${last}"`),
});

//INSERT INTO `$table`(`id`, `fullname`) VALUES(123, CONCAT("James", "Bond"))
```

## ORM框架

npm install --save egg-sequelize mysql2

plugin.js
```js
exports.sequelize = {
  enable: true,
  package: 'egg-sequelize',
};
```

Model
```js
module.exports = app => {
  const { STRING, INTEGER, DATE } = app.Sequelize;

  const User = app.model.define('user', {
    id: { type: INTEGER, primaryKey: true, autoIncrement: true },
    name: STRING(30),
    age: INTEGER,
    created_at: DATE,
    updated_at: DATE,
  });

  return User;
};
```

app/controller/users.js
```js
const Controller = require('egg').Controller;

function toInt(str) {
  if (typeof str === 'number') return str;
  if (!str) return str;
  return parseInt(str, 10) || 0;
}

class UserController extends Controller {
  async index() {
    const ctx = this.ctx;
    const query = { limit: toInt(ctx.query.limit), offset: toInt(ctx.query.offset) };
    ctx.body = await ctx.model.User.findAll(query);
  }

  async show() {
    const ctx = this.ctx;
    ctx.body = await ctx.model.User.findByPk(toInt(ctx.params.id));
  }

  async create() {
    const ctx = this.ctx;
    const { name, age } = ctx.request.body;
    const user = await ctx.model.User.create({ name, age });
    ctx.status = 201;
    ctx.body = user;
  }

  async update() {
    const ctx = this.ctx;
    const id = toInt(ctx.params.id);
    const user = await ctx.model.User.findByPk(id);
    if (!user) {
      ctx.status = 404;
      return;
    }

    const { name, age } = ctx.request.body;
    await user.update({ name, age });
    ctx.body = user;
  }

  async destroy() {
    const ctx = this.ctx;
    const id = toInt(ctx.params.id);
    const user = await ctx.model.User.findByPk(id);
    if (!user) {
      ctx.status = 404;
      return;
    }

    await user.destroy();
    ctx.status = 200;
  }
}

module.exports = UserController;
```

test/app/controller/users.test.js
```js
const { assert, app } = require('egg-mock/bootstrap');

describe('test/app/controller/users.test.js', () => {
  describe('GET /users', () => {
    it('should work', async () => {
      // 通过 factory-girl 快速创建 user 对象到数据库中
      await app.factory.createMany('user', 3);
      const res = await app.httpRequest().get('/users?limit=2');
      assert(res.status === 200);
      assert(res.body.length === 2);
      assert(res.body[0].name);
      assert(res.body[0].age);
    });
  });

  describe('GET /users/:id', () => {
    it('should work', async () => {
      const user = await app.factory.create('user');
      const res = await app.httpRequest().get(`/users/${user.id}`);
      assert(res.status === 200);
      assert(res.body.age === user.age);
    });
  });

  describe('POST /users', () => {
    it('should work', async () => {
      app.mockCsrf();
      let res = await app.httpRequest().post('/users')
        .send({
          age: 10,
          name: 'name',
        });
      assert(res.status === 201);
      assert(res.body.id);

      res = await app.httpRequest().get(`/users/${res.body.id}`);
      assert(res.status === 200);
      assert(res.body.name === 'name');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should work', async () => {
      const user = await app.factory.create('user');

      app.mockCsrf();
      const res = await app.httpRequest().delete(`/users/${user.id}`);
      assert(res.status === 200);
    });
  });
});
```

如果我们需要在 CI 中运行单元测试，需要确保在执行测试代码之前，执行一次 migrate 确保数据结构更新

```json
{
  "scripts": {
    "ci": "eslint . && NODE_ENV=test npx sequelize db:migrate && egg-bin cov"
  }
}
```