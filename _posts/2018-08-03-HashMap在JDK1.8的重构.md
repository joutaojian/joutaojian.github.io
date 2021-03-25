---
title: HashMap在JDK1.8的重构
layout: post
tags:
  - Java
  - 集合
  - Hashmap
category: 后台
---
参考（感谢以下大佬）：
http://blog.csdn.net/qq_27093465/article/details/52207135
http://blog.csdn.net/u011392897/article/details/57105709
http://www.cnblogs.com/ygj0930/p/6543350.html
http://blog.csdn.net/u011392897/article/details/57115818
http://blog.csdn.net/u011392897/article/details/60141790
http://blog.csdn.net/u011392897/article/details/60149314
https://coolshell.cn/articles/9606.html
https://www.cnblogs.com/woshimrf/p/hashmap.html
https://blog.csdn.net/qq_27093465/article/details/52207135
https://blog.csdn.net/hzw05103020/article/details/47207787
https://github.com/crossoverJie/Java-Interview/blob/master/MD/HashMap.md

## JDK1.7的HashMap
> 以下基于 JDK1.7 分析。

##### 初始化
![image](http://upload-images.jianshu.io/upload_images/3796089-86fea16c9b8f4245.jpg?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如图所示，HashMap 底层是基于数组和链表实现的。其中有两个重要的参数：

- 容量
- 负载因子

容量的默认大小是 16，负载因子是 0.75，当 `HashMap` 的 `size > 16*0.75` 时就会发生扩容resize(容量和负载因子都可以自由调整)。

```java
//扩容判断值
newThr = (int)(DEFAULT_LOAD_FACTOR * DEFAULT_INITIAL_CAPACITY);//0.75*16
threshold = newThr;

//容量大于阀值，触发resize
if (++size > threshold)
            resize();

//新建数组
Node<K,V>[] newTab = (Node<K,V>[])new Node[newCap];

//后续是利用头插法，将旧值赋值到新的数组去
```

##### put 方法
* 首先会将传入的 Key 做 `hash` 运算计算出 hashcode,然后根据数组长度**取模**计算出在数组中的 index 下标。

(由于在计算中位运算比取模运算效率高的多，所以 HashMap 规定数组的长度为 `2^n` 。这样用 `2^n - 1` 做位运算与取模效果一致，并且效率还要高出许多。参考：https://blog.csdn.net/Feifan_Feimeng/article/details/71006015)
```java
//源码
if ((tab = table) == null || (n = tab.length) == 0)
            n = (tab = resize()).length;
        if ((p = tab[i = (n - 1) & hash]) == null)
            tab[i] = newNode(hash, key, value, null);
//先获取长度：(tab = resize()).length
//再算出index：tab[i = (n - 1) & hash]
```

* 由于数组的长度有限，所以难免会出现不同的 Key 通过运算得到的 index 相同，这个就是hash冲突。

(这种情况可以利用链表来解决，HashMap 会在 `table[index]`处形成链表，采用头插法将数据插入到链表中。如：head --> 3 --> 7 --> 5)

##### get 方法

get 和 put 类似，也是将传入的 Key 计算出 index ，如果该位置上是一个链表就需要遍历整个链表，通过 `key.equals(k)` 来找到对应的元素。(注意：这里使得HashMap的性能下降，从O(1)变成O(n))

##### 遍历 方法


```java
 Iterator<Map.Entry<String, Integer>> entryIterator = map.entrySet().iterator();
        while (entryIterator.hasNext()) {
            Map.Entry<String, Integer> next = entryIterator.next();
            System.out.println("key=" + next.getKey() + " value=" + next.getValue());
        }
```

```java
Iterator<String> iterator = map.keySet().iterator();
        while (iterator.hasNext()){
            String key = iterator.next();
            System.out.println("key=" + key + " value=" + map.get(key));

        }
```

```java
map.forEach((key,value)->{
    System.out.println("key=" + key + " value=" + value);
});
```

**强烈建议**使用第一种 EntrySet 进行遍历。

* 第一种可以把 key value 同时取出；
* 第二种还得需要通过 key 取一次 value，效率较低,；
* 第三种需要 `JDK1.8` 以上，通过外层遍历 table，内层遍历链表或红黑树。 

##### 缺点
* 缺点1：数据量大的时候导致频繁扩容，效率降低
* 缺点2：数据量大的时候，hash取模冲突导致链表过长，O(1)变成O(n)
* 缺点3：线程不安全，会出现循环链表导致线程死循环

## JDK1.8中HashMap的改进

> 针对上述的HashMap的三个缺点，JDK1.8该如何解决?

##### 1.扩容效率低怎么办？

> 没解决！

新版的依然是：容量的默认大小是 16，负载因子是 0.75，达到阀值依然执行resize()。
依然是新增一个数组，损耗依然存在！

##### 2.hash取模冲突导致链表过长，O(1)变成O(n)怎么办？

```java
//Node链表的容量大于8的时候，触发使用红黑树存储
static final int TREEIFY_THRESHOLD = 8;
if (binCount >= TREEIFY_THRESHOLD - 1)
                treeifyBin(tab, hash);

//不用链表存储了，用红黑树存储
     /**
     * Replaces all linked nodes in bin at index for given hash unless
     * table is too small, in which case resizes instead.
     */
    final void treeifyBin(Node<K,V>[] tab, int hash) {
        int n, index; Node<K,V> e;
        if (tab == null || (n = tab.length) < MIN_TREEIFY_CAPACITY)
            resize();
        else if ((e = tab[index = (n - 1) & hash]) != null) {
            TreeNode<K,V> hd = null, tl = null;
            do {
                TreeNode<K,V> p = replacementTreeNode(e, null);
                if (tl == null)
                    hd = p;
                else {
                    p.prev = tl;
                    tl.next = p;
                }
                tl = p;
            } while ((e = e.next) != null);
            if ((tab[index] = hd) != null)
                hd.treeify(tab);
        }
    }
```
Node中链表长度大于8，就转成红黑树存储了，当然旧数据也会放到红黑树里面。
同时，最差速度到达了O(log(n))，快了！

##### 3.线程不安全，会出现循环链表导致线程死循环怎么办？

> 官方的回复是：线程安全请使用ConcurrentHashMap，HashMap本身就是线程不安全的。

但是虽然HashMap依然是线程不安全，但是1.8将不会出现死循环的情况了。原因如下：
* 1.7中扩容，复制数组使用的是头插法，原本1-2-3的链表会变成3-2-1，所以多线程下容易出现2-3和3-2的情况导致死循环，在查询一个不存在的key时，死循环没办法跳出导致**CPU100%**！！！
* 1.8的扩容中，使用的是尾插法，因此哪怕是多线程下，也不会出现死循环。

##### 4.解决了1.7中Hash攻击导致的CPU100%
参考：
https://www.cnblogs.com/stevenczp/p/7028071.html
https://blog.csdn.net/zly9923218/article/details/51656920
https://coolshell.cn/articles/6424.html

首先我们需要知道的是：
> Java的hash算法是“非随机的”，是固定的，而且是弱化的，容易相同！

比如：
*  Aa和BB这两个字符串的hash code(或hash key) 是一样的！
* 同理，我们就可以通过这两个种子生成更多的拥有同一个hash key的字符串：”AaAa”, “AaBB”, “BBAa”, “BBBB”，“AaAaBBBB”...
```java
System.out.println("AaAaAaAa".hashCode());
System.out.println("AaAaBBBB".hashCode());

-540425984
-540425984
```

> 相同的hash值意味着相同的index，那么在hashMap中就是会建立N长的链表
> 因此：JDK1.7中会有Hash Collision DoS的攻击，链表无限长，循环进行equal的时候损耗极大，以至于**CPU100%**！

**JDK1.8中针对Hash攻击做了处理！**

```java
public class Person implements Comparable<Person>{
    private String firstName;
    private String lastName;
    private UUID id;
    public Person(String firstName, String lastName, UUID id) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.id = id;
    }
    @Override
    public int hashCode() {
        return 5;
    }

    @Override
    public int compareTo(Person o) {
        return this.id.compareTo(o.id);
    }
    // ...
}

```

```java
@Test
    public void hashMap1_8() throws IllegalAccessException, NoSuchMethodException, InvocationTargetException {

        int LIMIT = 500_000;
            Person person = null;
            Map<Person, String> map = new HashMap<>();

            for (int i=0;i<LIMIT;i++) {
                UUID randomUUID = UUID.randomUUID();
                person = new Person("fn", "ln", randomUUID);
                map.put(person, "comment" + i);
            }
            long start = System.currentTimeMillis();
            map.get(person);
            long stop = System.currentTimeMillis();
            System.out.println(stop-start+" millis");
    }
```
> 上述代码在1.8的测试下，加了Comparable接口的情况下，get/set的速度得到了极大的提升！

> 但是如果不加Comparable接口，1.8下将会触发自己的对比判断，而这个判断是比较对象类型和hashcode，所以会降低速度，但是不会像JDK1.7那样导致链表过长而引起的CPU100%。

参考：https://blog.csdn.net/weixin_42340670/article/details/80673127

```java
if ((kc == null &&
  (kc = comparableClassFor(k)) == null) ||
   (dir = compareComparables(kc, k, pk)) == 0)
  dir = tieBreakOrder(k, pk);
```

总结如下：
JDK1.7 + 大量hash冲突的情况下：**导致CPU100%**
JDK1.8 + 大量hash冲突的情况下 + 实现Comparable接口：**get/set速度极快，500万下冲突数据都能在毫秒级别响应**
JDK1.8 + 大量hash冲突的情况下+ 不实现Comparable接口：**get/set速度很慢，因为冲突多会执行内部实现的对比代码，导致get/set速度降低，但是不会像JDK1.7那样导致链表过长而引起CPU100%。**
