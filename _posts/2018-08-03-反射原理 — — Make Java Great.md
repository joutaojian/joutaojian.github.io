---
title: '反射原理 — — Make Java Great'
layout: post
tags:
  - Java
  - 反射
category: 后台
---
最近复习反射想了解背后的原理，才发现这趟水远比我想象中的深，也才发现反射的伟大之处。**Reflect**实际上是个**Class对象**操控大师，后文会分析。

# 1.反射的介绍
Java在运行中(RunTime)：
* 获取任意类的方法和属性，并实例化出对象;
* 操作任意对象的方法和属性

实际上JDK第一个版本开始就已经支持注解了，共有3种方法实现反射。(目前常用第三种，因为其场景通用性更强，如jdbc中引入数据库驱动)
```java
//第一种：通过Object类的getClass方法
Class cla = foo.getClass();

//第二种：通过对象实例方法获取对象
Class cla = foo.class;

//第三种：通过Class.forName方式
Class cla = Class.forName("xx.xx.Foo");
```


# 2.什么技术在支撑着反射
本想直接分析反射的原理，实际上发现逻辑上不合理。换个角度想想，打算从java为什么是静态语言开始分析反射。

##### 结论1：Java是静态语言，编译时需要做类型检查。

参考：https://baike.baidu.com/item/%E5%8A%A8%E6%80%81%E8%AF%AD%E8%A8%80/797407?fr=aladdin

> 动态语言：类型检查是在运行时做的
>
> 静态语言：类型检查是在运行前判断（编译阶段）

```java
class A {
    public void doA() {
        System.out.println("Do A");
    }
}

class B extends A {
    public void doB() {
        System.out.println("Do B");
    }
}

((B)new A()).doB();
```
上述代码编译通过，但是运行是会报错的。
为了支持多态，Java是运行时才确认真正执行的对象类型

> Java需要支持运行时确认真正执行的对象类型，也叫“动态绑定”！

##### 结论2：继承，多态需要动态绑定。

参考：https://www.cnblogs.com/ygj0930/p/6554103.html
参考：https://www.cnblogs.com/Gaojiecai/p/4035077.html

注意的是，这里的动态绑定是指Java判断所引用对象的实际类型，根据其实际类型调用其相应的方法。
听起来有点虚，我解释下：
> 针对下列语句，怎么知道是老爸说话还是儿子说法呢？
```java
//继承或多态
public int exec(Father reference)  {
  reference.talk();
}
Father f = new Son();
Father f2 = new Father();
exec(f);
exec(f2);
```
上述情景，JVM如何知道是Father.taslk()还是Son.talk()?
* 所以在**编译时**，直接默认是老爸说话（编译时默认父类），就是默认Father.talk()以安全的编译通过。
* 但是在**运行时**，在当前线程栈中找到对象引用f的真正内存地址，地址指向堆，这个对象实例在堆中，对象实例中存放着Class信息，所以回去方法区找这个对象对应的Class对象，并在Class对象中找到里面的方法表，如果子类重写了父类的方法表，必定指向子类的方法代码块，这个就是动态绑定的概念。所以不管是多态还是继承，只要确保实际对象的方法调用是对的，java就不会调用错。
(JDK1.6及以下：Class对象在方法区，JDK1.6以上则在堆)
![image.png](https://upload-images.jianshu.io/upload_images/3796089-4094e3516891eeac.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
(红色线就是动态绑定的过程，黑色线是应用启动加载Class对象的过程)

> 继承，多态都需要**动态绑定**支持。
> 虽然Java是静态语言，但是为了支持面向对象的各种特性，特意加入的动态语言的特性。

##### 结论3：动态绑定需要用到方法区的Class对象，也叫RTTI。

> RTTI（run-time type information）指的是Java在运行时能够获得或判断某个对象的类型信息。

RTTI就是基于方法区的Class对象实现的，所谓的获得或判断某个对象的类型信息，就是来自于Class对象。
目前网上大多数的理解结论是错的，但是方向是对的，**RTTI机制会分为传统RTTI和反射两大类。**

> RTTI的核心不在于形式，两者的区别只在于如何去操作Class对象，应该从操作方式作为区分！

* 传统RTTI：继承，多态和强转，是依赖已经存在的对象实例获得其中的Class对象。
* 反射：除了可以根据已经存在的对象实例获得其中的Class对象，也可以直接根据名字去方法区直接找Class对象。

对比分析如下：
![image.png](https://upload-images.jianshu.io/upload_images/3796089-2e5286ea8faa2242.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

传统RTTI相比反射而言：
>传统RTTI必须要有对象实例。
> ↓
> 意味着必须有Class对象。
> ↓
> 意味着必须对该类有正确的引用。
> ↓
> 意味着编译期该类文件存在且编译通过。

> 以上种种，反射可以都不需要！(类文件不存在也行，要用的时候才会报错)

##### 结论4：RTTI机制支撑着反射

回过头来看反射的三种实现方式，统统都是需要Class对象支撑的，也就是RTTI机制。

> RTTI机制的引入为Java这种静态语言带来了动态语言的特性，在不改变整体设计的情况下，提升了代码抽象能力和灵活性。

一般不要认为Java的反射就是指java.lang.reflect，这个包提供的工具类和接口。其实Java的整个Class对象系统，包括所有类的始祖类Object类，基础类型以及每个对象都附带的Class对象，都是反射机制的一部分。Java最初在设计这个系统的时候就有很深的预谋，**反射可以调动着Java核心资源Class对象**。

## 反射的原理
参考：https://zhuanlan.zhihu.com/p/21423208

> 总结反射原理

* 当我们编写完一个Java项目之后，每个.java文件都会被编译成一个.class文件，这些文件承载了这个类的所有信息，包括父类、接口、构造函数、方法、属性等。
* 这些Class文件在程序运行时会被ClassLoader加载到虚拟机中，Java虚拟机就会在内存中自动产生一个Class对象。
* 我们通过new的形式创建对象实际上就是通过这些Class对象来创建，只是这个过程对于我们是不透明的而已。
* **反射的工作原理**就是借助Class.java、Constructor.java、Method.java、Field.java这四个类在程序运行时动态访问和修改任何类的行为和状态。