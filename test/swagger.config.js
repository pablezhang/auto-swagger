/** @format */

'use strict';
var url = '';
var parentFunTemplate =
  "\n/**\n * @Description: </FileDescription/>\n */\nimport Request from 'utils/Request';\nclass </parentFunName/> {\n  </childFunList/>\n}\nexport default new </parentFunName/>";
var Center = 'Data';
var childFunTemplate =
  '\n  /**\n</childInfo/>\n</childParams/>\n   */\n    public async </childFunName/> ({</childrenParams/>}) {\n      return Request({\n        </childrenUrl/>,\n        method:</childrenMetHod/>,\n        data: </childrenName/>,\n        query: {</QueryNames/>},\n        app: </Centername/>,\n        version: </version/>,\n      })\n    }\n';
var outputPath = 'Services';
var excludeParamName = [
  'Application-Key',
  'Access-Token',
  'extFields',
  'yes.req.instanceId',
  'yes.req.tenantId',
  'yes.req.applicationId'
];
var config = {
  childFunTemplate: childFunTemplate,
  excludeParamName: excludeParamName,
  outputPath: outputPath,
  parentFunTemplate: parentFunTemplate,
  url: url,
  center: Center
};
module.exports = config;
