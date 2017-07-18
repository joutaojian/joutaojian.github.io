---
layout: post
title:  Oracle Golden Gate学习笔记
date:   2017-03-18 20:05:00 +0800
categories: 后端技术
tag: 学习笔记
---

* content
{:toc}


## 1.简介

0.OGG家族主要包括：GoldenGate(核心产品)、GoldenGate Director(GUI图形界面)、 GoldenGate Veridate(两端数据比对和校检)

1.Oracle Golden Gate（OGG）是一种基于日志的结构化数据复制备份软件，它通过解析源数据库在线日志或归档日志获得数据的增量变化，再将这些变化应用到目标数据库，从而实现源数据库与目标数据库同步。

2.特点：实时数据复制、异构平台数据同步、事务一致性、检查点机制保障数据无丢失、可靠的数据传输机制。

3.应用：数据库升级/实时同步、均衡负载、容灾、支持异构平台数据交换

4.DML、DDL、DCL的区别：

DML(支持修改数据)：支持select、update、insert、delete

DDL(支持修改表结构)：支持create、alter、drop

DCL(支持修改用户权限和角色)：grant、revoke、deny

备注：在OGG中，oracle9i及以上支持DML和DDL


## 2.OGG主要组件

共有7大组件：(其中包括5大进程，2个概念)

Manager: OGG的控制进程，在源端和目标端上各运行一个，负责启动，监控，重启OGG的其他进程，报告错误，分配存储空间。

Extract: OGG的捕获进程，负责从源端数据表或日志中捕获数据。

（分两个阶段：1.初始化数据阶段：直接从源端数据表提取数据；2.同步变化捕获阶段：捕获源数据的变化，就是DML和DDL）

Data pump: 只负责将数据直接传输到目标端。

Collector: OGG自动维护的进程，无需用户配置，负责接收Extract发来的数据并写入队列（这个就叫做远程队列了）

Replicat: 负责将本地队列的数据增量转化为目标数据库所能识别的SQL语句

Trails/Extract files: 通过缓存到本地的trail文件和断点机制，保证系统的数据安全

checkpoints: 通过缓存到本地的trail文件和断点机制，保证系统的数据安全


## 3.技术&架构

1.OGG的技术架构：

![img](http://7xkmea.com1.z0.glb.clouddn.com/OGGOGG技术架构图.png)

2.技术解析：

OGG有两种传输方式：直接传输、文件传输

直接传输：Extract从redo buffer(日志缓冲区)中捕获日志传输到目标端，在源端不写入trail

文件传输：Extract把捕获的日志写入trail文件，再通过data pump传输到目标端，利用trail文件和checkpoints可以保证数据安全及备份恢复

1.Extract先把源端数据库的所有数据全部提取到目标端，用直接传输

2.同步成功后，当源端数据库发生变化，这个变化被数据库记录下来并放在日志缓冲区中，Manager控制Extract进程去捕获日志，并把该日志写入本地trail文件(也叫本地队列)，这时候可以开很多个data dump进程去把文件中数据发送到目标端。(这个只是指用文件传输方式，)

3.到了目标端，目标端的Collter进程将收到的数据放入到自己的队列中（相对来说，这个叫做远程trail文件/远程队列）

4.Replicat读取trail文件中的内容，将队列的数据增量转化为目标数据库所能识别的SQL语句(也就是DML,DDL)

3.OGG灵活的拓扑结构：

多样性的拓扑结构决定了OGG有多种应用场景！

![img](http://7xkmea.com1.z0.glb.clouddn.com/OGGOGG拓扑结构.png)