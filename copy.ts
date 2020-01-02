import fs from 'fs';
import * as path from "path";
fs.copyFile('src/configs/swagger.config.js', 'dist/configs/swagger.config.js', function (err) {
  console.log(err, 'err')
});
