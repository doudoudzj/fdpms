'use strict';

module.exports = (app) => {
    const { router, controller } = app;
    const { home } = controller.web;

    // 应用列表，我的应用
    router.get('/', home.systemlist);

    // 用户登录
    router.get('/login', home.login);

    // 应用端列表
    router.get('/apps', home.apps);

    // 新增应用，选择系统类型
    router.get('/apps/select', home.selectype);

    // 用户管理
    router.get('/users', home.users);

    // 系统重启错误信息
    router.get('/errors', home.errors);

    // 邮件管理
    router.get('/emails', home.emails);
};
