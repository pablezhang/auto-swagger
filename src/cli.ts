import * as fs from "fs";
import program from 'commander'

enum CliName {
  ConfigName= 'inter.config.js',
}
const path = require('path');
// const importLocal = require('import-local');
const {existsSync} = require('fs');
import init from './packages/commanders/init'
import SwaggerToService from './swagger'
// 获取当前执行程序路径
// console.log(process.cwd(), "success");
// // 查找配置文件是否存在
// fs.exists(process.cwd() + `\\${CliName.ConfigName}`, (exists) => {
//   console.log(exists, `file named ${CliName.ConfigName} is existed `)
// })
// const config = require('./inter.config.ts');
// import config from './inter.config';

// if(fs.existsSync(path.resolve( 'some.config.js'))){
//   console.log('exit some.config.js');
//   let  config = require(path.resolve('some.config.js'));
//   console.log(config)
// }else{
//
// }
//  const pkgJson = require(path.resolve('package.json'));
program.version('1.0.0', '-v, --version')
  .command('init')
  .description('初始化inter.config.js文件')
  .action(init);


program.parse(process.argv)

// const swaggerToService  = new SwaggerToService(config);
// swaggerToService.main();

