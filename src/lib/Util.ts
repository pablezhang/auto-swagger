/**
 * @format
 * @Description:
 * @Date:2019/8/2 19:16
 */

import fs from 'fs';
import path from 'path';

class Util {
  /**
   * 检查路径是否存在 如果不存在则创建路径
   * @param {string} folderPath 文件路径
   */
  checkDirExist(folderPath: string): void {
    const pathArr = folderPath.split('/');
    let _path = '';
    for (let i = 0; i < pathArr.length; i++) {
      if (pathArr[i]) {
        _path += `/${pathArr[i]}`;
        const nextFolderPath = path.join(process.cwd(), _path);
        if (!fs.existsSync(nextFolderPath)) {
          fs.mkdirSync(nextFolderPath);
        }
      }
    }
  }
}

export default new Util();
