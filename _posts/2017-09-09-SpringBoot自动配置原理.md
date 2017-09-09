---
title: SpringBoot自动配置原理
layout: post
tags:
  - Java
  - SpringBoot
category: 后台
---
SpringBoot基于“习惯即配置”的理念，提供了自动配置的功能，尽可能减少应用中所需要的XML配置文件，目前大多数的默认配置能够满足开发环境。

但是我们需要明白下列的几个问题：
1.我们如果要怎么改变配置？
2.自动配置和我们手动配置冲突的情况下，谁的优先级最高？
3.SpringBoot是如何实现自动配置的？(自动配置的原理)


## 修改配置的位置
SpringBoot在resources中可以增加一个application.properties或者application.yml文件作为应用的全局配置文件。

* properties的格式类似如下：
```json
## 家乡属性
home.province=ZheJiang
home.city=WenLing
home.desc=dev: I'm living in ${home.province} ${home.city}.
```

* yml是有Yaml语言编写的配置文件语言，[学习资料参考该博客](http://www.ruanyifeng.com/blog/2016/07/yaml.html?f=tt "学习资料参考该博客")，其格式如下：
```yaml
## 家乡属性
home:
	province: 浙江省
	city: 温岭松门
	desc: 我家住在${home.province}的${home.city}
```


## 配置的种类
全局配置文件除了可以修改`自动配置`，也可以写上`自定义的配置`。

* 自动配置

由SpringBoot提供，基本覆盖流行的框架/中间件/第三方软件的默认配置，目前提供的自动配置达到963个(1.5.6的版本)，具体的清单可以看[官方文档](https://github.com/spring-projects/spring-boot/blob/v1.5.6.RELEASE/spring-boot-docs/src/main/asciidoc/appendix-application-properties.adoc "官方文档")，注意文档对应的版本。

* 自定义配置

比如旧项目中的一些业务配置就可以完全放在配置文件中，利用注解可以直接获取并赋值到`属性`或者`对象`。如：
```java
/* 赋值到对象 */
@Component
@ConfigurationProperties(prefix = "home")
public class HomeProperties {
    private String province;
    private String city;
    private String desc;
```
```java
/* 赋值到属性 */
@Component
public class HomeProperties1 {
    @Value("${home.province}")
    private String province;
    @Value("${home.city}")
    private String city;
    @Value("${home.desc}")
    private String desc;
```


## 怎么修改配置
知道修改配置的位置及格式之后，我们可以针对某些自动配置修改。
比如想更改默认tomcat端口，就可以写上：

    servlet.port=8088

只要在全局配置文件中写上相同的配置，即可覆盖应用的默认配置。具体的配置清单可以查看[官方文档](https://github.com/spring-projects/spring-boot/blob/v1.5.6.RELEASE/spring-boot-docs/src/main/asciidoc/appendix-application-properties.adoc "官方文档")


## 配置的优先级