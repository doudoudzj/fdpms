'use strict';

const Controller = require('egg').Controller;

class EmailsController extends Controller {
    async getList() {
        const { ctx } = this;
        const query = ctx.request.query;
        const pageNo = query.pageNo;
        const pageSize = query.pageSize || this.app.config.pageSize;
        const phone = query.phone;
        const email = query.email;

        const result = await ctx.service.emails.getList(pageNo, pageSize, phone, email);

        ctx.body = this.app.result({
            data: result
        });
    }

    async addEmail() {
        const { ctx } = this;
        const query = ctx.request.body;
        const name = query.name;
        const phone = query.phone;
        const email = query.email;
        if (!name) throw new Error('新增联系人：姓名不能为空!');
        if (!email) throw new Error('新增联系人：邮箱地址不能为空!');

        const result = await ctx.service.emails.addEmail(name, phone, email);

        ctx.body = this.app.result({
            data: result
        });
    }

    async updateEmail() {
        const { ctx } = this;
        const { id, name, phone, email } = ctx.request.body;

        if (!id) throw new Error('编辑联系人：id不能为空!');
        if (!name) throw new Error('编辑联系人：姓名不能为空!');
        if (!email) throw new Error('编辑联系人：邮箱地址不能为空!');

        const result = await ctx.service.emails.updateEmail(id, name, phone, email);

        ctx.body = this.app.result({
            data: result
        });
    }

    async sendTestEmail() {
        const { ctx } = this;
        const query = ctx.request.body;
        const to = query.to;

        if (!to) throw new Error('发送测试邮件：收件人不能为空!');

        const result = await ctx.service.emails.sendTestEmail({
            to
        });

        this.app.logger.info(`----------发送测试邮件----${to}------`);

        ctx.body = this.app.result({
            data: result
        });
    }

    async deleteEmail() {
        const { ctx } = this;
        const query = ctx.request.body;
        const id = query.id;
        const systemIds = query.systemIds || [];
        const email = query.email;

        if (!id) throw new Error('删除联系人：id不能为空!');

        const result = await ctx.service.emails.deleteEmail(id, systemIds, email);

        ctx.body = this.app.result({
            data: result
        });
    }
}

module.exports = EmailsController;
