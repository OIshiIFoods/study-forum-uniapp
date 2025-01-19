# 项目介绍

## 技术栈

**框架：** uniapp

**CSS：**sass、unocss

**UI库：** uview-plus

**路由：**uni-mini-router

**状态管理：**pinia



## 运行

> 采取自定义运行模式，在 `package.json` 中配置在不同环境中运行的环境变量

**运行命令**

```
npm run dev:custom localhost
```

**获取环境变量**

```
process.env.变量名称
```

```json
// package.json
{
    "uni-app": {
        "scripts": {
            "localhost": {
                "title": "本地",
                "env": {
                    "UNI_PLATFORM": "mp-weixin",
                    "BASE_URL": "http://localhost:3000"
                }
            },
            "dev": {
                "title": "测试环境",
                "env": {}
            }
        }
    }
}
```

