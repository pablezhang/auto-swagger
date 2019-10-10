/**
 * @Description: 
 * @Autho: 人杰
 * @Date:2019/9/26 17:49
 */
import SwaggerToServicer from '../../lib/swagger';
import {TargetPath, DefaultConfigPath} from "../config/ConstName";
import Validate from '../../lib/validate'
import  fs from "fs";
import chalk from "chalk";
import {merge} from "lodash";
export default function run() {
  /** 查找配置文件 */

  if(!fs.existsSync(TargetPath)){
    console.log(chalk.yellow('没有找到配置文件swagger.config.js，推荐使用`auto-swagger init`命令初始化一个配置文件swagger.config.js'));
    process.exit(0);
    return
  }

  const config = require(TargetPath);
  const defaultConfig = require(DefaultConfigPath);
  let newConfig = merge(defaultConfig, config);
  let swagger = new SwaggerToServicer(newConfig);
  /** 校验配置文件*/
  let {error, message} = Validate.validateUrl(newConfig.url);
  if(error && message){
    console.log(chalk.red(message));
    process.exit(0);
    return
  }
  swagger.main().then(result => {
    console.log(chalk.green(`接口文件已输出至/${newConfig.outputPath}`));
    process.exit(0)
  })
}