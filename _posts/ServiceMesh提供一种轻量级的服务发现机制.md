多服务下，需要提供服务发现机制，才能让调用方找到服务。

**历史上有三种服务发现机制：**
1、传统集中式代理：ng负载均衡，通过upstream配置提供服务发现能力
![image.png](https://upload-images.jianshu.io/upload_images/3796089-8d5addb72a182886.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
2、客户端嵌入式代理：Eureka，提供自动注册自动发现的能力
![image.png](https://upload-images.jianshu.io/upload_images/3796089-46280da0d81709f3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
3、主机独立进程代理：linkerd或istio，每台机器上都启动代理服务
![image.png](https://upload-images.jianshu.io/upload_images/3796089-c136023b7c2e6be7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**三个各有所长，罗列优缺点：**
| 服务发现机制 | 优 | 缺 |
| ------ | ------ | ------ |
| 传统集中式代理 | 运维简单 | 配置后期复杂到爆炸，单点挂了就真的挂了 |
| 客户端嵌入式代理 | 无配置，自动注册发现 | 无法快速隔离单节点流量，治理松散，客户端需要开发难以支持多语言 |
| 主机独立进程代理 | 上述的折中方案，配合Eureka做到自动注册发现，同时可以统一管理所有机器的代理，随意分配节点流量 | 运维保障，烧单机的CPU资源 |

**各界推崇mesh的原因：**
1、上述模式一和二有缺陷，模式一重，有单点和性能问题；模式二则有客户端复杂，支持多语言困难，无法集中治理的问题。模式三是模式一和二的折中，弥补了两者的不足，它是纯分布式的，没有单点问题，性能也OK，应用语言栈无关，可以集中治理。
2、迁移客户端与服务端中的服务治理相关的功能到中间件（Local Proxy or Sidecar），降低升级服务治理功能带来的成本，让服务发现功能升级变得透明，不需要天天催着业务方升级sdk包（沟通成本很高）。

**mesh实现上也有2种：**
1、sidecar，微服务的请求和被请求流量都经过这个代理，比如spring-sidecar
2、localproxy，微服务的请求流量经过这个代理，但是被请求流量直接到微服务，比如linkerd
![image.png](https://upload-images.jianshu.io/upload_images/3796089-d4ace1f01d35233f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**mesh的技术选型：**
![image.png](https://upload-images.jianshu.io/upload_images/3796089-769b9db3351e8b84.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


> 参考：https://www.jianshu.com/p/27a742e349f7
