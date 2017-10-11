---
category: 后台
layout: post
tags:
  - Java
  - SpringBoot
title: SpringBoot应用启动原理
---
[![](http://7xkmea.com1.z0.glb.clouddn.com/githubio/SpringBoot%E5%BA%94%E7%94%A8%E5%90%AF%E5%8A%A8%E5%8E%9F%E7%90%86-1.jpg)](http://7xkmea.com1.z0.glb.clouddn.com/githubio/SpringBoot%E5%BA%94%E7%94%A8%E5%90%AF%E5%8A%A8%E5%8E%9F%E7%90%86-1.jpg)
在spring boot(以下统称sb)里，很吸引人的一个特性是可以直接把应用打包成为一个jar/war，然后这个jar/war是可以直接启动的。甚至对于一个web项目也是不需要另外配置一个Web Server的，可以直接启动。

所以我们遇到了两个问题：
1. sb是怎样自己启动的？
2. 没有web server，sb是怎样启动web项目的？

## 简化的描述
```java
// Spring Boot 应用的标识
@SpringBootApplication
// mapper 接口类扫描包配置
@MapperScan("org.spring.springboot.dao")
public class Application {

    public static void main(String[] args) {
        // 程序启动入口
        // 启动嵌入式的 Tomcat 并初始化 Spring 环境及其各 Spring 组件
        SpringApplication.run(Application.class,args);
    }
}

```
上述代码应该很熟悉，就是sb启动的文件。这里有两个核心点：
> @SpringBootApplication注解和run()方法。

如下图，这是大概的流程：
[![](http://7xkmea.com1.z0.glb.clouddn.com/githubioSpringBoot%E5%BA%94%E7%94%A8%E5%90%AF%E5%8A%A8%E5%8E%9F%E7%90%86-2.jpg)](http://7xkmea.com1.z0.glb.clouddn.com/githubioSpringBoot%E5%BA%94%E7%94%A8%E5%90%AF%E5%8A%A8%E5%8E%9F%E7%90%86-2.jpg)

我们大概可以了解到几个点：
> 1. 应用初始化的时候去扫描启动类的注解，并启动自动化配置
> 2. 自动化配置中实例对象需要放到Spring的IOC容器中
> 3. sb可以自己判断是否是web项目



## 感谢资料
[嘟嘟MD的干货](http://www.cnblogs.com/zheting/category/966890.html "嘟嘟MD的干货")
[hengyunabc](http://blog.csdn.net/hengyunabc/article/details/50120001 "hengyunabc")