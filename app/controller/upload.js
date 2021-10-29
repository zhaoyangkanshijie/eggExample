const Controller = require('egg').Controller;
const fs = require('mz/fs');

class uploadController extends Controller {
    async uploadForm() {
        const { ctx } = this;
        const file = ctx.request.files[0];
        const name = 'egg-multipart-test/' + path.basename(file.filename);
        let result;
        try {
            // 处理文件，比如上传到云端
            result = await ctx.oss.put(name, file.filepath);
        } finally {
            // 需要删除临时文件
            await fs.unlink(file.filepath);
        }

        ctx.body = {
            url: result.url,
            // 获取所有的字段值
            requestBody: ctx.request.body,
        };
    }

    async uploadFormMutiple() {
        const { ctx } = this;
        console.log(ctx.request.body);
        console.log('got %d files', ctx.request.files.length);
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
    }

    async uploadStream() {
        const ctx = this.ctx;
        const stream = await ctx.getFileStream();
        const name = 'egg-multipart-test/' + path.basename(stream.filename);
        // 文件处理，上传到云存储等等
        let result;
        try {
            result = await ctx.oss.put(name, stream);
        } catch (err) {
            // 必须将上传的文件流消费掉，要不然浏览器响应会卡死
            await sendToWormhole(stream);
            throw err;
        }

        ctx.body = {
            url: result.url,
            // 所有表单字段都能通过 `stream.fields` 获取到
            fields: stream.fields,
        };
    }

    async uploadStreamMutiple() {
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
};

module.exports = uploadController;