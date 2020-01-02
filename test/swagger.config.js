"use strict";
var url = 'http://192.168.33.12:8960/v2/api-docs';
var parentFunTemplate = "\n/**\n * @Description: </FileDescription/>\n */\n// @ts-ignore\nimport Request from 'utils/request';\nclass </parentFunName/> {\n  </childFunList/>\n}\nexport default new </parentFunName/>";
var centerName = 'user';
var childFunTemplate = "\n  /**\n</childInfo/>\n</childParams/>\n   */\n    public async </childFunName/> ({</childrenParams/>}, restParam={}) {\n      return Request({\n        </childrenUrl/>,\n        method:</childrenMetHod/>,\n        data: </childrenName/>,\n        query: {</QueryNames/>},\n        app: </Centername/>,\n        version: </version/>,\n        ...restParam\n      })\n    }\n";
var outputPath = './ts-src/Services';
var excludeParamName = [
    "Application-Key",
    "Access-Token",
    "extFields"
];
var config = {
    childFunTemplate: childFunTemplate,
    excludeParamName: excludeParamName,
    outputPath: outputPath,
    parentFunTemplate: parentFunTemplate,
    url: url,
    center: centerName
};
module.exports = config;
