/** @format */

import { chain, find, map } from 'lodash';
import { ParamInfo } from './swagger-ui';
import chalk from 'chalk';
export interface IOutputController {
  writeFnDoc: (summary, description, method, url) => string;
  writeFnName: Function;
  writeFnBody: Function;
  writeFnParameters: (parameters: ParamInfo[]) => any;
  writeParasDoc: (parameters: ParamInfo[]) => string;
  replaceChildFn: (replaceChildFnParams: ReplaceChildFnParams) => string;
  writeParaString: (parameters: ParamInfo[]) => string;
  writeParaTypesString: (parameters: ParamInfo[]) => string;
}

export class OutputControllerInsert implements IOutputController {
  public writeParaTypesString(parameters: ParamInfo[]) {
    return map(
      chain(parameters)
        .filter(item => !item.name.includes('.'))
        .sortBy(item => Number(!item.required))
        .value(),
      e => `${e.name}${e.required ? '' : '?'}`
    ).join(',');
  }

  public writeParaString(parameters): string {
    return map(
      chain(parameters)
        .filter(item => !item.name.includes('.'))
        .sortBy(item => Number(!item.required))
        .value(),
      e => e.name
    ).join(',');
  }

  public writeFnDoc(summary, description, method, url) {
    const template = [
      { key: summary, name: '接口简介' },
      { key: description, name: '接口备注' },
      { key: method, name: '接口类型' },
      { key: url.replace(/\$/g, ''), name: '接口地址' }
    ];
    return map(template, e => `   *  ${e.name} ${e.key}`).join('\n');
  }
  public writeFnBody: Function;
  public writeFnName: Function;
  public writeFnParameters(parameters: ParamInfo[]) {
    return chain(parameters)
      .filter(item => !item.name.includes('.'))
      .sortBy(item => Number(!item.required))
      .value();
  }
  public writeParasDoc(parameters: ParamInfo[]): string {
    return map(parameters, paraItem => `   *  @param ${paraItem.name} ${paraItem.description}`).join('\n');
  }

  /**
   * 替换中模板字符串中的子函数内容
   * @param childFunTemplate
   * @param writeFnDoc
   * @param writeParasDoc
   * @param functionName
   * @param url
   * @param method
   * @param writeFnParameters
   * @param writeParaString
   * @param writeParaTypesString
   * @param centerName
   * @param renderMethod
   */
  public replaceChildFn({
    childFunTemplate,
    writeFnDoc,
    writeParasDoc,
    functionName,
    url,
    method,
    writeFnParameters,
    writeParaString,
    writeParaTypesString,
    centerName,
    renderMethod
  }: ReplaceChildFnParams): string {
    console.log(chalk.green(url));
    return childFunTemplate
      .replace('</childInfo/>', writeFnDoc)
      .replace('</childParams/>', writeParasDoc)
      .replace('</childFunName/>', functionName)
      .replace('</childrenUrl/>', () => {
        let _url = url.replace(/\/v1\//g, '').replace(/\/v2\//, ''); // todo 可配置
        return `url:\`${_url}\``;
      })
      .replace('</version/>', () => {
        // todo 可配置
        let version = url.match(/^\/v[\d]\//g)[0].replace(/[\\\/]/g, '');
        return `'${version}'`;
      })
      .replace('</Centername/>', `'${centerName}'`)
      .replace('</childrenMetHod/>', `'${renderMethod ? renderMethod(method) : method.toUpperCase()}'`)
      .replace('</childrenName/>', getParamNameInBody(method, writeFnParameters))
      .replace('</QueryNames/>', getQueryNameList(writeFnParameters).join(','))

      .replace('</childrenParams/>', writeParaString)
      .replace('</childrenParaTypes/>', writeParaTypesString);
  }
}

export class OutputController extends OutputControllerInsert implements IOutputController {
  constructor({ writeFnDoc, writeFnName, writeFnBody, writeFnParameters }: Partial<IOutputController>) {
    super();
    this.writeFnDoc = writeFnDoc || this.writeFnDoc;
    this.writeFnName = writeFnName || this.writeFnName;
    this.writeFnBody = writeFnBody || this.writeFnBody;
    this.writeFnParameters = writeFnParameters || this.writeFnParameters;
  }
}

interface ReplaceChildFnParams {
  childFunTemplate: string;
  writeFnDoc: string;
  writeParasDoc: string;
  writeFnParameters: any;
  functionName: string;
  url: string;
  method: any;
  writeParaString: string;
  writeParaTypesString: string;
  centerName: string;
  renderMethod?: (method: string) => string;
}

/**
 * 找出要通过body传递的参数
 */
function getParamNameInBody(method, parameters): string {
  if (method == 'get' || method === 'delete') {
    return '\{\}';
  }
  return (find(parameters, e => e.in === 'body') || {}).name || '{}';
}

/**
 * 获取所有在查询传中的参数名称
 * @param parameters
 */
function getQueryNameList(parameters): string[] {
  return chain(parameters)
    .filter(e => e.in === 'query')
    .map(e => e.name)
    .value();
}

/**
 * 内置替换接口方法中的变量字符串
 * @param childFunTemplate
 * @param DescriptionOfFn
 * @param ParasOfDescription
 * @param functionName
 * @param url
 * @param method
 * @param sortedParams
 * @param ParasOfFn
 * @param ParaTypesOfFn
 */
// export function
// export function
