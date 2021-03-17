/**
 * @format
 * @Description: 校验配置文件
 * @Autho:
 * @Date:2019/9/26 17:49
 */

// 功能点1： 校验url是否存在
export default new (class Validate {
  public validateUrl(url) {
    let error = false;
    let message = '';
    if (!url) {
      error = true;
      message = '不存在swagger地址';
    }
    return {
      error,
      message
    };
  }
})();
