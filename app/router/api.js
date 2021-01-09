'use strict';

module.exports = (app) => {
    const apiV1Router = app.router.namespace('/api/v1/');
    const { controller, middleware } = app;
    const { accounts, remove, system, errors, emails } = controller.api;

    // 校验用户是否登录中间件
    const tokenRequired = middleware.tokenRequired();

    // -----------------账号相关------------------
    // 账号登录
    apiV1Router.post('accounts/login', accounts.login);
    // 账号注册
    apiV1Router.post('accounts/register', accounts.register);
    // 退出登录
    apiV1Router.get('accounts/logout', tokenRequired, accounts.logout);
    // 账号列表
    apiV1Router.post('accounts/list', tokenRequired, accounts.getUserList);
    // 冻结/解冻账号
    apiV1Router.post('accounts/setIsUse', tokenRequired, accounts.setIsUse);
    // 删除账号
    apiV1Router.post('accounts/delete', tokenRequired, accounts.delete);
    // 第三方登录：GitHub
    apiV1Router.get('accounts/github/callback', accounts.githubLogin);
    // 第三方登录：新浪微博
    apiV1Router.get('accounts/weibo/callback', accounts.weiboLogin);
    // 第三方登录：微信微博
    apiV1Router.get('accounts/wechat/callback', accounts.wechatLogin);

    // ----------------系统配置相关---------------
    // 新增系统
    apiV1Router.post('system/add', tokenRequired, system.addNewSystem);
    // 修改系统
    apiV1Router.post('system/update', tokenRequired, system.updateSystem);
    // 根据用户ID获得系统信息
    apiV1Router.get('system/getSysForUserId', tokenRequired, system.getSysForUserId);
    // 根据系统ID获得单个系统信息
    apiV1Router.get('system/getSystemForId', tokenRequired, system.getSystemForId);
    // 获得系统列表
    apiV1Router.get('system/web/list', tokenRequired, system.getWebSystemList);
    // 删除系统中某个用户
    apiV1Router.post('system/deleteUser', tokenRequired, system.deleteWebSystemUser);
    // 新增系统中某个用户
    apiV1Router.post('system/addUser', tokenRequired, system.addWebSystemUser);
    // 删除某个系统
    apiV1Router.post('system/deleteSystem', tokenRequired, system.deleteSystem);
    // 日报邮件操作
    apiV1Router.post('system/handleDaliyEmail', tokenRequired, system.handleDaliyEmail);

    // -------------------清空数据-----------------------------
    // 清空db1 1日之前无用数据
    apiV1Router.post('remove/deleteDb1WebData', tokenRequired, remove.deleteDb1WebData);
    // 清空db2 number日之前所有性能数据
    apiV1Router.post('remove/deleteDb2WebData', tokenRequired, remove.deleteDb2WebData);

    // -------------------系统错误信息-----------------------------
    apiV1Router.get('errors/getSysDbErrorList', tokenRequired, errors.getSysDbErrorList);

    // -------------------邮件信息-----------------------------
    apiV1Router.get('emails/list', tokenRequired, emails.getList);

    apiV1Router.post('emails/add', tokenRequired, emails.addEmail);
    // 更新邮箱
    apiV1Router.post('emails/update', tokenRequired, emails.updateEmail);
    // 发送测试邮件
    apiV1Router.post('emails/test', tokenRequired, emails.sendTestEmail);

    apiV1Router.post('emails/delete', tokenRequired, emails.deleteEmail);
};
