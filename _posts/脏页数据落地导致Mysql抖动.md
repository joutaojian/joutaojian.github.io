线上出现SQL时延大幅上涨，拿到监控数据，未能准确知道原因。

**一、监控数据**
1、外部流量无上涨，SQL时延上涨100倍
![image.png](https://upload-images.jianshu.io/upload_images/3796089-052f662d0c77cff6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2、DB的QPS陡然下降
![image.png](https://upload-images.jianshu.io/upload_images/3796089-aa11cf6409faba6e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)


3、DB所在的机器IO，写流量剧增
![image.png](https://upload-images.jianshu.io/upload_images/3796089-f79166937ee5c7af.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

4、内网网络无明显波动
![image.png](https://upload-images.jianshu.io/upload_images/3796089-82eb6440cbe205c2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

5、Mysql主从库都出现相同的情况

**二、开始分析**
初步判断：
1、DB机器出现大量写操作，影响IO导致DB时延上涨及QPS下降
2、服务的QPS没上涨，代表不是服务流量影响DB

总结：
MYSQL本身的操作所致，而且是写磁盘的操作，很有可能是涉及主从同步。

**三、破案**
运维看了下，回答如下：
原因：主库的落地导致IO 拉高了。
解决办法：调整脏数据的落地百分比，调低一些，增加落地频率，别一次性落地这么猛。
![image.png](https://upload-images.jianshu.io/upload_images/3796089-4eef1f6ecba5d5e4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

更改后，IO不再抖动：
![image.png](https://upload-images.jianshu.io/upload_images/3796089-ddc65a15b60907bf.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

**四、脏页**
页面更新是在缓存池Buffer Pool中先进行的，那它就和磁盘上的页不一致了，这样的缓存页也被称为脏页（英文名：**dirty** page）
https://blog.csdn.net/weixin_33812433/article/details/92853658
![image.png](https://upload-images.jianshu.io/upload_images/3796089-90f8fbd80d1fca44.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
