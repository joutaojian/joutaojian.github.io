---
layout: post
title:  JavaScript概述
date:   2016-11-15 17:34:00 +0800
categories: 前端技术
tag: JavaScript
---

* content
{:toc}


## 1.数据类型

* Number (不区分整数和浮点数)
* 字符串
* 布尔值
* null和undefined (空和未定义，未定义一般用于判定是否传参)



## 2.数据结构

* 数组 (例：`new Array(1, 2, 3)`)
* 对象 (K-V无序集合)
* Map (K-V集合，查找速度快，例：`new Map([['Michael', 95], ['Bob', 75], ['Tracy', 85]])`)
* Set (K-V集合)



## 3.函数



###3.1 常用函数



###3.2 高阶函数



## 4.对象



### 4.1 Date对象

* Date可以获取当前时间，但这个时间是本地操作系统的时间，并不准确
* JavaScript的月份范围用整数表示是0~11，0表示一月，1表示二月，就是这么坑



### 4.2 RegExp对象

* 正则表达式可以校检字符串(`new RegExp()`)、切分字符串(`split`)、字符串分组(`exec()`)



### 4.3 JSON对象 

* 序列化：JSON.stringify(Object)
* 反序列化：JSON.paese()



## 5.BOM



### 5.1 主流浏览器

* PC端：IE6~11、Chrome(V8内核)、Safari(Webkit内核)、Firefox(OdinMonkey内核)
* 移动端：Chrome(Webkit内核)、Safari(Webkit内核)



### 5.2 浏览器对象

* ​



## 6.DOM



## 7.框架



### 7.1 AJAX



### 7.2 jQuery