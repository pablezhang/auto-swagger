import * as fs from 'fs';


fs.copyFile('src/configs/swagger.config.js', 'dist/configs/swagger.config.js', function (err) {
  err && console.log(err, 'err')
});


fs.copyFile('README.md', 'dist/README.md', function (err) {
  err && console.log(err, 'err')
});


const pkg = require('./package.json');

delete pkg.devDependencies
pkg.main = 'index.js';
pkg.bin['auto-swagger'] = 'index.js';

fs.writeFileSync('dist/package.json', JSON.stringify(pkg, null, 2))
console.log('复制成功')


