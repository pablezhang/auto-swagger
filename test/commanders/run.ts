/**
 * @Description:
 * @Autho:
 * @Date:2019/9/26 17:49
 */
import chalk from "chalk";
import SwaggerToService from "../../src/lib/swagger";
import { sortBy, uniqBy } from "lodash";

let config = require('../configs/swagger.config');
new SwaggerToService(config).main().then(result => {
  console.log(chalk.green(`接口文件已输出至: /${config.outputPath}`));
  process.exit(0)
});

const list = [
  {
    name: 'res',
    in: 'path',
    description: '用户id',
    required: false,
    type: 'string'
  },
  {
    name: 'res',
    in: 'query',
    description: 'address、personInfo、role、billInfo、organizationInfo，表示查询地址信息、个人信息、角色列表、发票信息、组织信息',
    required: true,
    type: 'ref'
  }
];

console.log(uniqBy(list, 'name'));
