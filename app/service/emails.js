'use strict';

const Service = require('egg').Service;
const parser = require('cron-parser');

class EmailsService extends Service {
    /*
     * 保存用户上报的数据
     *
     * @param {*} pageNos
     * @param {*} pageSize
     * @param {*} email
     * @returns
     * @memberof EmailsService
     */
    async getList(pageNos, pageSize, phone, email) {
        pageNos = pageNos * 1;
        pageSize = pageSize * 1;

        const query = {};
        if (phone) query.phone = phone;
        if (email) query.email = email;

        const count = Promise.resolve(this.ctx.model.Email.count(query).exec());
        const datas = Promise.resolve(
            this.ctx.model.Email.find(query)
                .skip((pageNos - 1) * pageSize)
                .limit(pageSize)
                .exec()
        );
        const all = await Promise.all([count, datas]);
        const systemMags = {};
        const list = all[1] || [];

        // 获得邮件系统信息
        if (list && list.length) {
            for (let i = 0, len = list.length; i < len; i++) {
                if (list[i].system_ids && list[i].system_ids.length) {
                    const item = list[i].system_ids;
                    for (let o = 0, len = item.length; o < len; o++) {
                        const citem = item[o];
                        if (!systemMags[citem.system_id]) {
                            const result = await this.ctx.service.system.getSystemForAppId(citem.system_id);
                            systemMags[citem.system_id] = result;
                            citem.system_name = result.system_name;
                        } else {
                            citem.system_name = systemMags[citem.system_id].system_name;
                        }
                    }
                }
            }
        }

        return {
            datalist: list,
            totalNum: all[0],
            pageNo: pageNos
        };
    }

    /*
     * 查询联系人
     *
     * @param {*} id
     * @returns
     * @memberof SystemService
     */
    async getItem(id) {
        if (!id) throw new Error('查询邮箱：id不能为空');

        return (await this.ctx.model.Email.findOne({ _id: id }).exec()) || {};
    }

    /*
     * @param {*} email
     * @param {*} name
     * @returns
     * @memberof EmailsService
     */
    async addEmail(name, phone, email) {
        const emails = this.ctx.model.Email();
        emails.name = name;
        emails.phone = phone;
        emails.email = email;

        return await emails.save();
    }

    /*
     * 更新邮箱
     * @param {*} id
     * @param {*} email
     * @param {*} name
     * @returns
     * @memberof EmailsService
     */
    async updateEmail(id, name, phone, email) {
        const data = {
            $set: {
                name,
                phone,
                email
            }
        };
        // 更新信息
        // const result = await this.ctx.model.Email.updateOne({ _id: id }, data).exec();
        const result = await this.ctx.model.Email.findOneAndUpdate({ _id: id }, data).exec();
        // console.log('旧信息', result);

        // 更新应用关联信息
        if (result.email !== email && result.system_ids && result.system_ids.length > 0) {
            // console.log('改邮箱地址', result.email, email);
            await this.ctx.service.system.updateDaliyEmail(result.system_ids, result.email, email);
        }

        return {
            now: {
                name,
                phone,
                email
            },
            old: result
        };
    }

    /*
     * 删除邮箱
     * @param {*} id
     * @param {*} systemIds
     * @param {*} email
     * @returns
     * @memberof EmailsService
     */
    async deleteEmail(id, systemIds, email) {
        const result = await this.ctx.model.Email.findOneAndRemove({ _id: id }).exec();
        if (systemIds && systemIds.length) {
            systemIds.forEach((item) => {
                if (item.system_id && item.type === 'daliy') {
                    this.ctx.service.system.handleDaliyEmail(item.system_id, email, 2, false, 1);
                } else if (item.system_id && item.type === 'highest') {
                    this.ctx.service.system.handleDaliyEmail(item.system_id, email, 2, false, 2);
                }
            });
        }
        return result;
    }

    /*
     * 更新 system_ids字段
     *
     * @param {*} opt
     * @returns
     * @memberof EmailsService
     */
    async updateSystemIds(opt) {
        let { email, appId, handletype, handleitem } = opt;
        handletype = handletype * 1;
        handleitem = handleitem * 1;

        let str = '';
        let type = '';
        if (handleitem === 1) {
            str = '日报邮件通知';
            type = 'daliy';
        } else if (handleitem === 2) {
            str = '超过历史流量峰值邮件通知';
            type = 'highest';
        }
        const handleData = handletype === 1 ? { $push: { system_ids: { $each: [{ system_id: appId, desc: str, type }] } } } : { $pull: { system_ids: { system_id: appId, type } } };

        const result = await this.ctx.model.Email.update({ email }, handleData, { multi: true }).exec();
        return result;
    }

    /*
     * 超过历史pv流量峰值时发送邮件
     *
     * @param {*} [json={}]
     * @returns
     * @memberof EmailsService
     */
    async highestPvTipsEmail(json = {}) {
        const { appId, pv, uv, ip, ajax, flow } = json;
        const highestPv = parseInt((await this.app.redis.get(`${appId}_highest_pv_tips`)) || 0);
        if (pv <= highestPv || !pv) return;
        this.app.redis.set(`${appId}_highest_pv_tips`, pv);

        const systemMsg = await this.ctx.service.system.getSystemForAppId(appId);
        if (systemMsg.is_use !== 0 && systemMsg.is_highest_use !== 0) return;

        // 计算定时任务间隔
        const interval = parser.parseExpression(this.app.config.pvuvip_task_minute_time);
        const timer_1 = new Date(interval.prev().toString()).getTime();
        const timer_2 = new Date(interval.prev().toString()).getTime();
        const betTime = Math.abs(timer_1 - timer_2) / 1000 / 60;

        const from = `${systemMsg.system_name}应用在${betTime}分钟内突破历史流量峰值啦~`;
        const to = systemMsg.highest_list.toString();
        const day = this.app.format(new Date(), 'yyyy/MM/dd hh:mm:ss');

        const mailOptions = {
            from: `${from}<${this.app.config.email.client.auth.user}>`,
            to,
            subject: day,
            html: `
                    <div style="fong-size:25px;text-align:center;margin:50px 0 30px;">${systemMsg.system_name}应用在${betTime}分钟内突破历史流量峰值啦~</div>
                    <div style="margin-bottom:20px;">${day}</div>
                    <div style="margin-bottom:20px;">AJAX请求量：${ajax || 0}</div>
                    <div style="margin-bottom:20px;">PV请求量：${pv || 0}</div>
                    <div style="margin-bottom:20px;">UV请求量：${uv || 0}</div>
                    <div style="margin-bottom:20px;">IP请求量：${ip || 0}</div>
                    <div style="margin-bottom:20px;">流量消费：${this.app.flow(flow) || 0}</div>
                `
        };
        this.app.email.sendMail(mailOptions);
    }

    /*
     * 发送测试邮件
     *
     * @param {String} [to]
     * @returns
     * @memberof EmailsService
     */
    async sendTestEmail(opt) {
        const { to } = opt;
        const mailOptions = {
            from: `${this.app.config.name}<${this.app.config.email.client.auth.user}>`, // 性能监控系统<noreply@xxxx.com>
            to,
            subject: '测试邮件',
            html: '性能监控系统，测试邮件'
        };

        this.app.email.sendMail(mailOptions);
    }
}

module.exports = EmailsService;
