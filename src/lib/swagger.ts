/**
 * @format
 * @Description:
 * @Date:2019/8/2 19:16
 */

import {
  Definitions,
  DtoItem,
  DtoName,
  FormattedApiStruct,
  ParamInfo,
  Path,
  PathItem,
  SwaggerUiD,
  Tag
} from './swagger-ui';
import { assign, filter, find, forEach, forOwn, map, reduce, sortBy, uniqBy, chain } from 'lodash';

const axios = require('axios').default;
// import  axios from 'axios';

const fs = require('fs');
const path = require('path');
// 使用之前 将这个url地址 替换为自己后台swagger网站的地址，注意去看下”api-docs“请求的完整路径，而不是html的请求路径

// 定义父函数模板

let util = {} as any;
/**
 * 检查路径是否存在 如果不存在则创建路径
 * @param {string} folderPath 文件路径
 */
util.checkDirExist = folderPath => {
  const pathArr = folderPath.split('/');
  let _path = '';
  for (let i = 0; i < pathArr.length; i++) {
    if (pathArr[i]) {
      _path += `/${pathArr[i]}`;
      if (!fs.existsSync(path.join(process.cwd(), _path))) {
        fs.mkdirSync(path.join(process.cwd(), _path));
      }
    }
  }
};

export type ConfigArg = {
  /** swagger url地址 */
  url: string;
  /** 父函数模板 */
  parentFunTemplate: string;
  /** 接口函数模板 */
  childFunTemplate: string;
  /** 要过滤的参数名称 */
  excludeParamName: string[];
  /** 输出文件的路径 */
  outputPath: string;
  /** 中心名称 */
  center;
  filterServices?,
  renderMethod?
};

export default class SwaggerToService {
  private url: string;
  private outputPath: string;
  private parentFunTemplate: string;
  private childFunTemplate: string;
  private excludeParamName: string[];
  private center: string;
  private filterServices: string[];
  private renderMethod: (method: string) => string;

  constructor({ url, parentFunTemplate, childFunTemplate, excludeParamName, outputPath, center,filterServices,  renderMethod }: ConfigArg) {
    this.url = url;
    this.parentFunTemplate = parentFunTemplate;
    this.childFunTemplate = childFunTemplate;
    this.excludeParamName = excludeParamName;
    this.outputPath = outputPath; //todo 校验路径有效性
    this.center = center;
    this.filterServices = filterServices;
    this.renderMethod = renderMethod
  }

  public async main() {
    return axios.get(this.url).then(result => {
      if (result.status === 200) {
        util.checkDirExist(this.outputPath);
        const formatPathData: FormattedApiStruct[] = this.convertDataStruct(result.data);
        forOwn(this.listToMap(formatPathData), (value, key) => {
          const _list = key.split('__');
          if(this.filterServices ){
            this.filterServices.includes(_list[0]) && this.outputServiceFile(_list[0], _list[1], value);
          }else {
            this.outputServiceFile(_list[0], _list[1], value);
          }

        });

        // 多生成一个interface文件
        this.outputInterfaceListFile(result.data.definitions);
      }
    });
  }

  private convertDataStruct(data: SwaggerUiD): FormattedApiStruct[] {
    let tagGroups: Tag[] = data.tags;
    let paths: Path = data.paths;
    let result = [];
    //将Path转换为更加可描述的数据接口
    forOwn(paths, (pathItem: PathItem, url) => {
      forOwn(pathItem, (item, apiType) => {
        let _tag = find(tagGroups, tagItem => tagItem.name === item.tags[0]) || ({} as Tag);
        // let _description = _tag.description.split(" ").splice(0)
        result.push(
          assign(
            {},
            {
              tagName: _tag.name,
              tagDescription: _tag.description.replace(/\s/g, '').replace(/Rest$/, 'Service'),
              url: url.replace(/{/g, '${'),
              type: apiType,
              description: item.description,
              summary: item.summary,
              functionName: apiType + url.replace(/[{}]/g, '$').replace(/([^$\w])/g, '_'),
              param: item.parameters
            }
          )
        );
      });
    });
    return result;
  }

  private getAllInterface(definitionsObj: Definitions): interfaceInfo[] {
    return map(definitionsObj, function(dtoItem: DtoItem, dtoName: DtoName) {
      return {
        name: dtoName,
        keyList: map(dtoItem.properties, (propItem, keyName) => ({
          keyName,
          type: propItem.type,
          description: propItem.description
        }))
      };
    });
  }

  /**
   * 找出要通过body传递的参数
   */
  private getParamNameInBody(method, parameters): string {
    // get与delete不允许有data
    if (method == 'get' || method === 'delete') {
      return '\{\}';
    }
    return (find(parameters, e => e.in === 'body') || {}).name || '{}';
  }

  private getQueryNameList(parameters): string[] {
    return map(
      filter(parameters, e => e.in === 'query'),
      e => e.name
    );
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
  private formatApiMethod(functionName, url, description, summary, method, parameters: ParamInfo[]): string {
    const template = [
      { key: summary, name: '接口简介' },
      { key: description, name: '接口备注' },
      { key: method, name: '接口类型' },
      { key: url.replace(/\$/g, ''), name: '接口地址' }
    ];

    let DescriptionOfFn = map(template, e => `   *  ${e.name} ${e.key}`).join('\n');
    let ParasOfDescription = map(parameters, paraItem => `   *  @param ${paraItem.name} ${paraItem.description}`).join(
      '\n'
    );

    const sortedParams = chain(parameters).filter(item => !item.name.includes('.')).sortBy( item => Number(!item.required)).value();
    let ParasOfFn = map(sortedParams, e => e.name).join(',');
    let ParaTypesOfFn = map(sortedParams, e => `${e.name}${e.required ? '' : '?'}`).join(',');
    return this.childFunTemplate
      .replace('</childInfo/>', DescriptionOfFn)
      .replace('</childParams/>', ParasOfDescription)
      .replace('</childFunName/>', functionName)
      .replace('</childrenUrl/>', () => {
        let _url = url.replace(/\/v1\//g, '').replace(/\/v2\//, ''); // todo 可配置
        return `url:\`${_url}\``;
      })
      .replace('</version/>', () => {
        let version = url.match(/^\/v[\d]\//g)[0].replace(/[\\\/]/g, '');
        return `'${version}'`;
      })
      .replace('</Centername/>', `'${this.center}'`)
      .replace('</childrenMetHod/>', `'${this.renderMethod ? this.renderMethod(method) : method.toUpperCase()}'`)
      .replace('</childrenName/>', this.getParamNameInBody(method, sortedParams))
      .replace('</QueryNames/>', this.getQueryNameList(sortedParams).join(','))

      .replace('</childrenParams/>', ParasOfFn)
      .replace('</childrenParaTypes/>', ParaTypesOfFn);
  }

  private convertDataType(type: 'string' | 'array' | 'integer') {
    let result = 'string';
    switch (type) {
      case 'string':
        break;
      case 'array':
        result = 'any[]';
        break;
      case 'integer':
        result = 'number';
        break;
    }
    return result;
  }

  /**
   * 输出一个Interface文件
   * @param definitions
   */
  private outputInterfaceListFile(definitions: Definitions) {
    let interInfoList = this.getAllInterface(definitions);
    /*interface name 去重*/
    interInfoList = filter(interInfoList, item => item.name.indexOf('RestResponse') == -1);
    interInfoList = filter(interInfoList, item => !/.*[\u4e00-\u9fa5]+.*/.test(item.name));

    // 转换java数据类型为适合ts的数据类型
    let result = '';
    forEach(interInfoList, item => {
      result += `export interface ${item.name.split('«')[0]} {
${reduce(
  item.keyList,
  (preResult, _inter: any) => {
    preResult += `
    \/\*\* ${_inter.description} \*\/
    ${_inter.keyName}: ${this.convertDataType(_inter.type)}`;
    return preResult;
  },
  ''
)}
}\n\n`;
    });
    const DataStructureFileName = 'DataStructure' + this.center.replace(/^[a-z]/g, w => w.toUpperCase()) + '.ts';
    fs.writeFileSync(path.join(process.cwd(), this.outputPath, DataStructureFileName), result); //todo中心
    console.log('中心数据结构被写入，' + DataStructureFileName);
  }

  /**
   * 调用正则替换变量，并通过文件模块写入到前端代码中
   * @param fileName 文件名称
   * @param fileDescription 文件藐视
   * @param formatPathData
   */
  outputServiceFile(fileName, fileDescription, formatPathData: FormattedApiStruct[]): void {
    let content = '';
    content += map(formatPathData, (pathItem: FormattedApiStruct) => {
      let { url, functionName, description, param, type } = pathItem;
      param = filter(param, item => this.excludeParamName.indexOf(item.name) == -1);
      return this.formatApiMethod(functionName, url, description, description, type, param);
    }).join('');
    let endContent = '';
    content = this.parentFunTemplate
      .replace('</childFunList/>', content)
      .replace(/<\/parentFunName\/>/g, fileName)
      .replace(`</FileDescription/>`, fileDescription);
    fs.writeFileSync(path.join(process.cwd(), this.outputPath, `${fileName}.ts`), content + endContent);
  }

  /**
   * 根绝Tag信息对数据分组
   * @param formatPathData
   */
  private listToMap(formatPathData: FormattedApiStruct[]): { [path: string]: FormattedApiStruct[] } {
    let result = {};
    map(formatPathData, item => {
      result[item.tagDescription + '__' + item.tagName] = result[item.tagDescription + '__' + item.tagName] || [];
      result[item.tagDescription + '__' + item.tagName].push(item);
    });
    return result;
  }
}

interface interfaceInfo {
  name: string;
  keyList: { keyName: string; type: string; description: string }[];
}
