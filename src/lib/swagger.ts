/**
 * @format
 * @Description: 输出接口文件
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
import {filter, find, forEach, forOwn, map, reduce} from 'lodash';

import fs from 'fs';
import axios from 'axios';
import path from 'path';
import util from './Util';
import {IOutputController, OutputController} from "./OutptController";

// 定义父函数模板

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
  filterServices?;
  renderMethod?;
};

type ReplaceChildFnType = (ReplaceChildFnParams) => string;

export default class SwaggerToService {
  private url: string = '';
  private outputPath: string = '';
  private parentFunTemplate: string = '';
  private childFunTemplate: string = '';
  private excludeParamName: string[] = [];
  private center: string = '';
  private filterServices: string[] = [];
  private renderMethod: (method: string) => string;
  private outputController: IOutputController;

  constructor(
    {
      url,
      parentFunTemplate,
      childFunTemplate,
      excludeParamName,
      outputPath,
      center,
      filterServices,
      renderMethod,
    }: ConfigArg,
    outputController: Partial<IOutputController> = {}
  ) {
    this.url = url;
    this.parentFunTemplate = parentFunTemplate;
    this.childFunTemplate = childFunTemplate;
    this.excludeParamName = excludeParamName;
    this.outputPath = outputPath; //todo 校验路径有效性
    this.center = center;
    this.filterServices = filterServices;
    this.renderMethod = renderMethod;
    this.outputController = new OutputController(outputController);
  }

  public async main(): Promise<any> {
    return axios.get(this.url).then(result => {
      if (result.status !== 200) return;

      util.checkDirExist(this.outputPath);
      const formatPathData: FormattedApiStruct[] = this.convertDataStruct(result.data);
      forOwn(this.listToMap(formatPathData), (value, key) => {
        const _list = key.split('__');
        if (this.filterServices) {
          this.filterServices.includes(_list[0]) && this.outputServiceFile(_list[0], _list[1], value);
        } else {
          this.outputServiceFile(_list[0], _list[1], value);
        }
      });
      this.outputInterfaceListFile(result.data.definitions);
    });
  }

  /**
   * 将SwaggerUI的数据格式转换为理想的数据格式
   * @param data
   */
  private convertDataStruct(data: SwaggerUiD): FormattedApiStruct[] {
    let tagGroups: Tag[] = data.tags;
    let paths: Path = data.paths;
    let result = [];
    //将Path转换为更加可描述的数据接口
    forOwn(paths, (pathItem: PathItem, url) => {
      forOwn(pathItem, (item, apiType) => {
        let _tag = find(tagGroups, tagItem => tagItem.name === item.tags[0]) || ({} as Tag);
        // let _description = _tag.description.split(" ").splice(0)
        result.push({
          tagName: _tag.name,
          tagDescription: _tag.description.replace(/\s/g, '').replace(/Rest$/, 'Service'),
          url: url.replace(/{/g, '${'),
          type: apiType,
          description: item.description,
          summary: item.summary,
          functionName: apiType + url.replace(/[{}]/g, '$').replace(/([^$\w])/g, '_'),
          param: item.parameters
        });
      });
    });
    return result;
  }

  private getAllInterface(definitionsObj: Definitions): interfaceInfo[] {
    return map(definitionsObj, (dtoItem: DtoItem, dtoName: DtoName) => ({
      name: dtoName,
      keyList: map(dtoItem.properties, (propItem, keyName) => ({
        keyName,
        type: propItem.type,
        description: propItem.description
      }))
    }));
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
  private formatApiFn(functionName, url, description, summary, method, parameters: ParamInfo[]): string {
    return this.outputController.replaceChildFn({
      writeFnDoc: this.outputController.writeFnDoc(summary, description, method, url),
      writeParasDoc: this.outputController.writeParasDoc(parameters),
      writeFnParameters: this.outputController.writeFnParameters(parameters),
      writeParaString: this.outputController.writeParaString(parameters),
      writeParaTypesString: this.outputController.writeParaTypesString(parameters),
      childFunTemplate: this.childFunTemplate,
      functionName,
      url,
      method,
      centerName: this.center,
      renderMethod: this.renderMethod
    });
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
   * 调用正则替换变量，并通过文件模块输出接口文件
   * @param fileName 文件名称
   * @param fileDescription 文件藐视
   * @param formatPathData
   */
  outputServiceFile(fileName, fileDescription, formatPathData: FormattedApiStruct[]): void {
    let content = '';
    content += map(formatPathData, (pathItem: FormattedApiStruct) => {
      let { url, functionName, description, param, type } = pathItem;
      param = filter(param, item => this.excludeParamName.indexOf(item.name) == -1);
      return this.formatApiFn(functionName, url, description, description, type, param);
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
    forEach(formatPathData, item => {
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
