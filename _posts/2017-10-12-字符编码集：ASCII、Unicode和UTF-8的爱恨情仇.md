---
title: 字符编码集：ASCII、Unicode和UTF-8的爱恨情仇
layout: post
tags:
  - Java
  - Unicode
category: 后台
---
在学习字节流和字符流的时候，突然发现自己对字符集编码不是很了解，所以特意学习一发。

## 万物之宗：ASCII编码
> - 计算机内部以二进制位（bit）作为基础数据，所以就有0和1两种状态。
> - 八个二进制位（bit）为一个字节（byte），可以组合出256种状态，每一个状态对应一个符号共256个符号，从0000000到11111111。

因此在上个世纪60年代，美国制定了一套字符编码，对英语字符与二进制位之间的关系，做了统一规定。这被称为ASCII码，一直沿用至今。

ASCII码一共规定了128个字符的编码，比如空格"SPACE"是32（二进制00100000），大写的字母A是65（二进制01000001）。这128个符号（包括32个不能打印出来的控制符号），只占用了一个字节的后面7位，最前面的1位统一规定为0。

## 编码乱世：非ASCII编码
因为英语128个符号就可以了，但是其他国家是远远不够的，语言系统完全不一样。所以他们各自都很聪明，利用字节中闲置的最高位编入新的符号。比如，法语中的é的编码为130（二进制10000010）。这样一来，这些欧洲国家使用的编码体系，可以表示最多256个符号。

于是，编码乱世来临！


## 感谢
- [编码格式简介（ANSI、GBK、GB2312、UTF-8、GB18030和 UNICODE）](http://blog.csdn.net/ldanduo/article/details/8203532/ "编码格式简介（ANSI、GBK、GB2312、UTF-8、GB18030和 UNICODE）")
- [Java中的ASCII、Unicode和UTF-8字符编码集](http://blog.csdn.net/bluend1004/article/details/9225811 "Java中的ASCII、Unicode和UTF-8字符编码集")
- [阮一峰](http://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html "阮一峰")