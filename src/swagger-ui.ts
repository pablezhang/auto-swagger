import {map} from 'lodash';

export interface Tag {
  // 通常是Controller的名称，在Swagger中也用来分组，以折叠面板来显示
  name: string
  description: string
}

export interface ParamInfo {
  // 参数名称 todo 功能点过滤Application-Key
  name: string
  in: "header" | "body" | "query"
  // 参数的中文含义
  description: string
  // 是否为必选参数
  required: boolean
}

export interface PathItem {
  // 这个apiType 是ApiType类型
  [apiType: string]: {
    // Tags中的name组成的数组，相当于parentId的作用，用于反向查找，并归类
    tags: string[],
    // 通常是接口的英文描述
    summary: string
    //  通常是接口的中文描述
    description: string
    // 可能是对应后台Controller的函数名称， todo 功能点 可以再前端用作接口名称
    operationId: string
    //
    parameters: ParamInfo[]
    consumes: "application/json"
    produces: "application/json"
  }
}

// 每个接口的详细信息，包括url、参数、类型
export interface Path {
  // todo 功能点 需要在pathName中的花括号`{}`前插入`$`符号
  [pathName: string]: PathItem
}

export enum ApiType {
  GET = "get",
  POST = "post",
  PUT = "put",
  DELETE = "delete"
}

// 一个完整Swagger-ui页面传回来的数据结构
export interface SwaggerUi {
  // 通常是Controller的名称，在Swagger中也用来分组，以折叠面板来显示
  tags: Tag[]
  // 每个接口的详细信息，包括url、参数、类型
  paths: Path
  definitions: Definitions

  // swagger的版本号
  swagger: string
  info: {
    "description": "开发者平台API",
    "version": "1.0.0",
    "title": "开发者平台",
    "termsOfService": "http://",
    "contact": {
      "name": "云徙科技IT"
    }
  },
  // 部署所在的域名
  "host": "wxdev.dtyunxi.cn",
  // todo  What's this?
  "basePath": "/"

}



 export interface ApiStruct {
  // 接口中文描述
    description: string
 //  方法名称
    functionName: string
 //  参数
   param: object
 //  参数结构

 //   -----------

 //  方法体---

 //  url
    url: string
 //  type: get | post | delete | put
    type: "get" | "get" | "delete" | "put"
 //  in: query | body | header | path

 }

// 存储所有Dto的结构存储在该对象中
export interface Definitions {
  [ DtoName: string]: DtoItem
}

export interface DtoItem {
  // Dto的表现类型，这里只能是object
  type: "object"
  // 对象中会有哪些属性
  properties: {
    // 以数据库字段作为键名
    [fieldName: string]: {
      // 字段类型
      type: "integer" | "string" | "array"
      // 如何格式化后台数据
      format?: "init64"
      // 字段对应中文含义
      description: string
      // 是否可以为空，这个通常是对数据库而言，对接口调用者前端来说，意义不大
      allowEmptyValue: boolean

    }
  },
  // 在Swagger-UI中显示的DTO名称
  title: DtoName
}

// Dto的名称，如ButtonDto、MenuDto等
export type DtoName = string;

function getAllInterface(definitionsObj: Definitions) {

  return map((definitionsObj), function (dtoItem: DtoItem, dtoName:DtoName) {
    return {
      name: dtoName,
      keyList: [map(dtoItem.properties, (propItem, keyName) => ({
        keyName,
        type: propItem.type,
        description: propItem.description
      }))
      ]
    }
  })
}