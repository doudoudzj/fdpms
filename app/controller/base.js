'use strict';

const { Controller } = require('egg');
class BaseController extends Controller {
    init_base_config() {
        return [
            this.app.config.name,
            this.app.config.description
        ];
    }
}
module.exports = BaseController;
