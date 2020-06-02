分布式微服务治理的核心在于: **微服务和分布式**
- （微服务框架）微服务的最优技术实现目前是: SpringBoot
- （RPC框架）分布式的最优技术实现目前是: Thrift,Motan,Dubbo,Spring Cloud(Netflix OSS),Finagle,gRPC

## RPC是什么
> - RPC 的全称是 Remote Procedure Call ，是一种进程间通信方式。
> - 它允许程序调用另一个地址空间的过程或函数，而不用程序员显式编码这个远程调用的细节，程序员无论是调用本地的还是远程的，本质上编写的调用代码基本相同。
> - 说两台服务器A、B，一个应用部署在A服务器上，想要调用B服务器上应用提供的函数/方法，由于不在一个内存空间，不能直接调用，需要通过网络来表达调用的语义和传达调用的数据。

Remote Procedure Call，翻译过来应该是“远程程序调用”，目前业内通用的翻译是“远程过程调用”，但是“过程”这个词很容易造成误解，翻译成“程序”更好理解RPC的意义。

## RPC协议说了什么
一般所谓的XX协议就是个文档，类似于我们的需求文档，只说了要做什么，但是具体怎么做是由各大开源大佬做的。`一般情况下都会实现核心功能，不同的开源在细节上实现都会不一样，这个需要注意！`

RPC 这个概念术语在上世纪 80 年代由 Bruce Jay Nelson 提出的，在 Nelson 的论文 "Implementing Remote Procedure Calls" 中，他提到了几个`RPC的特点`：
> 1. 简单：RPC 概念的语义十分清晰和简单，这样建立分布式计算就更容易。
> 2. 高效：过程调用看起来十分简单而且高效。
> 3. 通用：在单机计算中过程往往是不同算法部分间最重要的通信机制。

除此之外，这位大佬还给出了实现RPC框架的`详细架构图`：
![image.png](https://upload-images.jianshu.io/upload_images/3796089-9313f3046fa9e37e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


结合上图，Nelson 的论文中指出实现 RPC 的程序包括 5 个部分：
> 1. User
> 2. User-stub
> 3. RPCRuntime
> 4. Server-stub
> 5. Server

------------

> 1. User 是调用方
> 2. User-stub 负责将调用的接口、方法和参数通过约定的协议规范进行编码
> 3. RPCRuntime 负责将本地数据传输到远端的RPCRuntime
> 4. Server-stub 负责根据约定的协议规范进行解码
> 5. Server 是被调用方

所以这架构图的意思是：当 user 想发起一个远程调用时，它实际是通过本地调用 User-stub。并通过本地的RPCRuntime传输 。远端 RPCRuntime 实例收到请求后交给 Server-stub 进行解码后发起本地端调用，调用结果再返回给 User 端。

## 实现RPC协议需要什么
看完协议内容，跟着就得实现这个协议啦，这时候你是不是发现了问题的严重性：`自！己！一！点！思！路！都！没！有！`
![image.png](https://upload-images.jianshu.io/upload_images/3796089-d4a908b0766035f3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 序列化协议和传输协议
所以我们需要再理解一下RPC协议，根据Nelson的论文知道我们要做的两件事：
> 1. 将调用的接口、方法和参数通过约定的协议规范进行编码/解码（User-stub/Server-stub）
> 2. 将本地数据传输到远端(RPCRuntime)

上述两点其实是实现RPC协议的两大要素：**序列化协议和传输协议**。

#### 本地与远程调用的对比
因为RPC本质上是进程间通信，而“本地调用和远程调用的对比”实际上就是“进程内通信和进程间通信的对比”。通过两者的对比，我们才能理解到**序列化协议和传输协议**的作用，如下图：
![image.png](https://upload-images.jianshu.io/upload_images/3796089-2a2913094ec3efef.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 理解单点式RPC框架和分布式RPC框架的区别
最基本的RPC框架就是**单点式**的，因为A服务直接调用B服务，不经过第三方，这种是最简单的。但是必须是A和B同时部署一套，A1只能调用B1，A2只能调用B2。
> 假设现在B服务出现了性能瓶颈，部署多台B服务的同时，也只能部署多台A服务，很浪费资源。

所以需要一台A服务对多台B服务，利用第三方服务(注册中心)找到其他B服务，而不是写死B服务的地址。这种RPC才是**分布式**RPC，也是业内主流。

* 单点式RPC框架（自己玩自己）：
![image.png](https://upload-images.jianshu.io/upload_images/3796089-198f2061961b8bfa.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


* 分布式RPC框架(自己玩自己，还能玩别人)：
![image.png](https://upload-images.jianshu.io/upload_images/3796089-73c8f433a344049d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


#### 实现分布式RPC框架需要什么
单点RPC框架只需要：
> 1. 序列化协议
> 2. 传输协议

但是我们要做分布式的啊，所以需要：
> 1. 序列化协议
> 2. 传输协议
> 3. 服务注册发现中心

实际上在生产环境中，我们需要实时监控服务的调用情况，所以需要一个微服务管理中心，甚至是一个自动化运维的管理中心，所以需要：
> 1. 序列化协议
> 2. 传输协议
> 3. 服务注册发现中心
> 4. 服务监控管理中心

在文章的第二节我们看到大佬论文中对RPC的总结，其中一个很重要的一点：“通用”。
-  对的，30年前的初衷更大的是需要解决异构系统的服务调用问题，序列化协议和传输协议必须是通用的才是好的RPC框架，你总不能只能Java用，然后C#用不了，Scala用不了，Go用不了吧。
- 比如某个服务的并发需求高需要用GO来解决，因为以前用的Java性能低下。然后你的RPC框架不支持GO，完蛋啦，中间的一个服务是GO写的，上层服务是Java来调用的，不支持跨语言的RPC，Go语言写的新服务完全用不了，那还玩个鸡儿。

所以我们需要：
> 1. 序列化协议
> 2. 传输协议
> 3. 服务注册发现中心
> 4. 服务监控管理中心
> 5. 能跨语言调用（无关语言）

对的，能实现上述五点的，才是一个合格的RPC框架，但还不是优秀，因为我们还要考虑下性能。

## 说下业内流行的RPC框架和性能问题
先打个底，目前流行的RPC框架大多都是多管闲事，不单单只是RPC框架，你可以看看Dubbo和SpringCloud中除了RPC还有什么骚功能。
> 尤其是SpringCloud，很难分类，自己就是一个集成框架，把微服务框架SpringBoot集成进来了，把别人的注册发现服务集成进来了，本身自己又支持RPC，所以这货压根就不是一个单纯的RPC框架，简直就是**一整套分布式微服务治理的解决方案**！

可以看看别人的各种RPC框架总结：[http://www.cnblogs.com/moonandstar08/p/6291283.html](http://www.cnblogs.com/moonandstar08/p/6291283.html "http://www.cnblogs.com/moonandstar08/p/6291283.html")
在网上找到了个图，但是没有提到SpringCloud，暂且看看先，因为有些不认为是对的：
![image.png](https://upload-images.jianshu.io/upload_images/3796089-19d1dc0999db969a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


我们可以看到各个RPC框架使用的序列化协议，注册中心，管理中心，是否跨语言，但是传输协议没有提到。

#### 性能问题
参考这篇博客：[http://blog.csdn.net/jek123456/article/details/70208049](http://blog.csdn.net/jek123456/article/details/70208049 "http://blog.csdn.net/jek123456/article/details/70208049")
综合来说，在性能上rpcx是首选，但是考虑到框架的生态，其实还是推荐Dubbo或者SpringCloud的，因为除了性能，成本也是很重要的，无论是学习成本还是研发成本。

## 感谢

- [moonandstar08](http://www.cnblogs.com/moonandstar08/p/6291283.html "moonandstar08")
- [NullPointerExcept](http://blog.csdn.net/jek123456/article/details/70208049 "NullPointerExcept")
- [mindwind](http://blog.csdn.net/mindfloating/article/details/39473807 "mindwind")
