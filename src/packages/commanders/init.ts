import {DefaultConfigPath, TargetPath} from "./ConstName";
import inquirer from 'inquirer';
import chalk from 'chalk';
import figlet from 'figlet';

const fs = require('fs');

export default function init() {
  if(fs.existsSync(TargetPath)){
  //  连续提问
    inquirer.prompt([
      {
        name: 'init-confirm',
        type: 'confirm',
        message: 'inter.config.js is already existed. Are you sure overwrite it?',
        validate: function (input) {
          if(input !== 'y' && input !== 'n'){
            return 'Please input y or n!'
          }
          return true
        }
      }
    ]).then(answers => {
      if(answers['init-confirm']){
        copyConfigFile()
      }
    }).catch(err => {
      console.log(chalk.red(err));
      process.exit(0);
    })
  }else{
    copyConfigFile()
  }
}

function copyConfigFile() {
  try {
    figlet('inter cli', function (err, data) {
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