const path = require('path')
const fs = require('fs');
import inquirer from 'inquirer';
import chalk from 'chalk';
let targetPath = path.resolve('config.js');
// const config  = require('./config.js');
// console.log(config, 'config')

export default function init() {
  if(fs.existsSync(targetPath)){
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
      process.exit(0)
    }).catch(err => {
      console.log(chalk.red(err))
    })
  }else{
    copyConfigFile()
  }

}

function copyConfigFile() {
  try {
    console.log(require('./config.js'), "relative")
    const isExit = fs.existsSync(path.resolve('./config.js'));
    const config = require(path.resolve('config.js'))
    console.log(config)

    // const content = fs.readFileSync(path.join(targetPath), 'utf8')
    // fs.writeFileSync(targetPath, content, 'utf8');
  }catch (err) {
    console.log(chalk.red(err))
  }

  // console.log(chalk.green('init inter.config.js had successed.'))
  process.exit(0);
}