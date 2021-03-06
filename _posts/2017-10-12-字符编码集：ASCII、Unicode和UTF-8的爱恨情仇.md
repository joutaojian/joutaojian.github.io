---
title: 'Java默认编码 — — Unicode'
layout: post
tags:
  - Java
  - Unicode
category: 后台
---
参考：https://blog.csdn.net/ant1993/article/details/53428087
* Java文件编译成Class文件，是由Java编译器处理的，windows上是javac.exe，生成的文件编码是Unicode编码。
* Class文件加载到JVM的时候，就是JVM读取Class文件的时候是以Unicode编码读取的。

> Java中默认的编码方式是Unicode ！

在学习字节流和字符流的时候，突然发现自己对字符集编码不是很了解，所以特意学习一发，总结ASCII，Unicode，UTF-8的对比。

## 开始：ASCII编码
> - 计算机内部以二进制位（bit）作为基础数据，所以就有0和1两种状态。
> - 八个二进制位（bit）为一个字节（byte），可以组合出256种状态，每一个状态对应一个符号共256个符号，从0000000到11111111。

因此在上个世纪60年代，美国制定了一套字符编码，对英语字符与二进制位之间的关系，做了统一规定。这被称为ASCII码，一直沿用至今。

ASCII码一共规定了128个字符的编码，比如空格"SPACE"是32（二进制00100000），大写的字母A是65（二进制01000001）。这128个符号（包括32个不能打印出来的控制符号），只占用了一个字节的后面7位，最前面的1位统一规定为0。

## 混乱：非ASCII编码
因为英语128个符号就可以了，但是其他国家是远远不够的，语言系统完全不一样。所以他们各自都很聪明，利用字节中闲置的最高位编入新的符号。比如，法语中的é的编码为130（二进制10000010）。这样一来，这些欧洲国家使用的编码体系，可以表示最多256个符号。

**编码很混乱**

各个国家自己扩展了自己语言系统的编码，于是全球出现无数种乱七八糟的编码。比如说下中国：

1. 等中国人们得到计算机时，已经没有可以利用的字节状态来表示汉字，况且有6000多个常用汉字需要保存呢。于是国人就自主研发出“GB2312″，GB2312 是对 ASCII 的中文扩展。
2. 但是中国的汉字太多了，后来还是不够用，于是扩展之后的编码方案被称为 GBK 标准，GBK 包括了 GB2312 的所有内容，同时又增加了近20000个新的汉字（包括繁体字）和符号。
3. 后来少数民族也要用电脑了，于是我们再扩展，又加了几千个新的少数民族的字，GBK 扩成了 GB18030。从此之后，中华民族的文化就可以在计算机时代中传承了。

## 统一：Unicode编码
> 1. 一个叫 ISO （国际标谁化组织）的国际组织决定着手解决这个问题。
> 2. 采用的方法很简单：废了所有的地区性编码方案，重新搞一个包括了地球上所有文化、所有字母和符号的编码！
> 3. 他们打算叫它”Universal Multiple-Octet Coded Character Set”，简称 UCS, 俗称 “UNICODE”。

但是呢，Unicode只是一个符号集，它只规定了符号的二进制代码，却没有规定这个二进制代码应该如何存储。所以实际上这个Unicode只是一个字符的协议文档，具体的实现是由各自实现的，所以衍生出UTF-8，UTF-16，UTF-32。
- UTF-8：就是它是一种变长的编码方式。它可以使用1~4个字节表示一个符号，根据不同的符号而变化字节长度。
- UTF-16：字符用两个字节或四个字节表示
- UTF-32：字符用四个字节表示

总结一下，他们的关系如图：
![image.png](https://upload-images.jianshu.io/upload_images/3796089-59712fa4370be50e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)



## 感谢
- [编码格式简介（ANSI、GBK、GB2312、UTF-8、GB18030和 UNICODE）](http://blog.csdn.net/ldanduo/article/details/8203532/ "编码格式简介（ANSI、GBK、GB2312、UTF-8、GB18030和 UNICODE）")
- [Java中的ASCII、Unicode和UTF-8字符编码集](http://blog.csdn.net/bluend1004/article/details/9225811 "Java中的ASCII、Unicode和UTF-8字符编码集")
- [阮一峰](http://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html "阮一峰")