import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';
import {DefaultConfigPath, TargetPath} from "../configs/ConstName";

const fs = require('fs');

/**
 * 初始化生成配置文件
 */
export default function init():void {
  if(fs.existsSync(TargetPath)){
  //  连续提问
    inquirer.prompt([
      {
        name: 'init-confirm',
        type: 'confirm',
        message: 'swagger.config.js is already existed. Are you sure overwrite it?',
        validate: function (input) {
          if(input !== 'y' && input !== 'n'){
            return 'Please input y or n!'
          }
          return true
        }
      }
    ]).then(answers => {
      if(answers['init-confirm']){
        generateConfigFile()
      }
    }).catch(err => {
      console.log(chalk.red(err));
      process.exit(0);
    });

    return
  }
  generateConfigFile()
}

/**
 * 为用户生成一份默认配置文件
 */
function generateConfigFile() {
  try {
    figlet('swagger cli', function (err, data) {
      if(err){
        console.log(chalk.red('Some thing about figlet is wrong!'));
      }
      console.log(chalk.yellow(data));
      const content = fs.readFileSync(DefaultConfigPath, 'utf8');
      fs.writeFileSync(TargetPath, content, 'utf8');
      console.log(chalk.green('初始化完成'));

      process.exit(0);
    })
  }catch (err) {
    console.log(chalk.red(err));
    process.exit(0)
  }

}