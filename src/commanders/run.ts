/**
 * @format
 * @Description: 获取swagger的命令
 * @Autho: luckybo
 * @Date:2019/9/26 17:49
 */

import chalk from 'chalk';
import { merge } from 'lodash';
import { DefaultConfigPath, TargetPath } from '../configs/ConstName';
import SwaggerToService from '../lib/swagger';
import Validate from '../lib/Validate';
export default function run() {
  /** 校验配置文件*/
  let noError = new Validate().main(TargetPath);
  if (!noError) {
    console.log(chalk.red('something is wrong.'));
    process.exit(0);
    return;
  }

  const config = require(TargetPath);
  const defaultConfig = require(DefaultConfigPath);
  let newConfig = merge(defaultConfig, config);
  let swagger = new SwaggerToService(newConfig);
  swagger
    .main()
    .then(result => {
      console.log(chalk.green(`接口文件已输出至: /${newConfig.outputPath}`));
      process.exit(0);
    })
    .catch(e => {
      console.log(chalk.red(e));
    });
}
