'use strict';

module.exports = (app) => {
    const { router, controller } = app;
    const { home } = controller.web;

    // -----------------后台页面路由------------------
    // 后台首页，我的应用
    router.get('/', home.systemlist);

    // 用户登录
    router.get('/login', home.login);

    // 应用列表
    router.get('/apps', home.apps);

    // 新增应用，选择系统类型
    router.get('/apps/add', home.selectype);

    // 账号管理
    router.get('/accounts', home.accounts);

    // 系统重启错误信息
    router.get('/errors', home.errors);

    // 邮件管理
    router.get('/emails', home.emails);
};
