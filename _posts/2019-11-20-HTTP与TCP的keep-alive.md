---
title: HTTP与TCP的keep-alive
layout: post
tags:
  - Http
  - Tcp
category: 网络
---
参考：[https://blog.csdn.net/weixin_37672169/article/details/80283935](https://blog.csdn.net/weixin_37672169/article/details/80283935)
[https://blog.csdn.net/chrisnotfound/article/details/80111559](https://blog.csdn.net/chrisnotfound/article/details/80111559)


>分清http和Tcp的Keepalive
>1、HTTP协议的Keep-Alive意图在于TCP连接复用，同一个连接上串行方式传递请求-响应数据；
>2、TCP的Keepalive机制意图在于探测连接的终端是否存活，利用心跳包保持长链接。



## 1、http 的Keepalive

1、每个http的请求/应答，客户端和服务器都要新建一个TCP连接（三次握手），完成之后立即断开连接（四次挥手）。
2、keep-alive可以使这个连接不断开，然后给下一个http请求继续复用。

#### http1.0 和http1.1 不同
1、http1.0中默认是关闭的，需要在http头加入”Connection: Keep-Alive”，才能启用Keep-Alive；
2、http 1.1中默认启用Keep-Alive，如果加入”Connection: close “才关闭。
3、目前大部分浏览器都是用http1.1协议，默认使用Keep-Alive，所以是否能完成一个完整的Keep- Alive连接就看服务器设置情况。

#### 优缺点
优点：Keep-Alive模式更加高效，因为避免了连接建立和释放的开销。
缺点：长时间的Tcp连接容易导致系统资源无效占用，浪费系统资源。



## 2、tcp 的Keepalive

当一个 TCP 连接建立之后，启用 TCP Keepalive 的一端便会启动一个计时器，当这个计时器数值到达 0 之后，一个 TCP 探测包便会被发出。（就是个心跳包）

#### 默认是关闭的
Keepalive 技术只是 TCP 技术中的一个可选项，因为不当的配置可能会引起一些问题，所以默认是关闭的。