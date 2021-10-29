const Controller = require('egg').Controller;

const fs = require('fs');
const FormStream = require('formstream');

class NpmController extends Controller {
    async index() {
        const ctx = this.ctx;

        // 示例：请求一个 npm 模块信息
        const result = await ctx.curl('https://registry.npm.taobao.org/egg/latest', {
            // 自动解析 JSON response
            dataType: 'json',
            // 3 秒超时
            timeout: 3000,
        });

        ctx.body = {
            status: result.status,
            headers: result.headers,
            package: result.data,
        };
    }

    async get() {
        const ctx = this.ctx;
        const result = await ctx.curl('https://httpbin.org/get?foo=bar');
        ctx.status = result.status;
        ctx.set(result.headers);
        ctx.body = result.data;
    }

    async post() {
        const ctx = this.ctx;
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
        ctx.body = result.data;
    }

    async put() {
        const ctx = this.ctx;
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
        ctx.body = result.data;
    }

    async del() {
        const ctx = this.ctx;
        const result = await ctx.curl('https://httpbin.org/delete', {
            // 必须指定 method
            method: 'DELETE',
            // 明确告诉 HttpClient 以 JSON 格式处理响应 body
            dataType: 'json',
        });
        ctx.body = result.data;
    }

    async submit() {
        const ctx = this.ctx;
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
        ctx.body = result.data.form;
        // 响应最终会是类似以下的结果：
        // {
        //   "foo": "bar",
        //   "now": "1483864184348"
        // }
    }

    async upload() {
        const { ctx } = this;

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

        ctx.body = result.data.files;
        // 响应最终会是类似以下的结果：
        // {
        //   "file": "'use strict';\n\nconst For...."
        // }
    }

    async uploadByStream() {
        const ctx = this.ctx;
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
        ctx.status = result.status;
        ctx.set(result.headers);
        ctx.body = result.data;
        // 响应最终会是类似以下的结果：
        // {"streamSize":574}
    }
}

module.exports = NpmController;