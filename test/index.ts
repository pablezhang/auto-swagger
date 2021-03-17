/** @format */

import chalk from 'chalk';
import SwaggerToService from '../src/lib/swagger';
const config = require('./swagger.config.js');
let swagger = new SwaggerToService(config);
swagger.main().then(result => {
  console.log(chalk.green(`接口文件已输出至: /${config.outputPath}`));
  process.exit(0);
});
