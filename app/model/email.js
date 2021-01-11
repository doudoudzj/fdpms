'use strict';

module.exports = (app) => {
    const mongoose = app.mongoose;
    const Schema = mongoose.Schema;
    const conn = app.mongooseDB.get('db3');

    const EmailSchema = new Schema({
        email: { type: String }, // 联系人邮箱地址
        phone: { type: String }, // 联系人手机号
        name: { type: String }, // 联系人姓名
        system_ids: { type: Array }, // 联系人关联的应用信息
        create_time: { type: Date, default: Date.now } // 联系人创建时间
    });

    EmailSchema.index({ email: -1 });

    return conn.model('Email', EmailSchema);
};
