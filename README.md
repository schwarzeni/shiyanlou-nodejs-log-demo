# shiyanlou-nodejs-log-demo

# 使用到的组件
- redis     缓存用户的session数据
- mongodb   储存用户账户信息
- express   服务器

---

# 项目结构
```
	|- app.js                主文件
	|- package.json          项目依赖项
	|- public/               html页面
		|- index.html
		|- login.html
		|- signin.html
	|- db_util/
		|- mongodb_config.js  数据库连接以及数据表
		|- util.js	          操作数据库的工具方法
		|- sys_msg.js         一些提示信息

```
---

# 测试指南
- 安装依赖
- 启动redis， mongodb
- 启动 app.js
- 进入 localhost:3000 即可测试