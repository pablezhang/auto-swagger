
# Auto-Swagger
`auto-swagger`是一个爬取swagger-ui并生成请求接口文件的命令行工具，旨在帮助接口调用者一键生成接口代码文件。
## 为什么要做auto-swagger？
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;在工作中，通常后台开发同学会提供一份swagger接口文档。前端同学每次查询该文档调用某个接口。相当于，我们从swagger-ui上摘录接口使用方法，想象大家在开发过程中是否遇到过以下问题：

 1. 调用接口发现接口报404，费心费力检查发现把单词拼错了~
 2. 调用接口发现接口报400，仔细对比swaager发现参数类型写错、参数名称写错~
 3. 一时大意把请求类型写错了~
 4. ....

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;如果在工作中你也遇到过上述问题，或许内心会指责自己的粗心大意，同时有一点的心累0.0。开发者在swagger-ui文档中抄录接口时都会可能会抄错接口的url、参数类型、参数名称等等。尤其，开发同学有可能在赶项目进度、面对swagger-ui接口数量大、文档不规范等问题时出错的几率会更大。<br/>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;auto-swagger正是为解决上述机械重复的swagger抄录工作而出现的。


## 如何使用
### 1、安装auto-swagger
```npm install auto-swagger -g```
或
```yarn add auto-swagger -g```
### 2、添加配置文件swagger.config.js
如果你是第一次使用，建议你使用初始化配置命令。打开命令行工具
```auto-swagger init```
此时，你的目录下应该会有一个`swagger.config.js`文件

```
// swagger-url地址，找到返回主要json的请求
const urlAddress = 'http://your-swagger-url/v2/api-docs';
// 想要输出的swaager接口文件存放的路径，请使用相对路径。
const outputPath ='Services';
// 指定过滤掉某些参数，这些参数通常由于是公用的缘故，不需要每个接口中都传值
const excludeParamName = [
  "Application-Key",
  "Access-Token",
  "extFields"
];

const config = {
  excludeParamName,
  outputPath,
  url: urlAddress
};

module.exports = config;
```
上述代码，是一个简单配置的`swagger.config.js`文件
### 3、开始获取swagger-ui的接口文件
执行下面的命令
```
auto-swagger run
```

此时，你会发在你指定的outputPath中会多了一些`SomeService`文件，这些文件即为接口调用文件。
到此，基本的用法已经完成了
## 如何在项目中集成auto-swagger生成的接口文件？
先看下的生成的接口文件长什么样子, 此处使用了一个公共的swagger地址：http://petstore.swagger.io/
```ts
//Operationsaboutuser.ts
/**
 * @Description: User
 */
 
 /** 注意Request为自行封装的ajax请求文件，需要自行实现。 */
import Request from 'utils/Request';
class Operationsaboutuser {
  
  /**
   *  接口简介 This can only be done by the logged in user.
   *  接口备注 This can only be done by the logged in user.
   *  接口类型 post
   *  接口地址 /user
   *  @param body [object Object] Created user object
   */
    public async createUser ({body}) {
      return Request({
        url:`/user`,
        method:'POST',
        data: body,
        query: {},
        app: 'user',
      })
    }
  
}

// 默认将每一个Controller作为一个文件，并以Controller名称作为单例类的名称
export default new Operationsaboutuser

```
## 如何在项目中使用这些接口文件？<br />
第一步，需要自行实现`Request`文件。其可能需要支持几个必选参数<br />
1、url:即swagger请求路径<br />
2、method: "POST" | "GET" | "DELETE" | "PUT"等你需要支持的方法<br />
3、data: 通常是POST与PUT方法才有<br />
4、query: 查询参数<br />
我们上面说其可能支持这几个参数，是因为`Request`是你自己实现的。你可以完全自主的决定形参。

第二步、调用<br/>
观察上述文件，发现接口方法被封装在了一个单例中,因此使用时也极其简单
```javascript
import Operationsaboutuser from 'Services/Operationsaboutuser';

async function  createBody(body) {
  const {resultCode, resultMsg} =  await Operationsaboutuser.createUser({body})
  if(resultCode === "0"){
    console.log("新建成功")
  }
}

createBody({id: "123", name: "foo"}) // 新建成功

```
如何自定义接口文件格式，以集成到已有的项目。例如项目中已有`Request.js`，但文件不在`utils`中，而且由于某些原因你不能修改这些历史代码。
`auto-swagger`可以自定义生成接口文件的方式，完整配置如下

 1. `url: string`：swagger-ui中json信息接口
 2. `outputPath: string`：以`swagger.config.js`所在文件夹为根目录，指定要输出接口文件到指定的路径
 3. `excludeParamName: string[]`：需要过滤掉的参数，如`Application-key`、`token`等每个接口中都需要的参数，不必再在每个接口文件参数中体现。
 4. `childFunTemplate: string`： 每个接口函数的模板字符串。默认值如下所示
 
```javascript
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
        query: {</QueryNames/>},
        app: 'user',
      })
    }
`;
```
5 . `parentFunTemplate: string`： 每个接口文件的配置字符串。默认值如下
```
const parentFunTemplate = `
/**
 * @Description: </FileDescription/>
 */
import Request from 'utils/Request'; //此处可以修改为指定的Request文件
class </parentFunName/> { // 也可以去掉不封装为，单例模式、
  </childFunList/>
}
export default new </parentFunName/>`;
```
