自动化swagger转TypeScript工具

默认转换成js 如果要转换成ts的话 请放开这两个注释

```
// 如果要保存为ts格式的话 只要把这行改一下就可以了
// .replace('</childrenParams/>',operations.parameters.map((e)=>`${e.name}:${e.type}`))

<!-- 最底部 -->
// fs.writeFileSync(__dirname + '/apiCommand.ts',content + endContent)
```

使用说明

```
// 使用之前 将这个url地址 替换为自己后台swagger网站的地址
const urlAddress = '';

然后直接node api.js就会自动帮你在js目录下生成一个对应的api脚本文档

