---
category: 后台
layout: post
tags:
  - Java
  - SpringBoot
title: SpringBoot自动配置原理
---
[![阳光多好](http://7xkmea.com1.z0.glb.clouddn.com/githubio/%E9%98%B3%E5%85%89.jpg "阳光多好")](http://7xkmea.com1.z0.glb.clouddn.com/githubio/%E9%98%B3%E5%85%89.jpg "阳光多好")
SpringBoot基于“习惯即配置”的理念，提供了自动配置的功能，尽可能减少应用中所需要的XML配置文件，目前大多数的默认配置能够满足开发环境。

但是我们需要明白下列的几个问题：
1. 我们如果要怎么改变配置？
2. 自动配置和我们手动配置冲突的情况下，谁的优先级最高？
3. SpringBoot是如何实现自动配置的？(自动配置的原理)


## 修改配置的位置
SpringBoot在resources中可以增加一个application.properties或者application.yml文件作为应用的全局配置文件（SpringBoot会默认读取），推荐使用一种格式的文件，不要同时出现两种文件。

* properties的格式类似如下：
```json
## 家乡属性
home.province=ZheJiang
home.city=WenLing
home.desc=dev: I'm living in ${home.province} ${home.city}.
```

* yml是由Yaml语言编写的配置文件语言，[学习资料参考该博客](http://www.ruanyifeng.com/blog/2016/07/yaml.html?f=tt "学习资料参考该博客")，其格式如下：
```yaml
## 家乡属性
home:
	province: 浙江省
	city: 温岭松门
	desc: 我家住在${home.province}的${home.city}
```

注意：SpringBoot默认是以iso-8859 的编码方式读取application.properties，以utf-8读取application.yml，所以推荐使用yml文件，不然在application.properties的中文参数会变成乱码。


## 配置的种类
全局配置文件除了可以修改`自动配置`，也可以用于`自定义的配置`。

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


## 修改默认配置
知道修改配置的位置及格式之后，我们可以针对某些自动配置修改。
比如想更改默认tomcat端口，就可以写上：

    servlet.port=8088

只要在全局配置文件中写上相同的配置，即可覆盖应用的默认配置。具体的配置清单可以查看[官方文档](https://github.com/spring-projects/spring-boot/blob/v1.5.6.RELEASE/spring-boot-docs/src/main/asciidoc/appendix-application-properties.adoc "官方文档")


## 配置的优先级

上述证明手动配置的优先级高于自动配置。实际上整个SpringBoot应用共有9个地方可以修改配置参数，下面是罗列他们的优先级：
1. 命令行参数
2. java:comp/env 里的 JNDI 属性
3. JVM 系统属性
4. 操作系统环境变量
5. RandomValuePropertySource 属性类生成的 random.* 属性
6. 应用以外的 application.properties（或 yml）文件
7. 打包在应用内的 application.properties（或 yml）文件
8. 在应用 @Configuration 配置类中，用 @PropertySource 注解声明的属性文件
9. SpringApplication.setDefaultProperties 声明的默认属性

* 命令行的级别最高，可以紧急的时候使用，不需要重新打包。
* SpringBoot的自动配置是第8，9步，属于最低级别，可以随意被覆盖
* 开发者修改配置一般会在第6，7步，注意应用外的配置文件是可以覆盖应用内的，一般应用内可以是测试环境配置，外部配置环境是生产环境的配置，这样每次打包只需要替换服务器的jar包而不用考虑内部的配置文件。


## 多环境配置

项目会存在很多场景的配置，我们需要不同的包去运行项目，尤其是B2B项目，所以我们可以设置多个环境的配置。Spring Boot 是通过 application.properties 文件中，设置 `spring.profiles.active` 属性，如下：
```xml
spring.profiles.active=dev
```
* 配置了 dev ,则加载的是 `application-dev.properties`
* 配置了 prod ,则加载的是 `application-prod.properties`,

但是这时候就会有三个配置文件了，不过在项目中小心被应用外部的配置文件覆盖，所以我们可以考虑用命令行的方式覆盖该配置，毕竟命令行的优先级别最高。
```java
java -jar -Dspring.profiles.active=prod springboot-properties-0.0.1-SNAPSHOT.jar
//-D代表设置系统变量，而且只在该次运行有效
//等效于：你在运行时设置了变量 spring.profiles.active=prod
//SpringBoot会先从系统变量源拿属性值，程序中会调用System.getProperty("spring.profiles.active")
```


## 自动配置原理
Spring Boot应用通常有一个名为*Application的入口类，入口类中有一个main方法，这个方法其实就是一个标准的Java应用的入口方法。一般在main方法中使用SpringApplication.run()来启动整个应用。值得注意的是，这个入口类要使用@SpringBootApplication注解声明。

1. SpringApplication.run()启动应用
2. 扫描到@SpringBootApplication注解
3. 调用@EnableAutoConfiguration注解
4. 引入EnableAutoConfigurationImportSelector类
5. 调用EnableAutoConfigurationImportSelector类的父类方法selectImports()
6. selectImports()调用Spring 4 提供的的SpringFactoriesLoader工具类
7. 通过SpringFactoriesLoader.loadFactoryNames()读取了ClassPath下面的META-INF/spring.factories文件
8. 读取文件中org.springframework.boot.autoconfigure.EnableAutoConfiguration里面所有的参数，开始运行预设好的配置类
9. 各个配置类根据条件注解(判断是否存在某些类)，决定是否实例化配置类内部定义的bean，避免在bean初始化过程中由于条件不足，导致应用启动失败

需要注意的是，我们也可以自己`定义自己的META-INF/spring.factories`，就是说spring.factories可以有多个，只要保证路径都是META-INF/spring.factories。因此我们也可以自己开发自己的自动配置类，SpringBoot启动的时候会自动扫描到并运行配置类，实例化内部的bean。

可以参考这个配置类的实现：
```java
@Configuration
@AutoConfigureAfter({JmxAutoConfiguration.class})
@ConditionalOnProperty(
    prefix = "spring.application.admin",
    value = {"enabled"},
    havingValue = "true",
    matchIfMissing = false
)
public class SpringApplicationAdminJmxAutoConfiguration {
    @Bean
    @ConditionalOnMissingBean
    public SpringApplicationAdminMXBeanRegistrar springApplicationAdminRegistrar() throws MalformedObjectNameException {
        String jmxName = this.environment.getProperty("spring.application.admin.jmx-name", "org.springframework.boot:type=Admin,name=SpringApplication");
        if(this.mbeanExporter != null) {
            this.mbeanExporter.addExcludedBean(jmxName);
        }

        return new SpringApplicationAdminMXBeanRegistrar(jmxName);
    }
}
```


自动化配置的实现结构图，如下：
[![结构](http://7xkmea.com1.z0.glb.clouddn.com/%E8%87%AA%E5%8A%A8%E9%85%8D%E7%BD%AE%E7%BB%93%E6%9E%84.png "结构")](http://7xkmea.com1.z0.glb.clouddn.com/%E8%87%AA%E5%8A%A8%E9%85%8D%E7%BD%AE%E7%BB%93%E6%9E%84.png "结构")

## 感谢资料

[Hollis大神](http://mp.weixin.qq.com/s?src=3&timestamp=1505047649&ver=1&signature=MkUMueTxX*-lE-wgS0Jupo67LsauoCpNLhW77Vy5IxeUdMUUa-rg3U*NG74PBiqGF9CLtNseKDxpCkoNobvoDH7hTqtkkphBkNpMKgQrAQLCmtHUsz1*4I7SNeUu7-INpSOsjJt3wOjDjt77z9anBdH*SoEUT6Q*mdM37LCyQ2A= "Hollis大神")
[泥瓦匠的博客](http://www.bysocket.com/?p=1786 "泥瓦匠的博客")
[程序员DD的博客](http://blog.didispace.com/springbootproperties/ "程序员DD的博客")
[SpringBoot的配置清单文档](http://docs.spring.io/spring-boot/docs/current/reference/html/common-application-properties.html "SpringBoot的配置清单文档")
