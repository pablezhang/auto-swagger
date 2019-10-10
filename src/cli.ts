#!/usr/bin/env node
import  program from 'commander'


import {init, run} from './packages/commanders'

program.version('1.0.0', '-v, --version')
  .command('init')
  .description('初始化swagger.config.js文件')
  .action(init);

program.command('run')
  .description('开始获取swagger')
  .action(run);

program.parse(process.argv);
