/*
 * @Description:
 * @Autho: 人杰
 * @Date:2019/8/2 19:16
 */
import {ApiStruct, ApiType, Definitions, DtoItem, DtoName, Path, PathItem, SwaggerUiD, Tag} from './swagger-ui';

// const axios = require('axios').default;
import  axios from 'axios';

const fs = require('fs');
const path = require('path');
const {map: _map, entries: _entried, forOwn, forEach, filter, assign, find, reduce} = require('lodash');
// 使用之前 将这个url地址 替换为自己后台swagger网站的地址，注意去看下”api-docs“请求的完整路径，而不是html的请求路径


// 定义父函数模板

let util={} as any;
/**
 * 检查路径是否存在 如果不存在则创建路径
 * @param {string} folderpath 文件路径
 */
util.checkDirExist=(folderpath)=>{
  const pathArr=folderpath.split('/');
  let _path='';
  for(let i=0;i<pathArr.length;i++){
    if(pathArr[i]){
      _path +=`/${pathArr[i]}`;
      if (!fs.existsSync(  path.join(process.cwd(), _path))) {
        fs.mkdirSync(path.join(process.cwd(), _path));
      }
    }
  }
}

export type ConfigArg = {
  /** swagger url地址 */
  url: string,
  /** 父函数模板 */
  parentFunTemplate: string,
  /** 接口函数模板 */
  childFunTemplate: string,
  /** 要过滤的参数名称 */
  excludeParamName: string[],
  /** 输出文件的路径 */
  outputPath: string
};

class SwaggerToServicer {

  private url: string;
  private outputPath: string;
  private parentFunTemplate: string;
  private childFunTemplate: string;
  private excludeParamName: string[];

  constructor({url, parentFunTemplate, childFunTemplate, excludeParamName, outputPath}: ConfigArg) {
    this.url = url;
    this.parentFunTemplate = parentFunTemplate;
    this.childFunTemplate = childFunTemplate;
    this.excludeParamName = excludeParamName;
    this.outputPath = outputPath; //todo 校验路径有效性
  }

  main() {
    axios.get(this.url)
      .then((result) => {
        if (result.status === 200) {
          this.convertDataStruct(result.data).then(_result => {
            const formatPathData: ApiStruct[] = _result;
            let _obj = this.groupByTag(formatPathData);

            util.checkDirExist(this.outputPath) ;
            forOwn(_obj, (value, key) => {
              const _list = key.split("__");
              this.outputAjaxFile(_list[0], _list[1], value)
            });
            // 多生成一个interface文件
            this.outputInterfaceListFile(result.data.definitions);
            console.log('All file had success')
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
  joinAllMethod(pathItemList: ApiStruct[]) {
    return _map(pathItemList, (pathItem: ApiStruct) => {
      let {url, functionName, description, param, type} = pathItem;
      param = filter(param, item => this.excludeParamName.indexOf(item.name) == -1);
      const childFunList = this.outputApiMethod(functionName, url, description, description, type, param);
      return childFunList;
    }).join("")

  }

  async convertDataStruct(data: SwaggerUiD) {
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
          summary: item.summary,
          functionName: item.operationId,
          param: item.parameters,
        }))
      })
    });
    return result
  }


  getAllInterface(definitionsObj: Definitions): interfaceInfo[] {
    return _map((definitionsObj), function (dtoItem: DtoItem, dtoName: DtoName) {
      return {
        name: dtoName,
        keyList: _map(dtoItem.properties, (propItem, keyName) => ({
          keyName,
          type: propItem.type,
          description: propItem.description
        }))
      }
    })
  }


  /**
   * 找出要通过body传递的参数
   */
  getParamNameInBody(method, parameters): string {

    // get与delete不允许有data
    if ((method == "get") || (method === "delete")) {
      return "\{\}"
    }
    return (find(parameters, (e) => e.in === "body") || {}).name || "\{\}";
  }

  getQueryNameList(parameters): string[] {
    return _map(filter(parameters, (e) => e.in === "query"), e => e.name)
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
  outputApiMethod(functionName, url, description, summary, method, parameters) {
    const template = [
      {key: summary, name: '接口简介'},
      {key: description, name: '接口备注'},
      {key: method, name: '接口类型'},
      {key: url.replace(/\$/g, ""), name: '接口地址'}
    ];


    return this.childFunTemplate.replace('</childInfo/>', template.map((e) => {
      return `   *  ${e.name} ${e.key}`;
    }).join('\n'))
      .replace('</childParams/>', parameters.map((e) => {
        return `   *  @param ${e.name} ${e.type || e.schema} ${e.description}`;
      }).join('\n'))
      .replace('</childFunName/>', `${functionName}`)
      .replace('</childrenUrl/>', () => {
        return `url:\`${url.replace(/\/v1\//g, "")}\``; // todo 可配置
      })
      .replace('</childrenMetHod/>', `'${method.toUpperCase()}'`)
      .replace('</childrenName/>', this.getParamNameInBody(method, parameters))
      .replace('</QueryNames/>', this.getQueryNameList(parameters).join(","))
      // 如果要保存为ts格式的话 只要把这行改一下就可以了
      // .replace('</childrenParams/>',parameters.map((e)=>`${e.name}:${e.type}`))
      .replace('</childrenParams/>', parameters.map((e) => `${e.name}`));
  }

  convertDataType(type: "string" | "array" | "integer") {
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


  /**
   * 输出一个Interface文件
   * @param definitions
   */
  outputInterfaceListFile(definitions: Definitions) {
    const interInfoList = this.getAllInterface(definitions);

    // 转换java数据类型为适合ts的数据类型
    let result = '';
    forEach(interInfoList, item => {
      result +=
        `export interface ${item.name.split("«")[0]} {
${
          reduce(item.keyList, (preResult, _inter) => {
            preResult += `
    \/\*\* ${_inter.description} \*\/
    ${_inter.keyName}: ${this.convertDataType(_inter.type)}`;
            return preResult
          }, "")
          }
}\n\n`
    });
    fs.writeFileSync( path.join( process.cwd(), this.outputPath, `DataStructure.ts`), result)
    console.log(`The file named DataStructure had success.`)
  }

// 调用正则替换变量，并通过文件模块写入到前端代码中
  outputAjaxFile(fileName, fileDescription, formatPathData: ApiStruct[],) {
    let content = "";
    content += this.joinAllMethod(formatPathData);
    let endContent = "";
    content = this.parentFunTemplate.replace('</childFunList/>', content)
      .replace(/<\/parentFunName\/>/g, fileName)
      .replace(`</FileDescription/>`, fileDescription);
    fs.writeFileSync(path.join( process.cwd(), this.outputPath, `${fileName}.ts`) , content + endContent);
  }

  /**
   * 根绝Tag信息对数据分组
   * @param formatPathData
   */
  groupByTag(formatPathData: ApiStruct[]) {
    let result = {};
    _map(formatPathData, item => {
      result[item.tagDescription + "__" + item.tagName] = result[item.tagDescription + "__" + item.tagName] || [];
      result[item.tagDescription + "__" + item.tagName].push(item);
    });
    return result;
  }


}

export default SwaggerToServicer

interface interfaceInfo {
  name: string
  keyList: { keyName: string, type: string, description: string }[]
}


