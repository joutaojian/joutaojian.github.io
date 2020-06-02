CAT 是基于 Java 开发的实时应用监控平台。官方文档：https://github.com/dianping/cat/tree/master/cat-doc




CAT提供以下几种报表：

- **[Transaction报表](transaction.md)**    一段代码运行时间、次数，比如URL、Cache、SQL执行次数，QPS和响应时间 

- **[Event报表](event.md)**    一行代码运行次数，比如出现一个异常 

- **[Problem报表](problem.md)**    根据Transaction/Event数据分析出来系统可能出现的异常，包括访问较慢的程序等 

- **[Heartbeat报表](heartbeat.md)**    JVM内部一些状态信息，比如Memory，Thread等

- **[Business报表](business.md)**    业务监控报表，比如订单指标。与Transaction、Event、Problem不同，Business更偏向于宏观上的指标，另外三者偏向于微观代码的执行情况

#### 概述

CAT是需要导包引入的，同时也要手动埋点的，默认有自己的维度，同时也可以自定义维度，同时CAT带来的损耗肯定是有的，但是官方已经尽量降低损益了。

一般核心就是`Transaction` 和`Event`，前者注重的是调用的时间，后者注重的是调用的次数。



#### tp95 和 tp99

95line表示95%的请求的响应时间比参考值要小，99line表示99.9%的响应时间比参考值要小。



#### QPS

我们会用每秒查询率来衡量服务器的性能，其即为QPS。对应fetches/sec，即每秒的响应请求数，也即是最大吞吐能力。

每台机子的QPS肯定是有限的，如果突然间机器的QPS上去了，代表是不是流量负载过多了；QPS突然下去了，是不是什么操作（如慢查询）拖慢了速度。

`计算关系：QPS = 并发量 / 平均响应时间`



#### std

  STD是标准偏差值（Standard Deviation），主要用来反应样本空间分布情况。

    各个样本越接近平均值，STD越小，说明系统测试时的原始数据分布比较集中，基本接近平均值。所以这个值很小时，一定程度上可以表明系统更加稳定。 
    
      计算方法如下：
    
        S2 = Σ( Xi − X )2  / n − 1 
    
         式中X ： 样本平均值
         S ： 标准偏差
         n ： 样本数量




