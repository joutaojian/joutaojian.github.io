---
title: SpringBoot应用启动原理
layout: post
tags:
  - Java
  - SpringBoot
category: 后台
---
[![](http://7xkmea.com1.z0.glb.clouddn.com/githubio/SpringBoot%E5%BA%94%E7%94%A8%E5%90%AF%E5%8A%A8%E5%8E%9F%E7%90%86-1.jpg "")](http://7xkmea.com1.z0.glb.clouddn.com/githubio/SpringBoot%E5%BA%94%E7%94%A8%E5%90%AF%E5%8A%A8%E5%8E%9F%E7%90%86-1.jpg "")
在spring boot(以下统称sb)里，很吸引人的一个特性是可以直接把应用打包成为一个jar/war，然后这个jar/war是可以直接启动的，甚至对于web项目是不需要另外配置一个Web Server的。

所以我们遇到了两个问题：
1.sb是怎样自己启动的？
2.没有web server，sb是怎样启动web项目的？

## 配置的种类