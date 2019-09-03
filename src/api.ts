/*
 * @Description:
 * @Autho: 人杰
 * @Date:2019/8/2 19:16
 */
import {ApiStruct, ApiType, Definitions, DtoItem, DtoName, Path, PathItem, SwaggerUi, Tag} from './swagger-ui';

const {youdao} = require('translation.js');
const axios = require('axios').default;
const fs = require('fs');
const {map: _map, entries: _entried, forOwn, forEach, filter, assign, find, reduce} = require('lodash');
// 使用之前 将这个url地址 替换为自己后台swagger网站的地址，注意去看下”api-docs“请求的完整路径，而不是html的请求路径
const urlAddress = 'http://192.168.33.8:8464/v2/api-docs';
// const urlAddress = 'http://192.168.33.41:8026/v2/api-docs';

// 定义父函数模板
const parentFunTemplate = `
/**
 * @Description: </FileDescription/>
 * @Autho: 人杰
 * @Date: ${new Date()}
 */
import Request from 'utils/Request';
class </parentFunName/> {
  </childFunList/>
}
export default new </parentFunName/>`;

// 定义子函数
const childFunTemplate = `
  /**
</childInfo/>
</childParams/>
   */
    public async </childFunName/> ({</childrenParams/>}) {
      return Request({
        </childrenUrl/>,
        method:</childrenMetHod/>,
        data: </childrenName/>,
        query: {</QueryNames/>}
      })
    }
`;

// 翻译结果数据接口
interface TranslateResult {
  raw: {
    errorCode
  }
  result: string[]
}

// 翻译中文名称为英文，并转为驼峰式命名
async function translateToHumb(znName: string) {
  const {raw, result = []} = await youdao.translate(znName);
  // 英文翻译首字母可能大写
  return (result[0] ||"").toLowerCase()
}


/**
 * 格式化输出请求方法
 * @param functionName
 * @param url
 * @param description
 * @param summary
 * @param method
 * @param parameters
 */
function outputApiMethod(functionName, url, description, summary, method, parameters) {
  const template = [
    {key: description, name: '接口英文备注'},
    {key: summary, name: '接口中文描述'},
    {key: method, name: '接口类型'},
    {key: url, name: '接口地址'}
  ];

  /**
   * 找出要通过body传递的参数
   */
  function getParamNameInBody(): string {

    // get与delete不允许有data
    if( (method == "get") || (method === "delete")){
      return "\{\}"
    }
    return (find(parameters, (e) => e.in === "body") || {} ).name || "\{\}";
  }

  function getQueryNameList(): string[]{
    return _map(filter(parameters, (e) => e.in === "query"), e=> e.name)
  }

  return childFunTemplate.replace('</childInfo/>', template.map((e) => {
    return `   *  ${e.name} ${e.key}`;
  }).join('\n'))
    .replace('</childParams/>', parameters.map((e) => {
      return `   *  @param ${e.name} ${e.type || e.schema} ${e.description}`;
    }).join('\n'))
    .replace('</childFunName/>', `${functionName}`)
    .replace('</childrenUrl/>', () => {
      return `url:\`${url}\``;
    })
    .replace('</childrenMetHod/>', `'${method.toUpperCase()}'`)
    .replace('</childrenName/>', getParamNameInBody())
    .replace('</QueryNames/>', getQueryNameList().join(","))
    // 如果要保存为ts格式的话 只要把这行改一下就可以了
    // .replace('</childrenParams/>',parameters.map((e)=>`${e.name}:${e.type}`))
    .replace('</childrenParams/>', parameters.map((e)=>`${e.name}`));
}

/**
 * 输出一个Interface文件
 * @param definitions
 */
function outputInterfaceListFile(definitions: Definitions) {
  const interInfoList =  getAllInterface(definitions);

  // 转换java数据类型为适合ts的数据类型
  function convertDataType(type: "string" | "array" | "integer"){
    let result = "string"
    switch (type) {
      case "string":
        break;
      case "array":
        result = "any[]";
        break;
      case "integer":
        result = "number";
        break;
    }
    return result
  }
  let result = '';
  forEach(interInfoList, item => {
    result +=
`export interface ${item.name.split("«")[0]} {
${
  reduce(item.keyList, (preResult, _inter) => {
    preResult += `
    \/\*\* ${_inter.description} \*\/
    ${_inter.keyName}: ${convertDataType(_inter.type)}`;
    return preResult
  }, "")
}
}\n\n`
  });
  fs.writeFile(__dirname + "/API/DataStructure.ts", result, () => {
    console.log(`test interface file had success`)
  })
}

/**
 * 初始化获取网络请求数据
 *
 * @param {any}
 */
function getInitalNetWorkData() {

  // 调用正则替换变量，并通过文件模块写入到前端代码中
  function outputAjaxFile(fileName, fileDescription, formatPathData: ApiStruct[]) {
    let content = "";
    content += joinAllMethod(formatPathData);
    let endContent = "";
    content = parentFunTemplate.replace('</childFunList/>', content)
      .replace(/<\/parentFunName\/>/g, fileName)
      .replace(`</FileDescription/>`, fileDescription);
      fs.writeFileSync(__dirname + `/API/${fileName}.ts`, content + endContent);
  }

  /**
   * 根绝Tag信息对数据分组
   * @param formatPathData
   */
  function groupByTag(formatPathData: ApiStruct[]) {
    let result = {};
    _map(formatPathData, item => {
      result[item.tagDescription + "__" + item.tagName] = result[item.tagDescription + "__" + item.tagName] || [];
      result[item.tagDescription + "__" + item.tagName].push(item);
    });
    return result;
  }

  axios.get(urlAddress)
    .then((result) => {
      if (result.status === 200) {
        convertDataStruct(result.data).then(_result => {
          const formatPathData: ApiStruct[] = _result;
          let _obj = groupByTag(formatPathData);
          forOwn(_obj, (value, key) => {
            const _list = key.split("__");
            outputAjaxFile(_list[0], _list[1], value)
          })
        // 多生成一个interface文件
          outputInterfaceListFile(result.data.definitions)
        }, error => {
          console.log(error)
        });
      }
    });
}


/**
 * 将所有方法格式化并并拼接为字符串
 * @param pathItemList
 */
function joinAllMethod(pathItemList: ApiStruct[]) {

  const excludeParmName = [
    "Application-Key",
    "Access-Token",
    "extFields"
  ];

  return _map(pathItemList, (pathItem: ApiStruct) => {
    let {url, functionName, description, param, type} = pathItem;
    param = filter(param, item => excludeParmName.indexOf(item.name) == -1);
    const childFunList = outputApiMethod(functionName, url, description, description, type, param);
    return childFunList;
  }).join("")

}

getInitalNetWorkData();



async function convertDataStruct(data: SwaggerUi) {
  let tagGroups: Tag[] = data.tags;
  let paths: Path = data.paths;
  let result = [];
  //将Path转换为更加可描述的数据接口
  forOwn(paths, (pathItem: PathItem, url) => {
    forOwn(pathItem, (item, apiType: ApiType) => {
      let _tag = find(tagGroups, tagItem => tagItem.name === item.tags[0]) || {};
      // let _description = _tag.description.split(" ").splice(0)
      result.push(assign({}, {
        tagName: _tag.name,
        tagDescription: _tag.description.replace(/\s/g, "").replace(/Rest$/, "Service"),
        url: url.replace(/\{/g, "${"),
        type: apiType,
        description: item.description,
        functionName: item.operationId,
        param: item.parameters,
      }))
    })
  });

  // 收集中文描述，并拼接
  let descList = _map(result, item => {
    let _item = item.description.replace(/\s*/g, '').split("，")[0];
     _item =  _item.split(",")[0]
    ; // todo 依赖后台描述不能出现中文标点符号
    return _item
  });
  //
  let descListPromise = _map(descList, item => {
    return translateToHumb(item)
  }) || [];

  return Promise.all(descListPromise).then(_result => {
    let funcName = _result;
    return _map(result, (item, index) => {
      return assign({}, item, {functionName: convertToHump(funcName[index] + " by " + item.type)})
    })
  })
}

/**
 * 将字符串转为驼峰式命名
 * @param str
 */
function convertToHump(str) {
  if (!str) return "undefined"
  const re = /\s(\w)/g;
  return str.replace(re, function ($0, $1) {
    return $1.toUpperCase();
  });
}

interface interfaceInfo {
  name: string
  keyList: {keyName: string, type: string, description: string}[]
}

function getAllInterface(definitionsObj: Definitions): interfaceInfo[] {

  return _map((definitionsObj), function (dtoItem: DtoItem, dtoName:DtoName) {
    return {
      name: dtoName,
      keyList:  _map(dtoItem.properties, (propItem, keyName) => ({
        keyName,
        type: propItem.type,
        description: propItem.description
      }))

    }
  })
}

