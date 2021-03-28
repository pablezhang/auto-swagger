/**
 * @format
 * @Description: 校验配置文件
 * @Autho: luckybo
 * @Date:2019/9/26 17:49
 */

import chalk from 'chalk';
import fs from 'fs';

enum ErrorType {
  NoConfig = 1,
  NoUrl,
  NoError
}

interface IValidate {
  errorType: ErrorType;

  main(configPath: string): boolean;
}

function showInfo(errorType: ErrorType) {
  switch (errorType) {
    case ErrorType.NoConfig:
      console.log(
        chalk.yellow(
          '没有找到配置文件swagger.config.js，推荐使用`auto-swagger init`命令初始化一个配置文件swagger.config.js'
        )
      );
      break;
    case ErrorType.NoUrl:
      console.log(chalk.red('不存在swagger地址'));
      break;
    case ErrorType.NoError:
    default:
      console.log(chalk.green('配置文件正常，开始获取swagger文件...'));
      break;
  }
}

abstract class BaseValidate implements IValidate {
  errorType: ErrorType = ErrorType.NoError;

  main(configPath: string): boolean {
    this.validateConfig(configPath);
    this.validateUrl(configPath);

    showInfo(this.errorType);

    return this.errorType == ErrorType.NoError;
  }

  abstract validateUrl(configPath: string): void;
  abstract validateConfig(configPath: string): void;
}

// 功能点1： 校验url是否存在
export default class Validate extends BaseValidate {
  validateConfig(configPath: string): void {
    /** 查找配置文件 */
    if (!fs.existsSync(configPath)) {
      this.errorType = ErrorType.NoConfig;
    }
  }

  // 校验是否存在url
  validateUrl(configPath): void {
    if (this.errorType !== ErrorType.NoError) return;

    const config = require(configPath);
    if (!config.url) this.errorType = ErrorType.NoUrl;
  }
}
