> 目前开发的平台使用单体MySQL数据库，数据量激增后陆陆续续遇到了一些问题，此处做下总结。

单体数据库会遇到以下几个问题：
  1、需要定时备份数据并上传到云存储，防黑客攻击和删库；
  2、需要有个备份数据库，数据库挂了或者不见了需要马上顶上；
  3、读的次数远大于写的时候，写锁和读锁的争用导致性能下降，单个物理机的并发压力大；
  4、单体数据表太大索引性能下降，就需要把表拆分；
  5、单库中表数量太多整体降低性能，就需要按业务分成多个库。

上面特意说复杂了，解决办法归纳一下就是几个点：
1、冷备份(定时全量/增量备份)
2、热备份(在主从架构上实现)
3、主从架构(N主M从)
4、读写分离(在主从架构上实现)
5、数据分片(分库分表)

## 冷备份
> 参考文章：https://blog.csdn.net/zone_/article/details/81293131
分三个步骤：
1、每周全量备份输出sql文件，并压缩；
2、每天增量备份输出bin-log文件（需要更改数据库配置并重启生效）；
3、备份完就调用脚本上传到七牛云。

全量备份：
```bash
#!/bin/bash
#在使用之前，请提前创建以下各个目录
#获取当前时间
date_now=$(date "+%Y%m%d-%H%M%S")
backUpFolder=/home/db/backup/mysql
username="root"
password="xtionai"
db_name="zone"
#定义备份文件名
fileName="${db_name}_${date_now}.sql"
echo "${fileName}"
#定义备份文件目录
backUpFileName="${backUpFolder}/${fileName}"
echo "starting backup mysql ${db_name} at ${date_now}."
#进入到备份文件目录
cd ${backUpFolder}
/usr/bin/mysqldump -u${username} -p${password}  --lock-all-tables --flush-logs ${db_name} > ${backUpFileName}
#压缩备份文件
tar zcvf ${fileName}.tar.gz ${fileName} --remove-files

# use nodejs to upload backup file other place
#NODE_ENV=$backUpFolder@$backUpFileName node /home/tasks/upload.js
date_end=$(date "+%Y%m%d-%H%M%S")
echo "finish backup mysql database ${db_name} at ${date_end}."

# 使用 python 上传备份文件到 私有云
python /home/ubuntu/aiplat/upload.py $backUpFolder/ ${fileName}.tar.gz
```

增量备份，这里还是需要开启mysql的bin-log功能的，看参考文献：
```bash
backupDir=/home/db/backup/mysql-daily
#增量备份时复制mysql-bin.00000*的目标目录，提前手动创建这个目录
mysqlDir=/var/lib/mysql
#mysql的数据目录
logFile=/home/ubuntu/aiplat/increment.log
BinFile=/var/lib/mysql/mysql-bin.index
#mysql的index文件路径，放在数据目录下的

mysqladmin -uroot -pxtionai flush-logs
#这个是用于产生新的mysql-bin.00000*文件
# wc -l 统计行数
# awk 简单来说awk就是把文件逐行的读入，以空格为默认分隔符将每行切片，切开的部分再进行各种分析处理。
Counter=`wc -l $BinFile |awk '{print $1}'`
NextNum=0
#这个for循环用于比对$Counter,$NextNum这两个值来确定文件是不是存在或最新的
for file in `cat $BinFile`
do
   base=`basename $file`
   echo $base
   #basename用于截取mysql-bin.00000*文件名，去掉./mysql-bin.000005前面的./
   NextNum=`expr $NextNum + 1`
   if [ $NextNum -eq $Counter ]
   then
       echo $base skip! >> $logFile
   else
       dest=$backupDir/$base
       if(test -e $dest)
       #test -e用于检测目标文件是否存在，存在就写exist!到$logFile去
       then
           echo $base exist! >> $logFile
       else
           cp $mysqlDir/$base $backupDir
           echo $base copying >> $logFile
           # 使用 python 上传备份文件到 私有云
	   echo $backupDir/$base >> $logFile
           python /home/ubuntu/aiplat/upload.py $backupDir/ $base
        fi
    fi
done
echo `date +"%Y年%m月%d日 %H:%M:%S"` $Next Bakup succ! >> $logFile
#执行上传备份文件到七牛云
#NODE_ENV=$backUpFolder@$backUpFileName /root/node/v8.11.3/bin/node /usr/local/upload.js
# 使用 python 上传备份文件到 私有云
#python /home/ubuntu/aiplat/upload.py $backupDir $backUpFileName
```

上传脚本，python写的，版本随意：
```python
from qiniu import Auth, put_file, etag
import sys
print('参数个数为:', len(sys.argv), '个参数。')
print('参数列表:', str(sys.argv))

# backUpFolder
backUpFolder = sys.argv[1]
# backUpFileName
backUpFileName = sys.argv[2]
import qiniu.config

# 需要填写你的 Access Key 和 Secret Key
access_key = 'xxx'
secret_key = 'xxx'
# 构建鉴权对象
q = Auth(access_key, secret_key)
# 要上传的空间
bucket_name = 'aiimage'
# 上传到七牛后保存的文件名
key = backUpFileName
# 生成上传 Token，可以指定过期时间等
token = q.upload_token(bucket_name, key, 3600)
# 要上传文件的本地路径
localfile = backUpFolder + backUpFileName
ret, info = put_file(token, key, localfile)
print(info)
assert ret['key'] == key
assert ret['hash'] == etag(localfile)
```
最后设置crontab 定时任务，输入命令```crontab -e```设置下面的就好了：
```bash
0 0 * * 0 sudo sh /home/dbbackup/all.sh >/home/dbbackup/cron.log
0 0 * * * sudo sh /home/dbbackup/increment.sh >/home/dbbackup/cron.log
```

## 主从架构
> 参考文章：https://blog.csdn.net/qq_22152261/article/details/80374990
分三个步骤：
1、主从都开启bin-log
2、主设置帐号权限组给从用(记得指定IP)
3、从设置主的信息并启动slave模式

主设置的命令：
```sql
GRANT REPLICATION SLAVE ON *.* TO 'user'@'X.X.X.X' IDENTIFIED BY 'password';
```
从设置的命令：
```sql
change master to master_host='x.x.x.x', master_user='root', master_password='123456', master_log_file='mysql-bin.000003',master_log_pos=669835806,master_port=3307; start slave; 
```
命令中的``` master_log```取决于主执行命令```show master status;```出来的数据。

自己去主库测试下，新建个数据库就可以了，从库也会跟着建。

## 热备份
在一主多从的架构之下，理论上主宕机之后，必须马上选举一个从来充当主的角色，而这种行为叫做```热备```。
而这个切换的过程分为手动和自动，但是都没办法避免一个问题：```第三方工具可以推举出新的主，但是没办法通知应用层```。

> 目前是一般手动更新主库，也手动更新应用层的数据库配置。

## 读写分离
> 在一主多从的架构之下，读写分离成为可能，主为写库，从为读库。
>使用SpringBoot + Sharding-jdbc实现读写分离，分为三步：
1、设置好主从库；
2、引入maven包；
3、写好yaml配置文件

一般推荐用docker+mysql做主从库，方便！参考文章：https://www.cnblogs.com/sweetchildomine/p/7814692.html

我的docker启动命令：
```bash
#slave0 是从库
docker run -d -e MYSQL_ROOT_PASSWORD=123456  -v /home/mysql/cnf/s0.cnf:/etc/mysql/my.cnf -v /home/mysql/slave0_data:/var/lib/mysql -p 3308:3306 mysql:5.7

#master是主库
docker run -d -e MYSQL_ROOT_PASSWORD=123456  -v /home/mysql/cnf/m.cnf:/etc/mysql/my.cnf -v /home/mysql/master_data:/var/lib/mysql -p 3307:3306 mysql:5.7
```
```我的my.cnf文件内容，主从库一模一样，除了serverid不能一样！```
```md
# Copyright (c) 2014, Oracle and/or its affiliates. All rights reserved.
#
# This program is free software; you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation; version 2 of the License.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301 USA

#
# The MySQL Community Server configuration file.
#
# For explanations see
# http://dev.mysql.com/doc/mysql/en/server-system-variables.html

[client]
port        = 3306
socket      = /var/run/mysqld/mysqld.sock

[mysqld_safe]
pid-file    = /var/run/mysqld/mysqld.pid
socket      = /var/run/mysqld/mysqld.sock
nice        = 0

[mysqld]
user        = mysql
pid-file    = /var/run/mysqld/mysqld.pid
socket      = /var/run/mysqld/mysqld.sock
port        = 3306
basedir     = /usr
datadir     = /var/lib/mysql
tmpdir      = /tmp
lc-messages-dir = /usr/share/mysql
explicit_defaults_for_timestamp

log-bin = mysql-bin 
server-id = 10001 

# Instead of skip-networking the default is now to listen only on
# localhost which is more compatible and is not less secure.
#bind-address   = 127.0.0.1

#log-error  = /var/log/mysql/error.log

# Recommended in standard MySQL setup
sql_mode=NO_ENGINE_SUBSTITUTION,STRICT_TRANS_TABLES

# Disabling symbolic-links is recommended to prevent assorted security risks
symbolic-links=0

# * IMPORTANT: Additional settings that can override those from this file!
#   The files must end with '.cnf', otherwise they'll be ignored.
#
!includedir /etc/mysql/conf.d/
```
引入maven包：
> HikariCP连接池是必须的，所以我们需要剔除掉默认的tomcat-jdbc连接池。
```xml
        <dependency>
			<groupId>org.mybatis.spring.boot</groupId>
			<artifactId>mybatis-spring-boot-starter</artifactId>
			<version>1.3.1</version>
			<exclusions>
				<exclusion>
					<groupId>org.apache.tomcat</groupId>
					<artifactId>tomcat-jdbc</artifactId>
				</exclusion>
			</exclusions>
		</dependency>
		<dependency>
			<groupId>io.shardingsphere</groupId>
			<artifactId>sharding-jdbc-spring-boot-starter</artifactId>
			<version>3.0.0</version>
		</dependency>
		<dependency>
			<groupId>com.zaxxer</groupId>
			<artifactId>HikariCP</artifactId>
		</dependency>
```


后面就是写yml配置了：
> 具体配置的解释看官网：http://shardingsphere.io/document/current/cn/overview/
```yaml
sharding:
  jdbc:
    datasource:
      names: master,slave0
      master:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.jdbc.Driver
        jdbcUrl: jdbc:mysql://127.0.0.1:3307/aiplattest?useUnicode=true&characterEncoding=utf-8&useSSL=false
        username: root
        password: 123456
      slave0:
        type: com.zaxxer.hikari.HikariDataSource
        driver-class-name: com.mysql.jdbc.Driver
        jdbcUrl: jdbc:mysql://127.0.0.1:3308/aiplattest?useUnicode=true&characterEncoding=utf-8&useSSL=false
        username: root
        password: 123456
    config:
      masterslave:
        load-balance-algorithm-type: round_robin
        name: ds_ms
        master-data-source-name: master
        slave-data-source-names:
          - slave0
        props:
          sql:
            show: true
```

## 数据分片
> 数据分片：指的是 垂直分库 和 水平分表。

目前主流分库分表框架是sharding-jdbc和mycat，核心就是开发者不需要管分了多少个库，多少个表，对于开发只有多个库单个表，就是物理上的库和逻辑上的表。
比如：订单库的order表分成order_01,order_02,order_03,我们用的时候直接就是用order表就好了，剩下的由框架去组合，当然这个也是要配置的，参考官网配置[http://shardingsphere.io/document/current/cn/overview/](http://shardingsphere.io/document/current/cn/overview/)
。
```yaml
dataSources: #数据源配置，可配置多个data_source_name
  <data_source_name>: #<!!数据库连接池实现类> `!!`表示实例化该类
    driverClassName: #数据库驱动类名
    url: #数据库url连接
    username: #数据库用户名
    password: #数据库密码
    # ... 数据库连接池的其它属性

shardingRule:
  tables: #数据分片规则配置，可配置多个logic_table_name
    <logic_table_name>: #逻辑表名称
      actualDataNodes: #由数据源名 + 表名组成，以小数点分隔。多个表以逗号分隔，支持inline表达式。缺省表示使用已知数据源与逻辑表名称生成数据节点。用于广播表（即每个库中都需要一个同样的表用于关联查询，多为字典表）或只分库不分表且所有库的表结构完全一致的情况
        
      databaseStrategy: #分库策略，缺省表示使用默认分库策略，以下的分片策略只能选其一
        standard: #用于单分片键的标准分片场景
          shardingColumn: #分片列名称
          preciseAlgorithmClassName: #精确分片算法类名称，用于=和IN。。该类需实现PreciseShardingAlgorithm接口并提供无参数的构造器
          rangeAlgorithmClassName: #范围分片算法类名称，用于BETWEEN，可选。。该类需实现RangeShardingAlgorithm接口并提供无参数的构造器
        complex: #用于多分片键的复合分片场景
          shardingColumns: #分片列名称，多个列以逗号分隔
          algorithmClassName: #复合分片算法类名称。该类需实现ComplexKeysShardingAlgorithm接口并提供无参数的构造器
        inline: #行表达式分片策略
          shardingColumn: #分片列名称
          algorithmInlineExpression: #分片算法行表达式，需符合groovy语法
        hint: #Hint分片策略
          algorithmClassName: #Hint分片算法类名称。该类需实现HintShardingAlgorithm接口并提供无参数的构造器
        none: #不分片
      tableStrategy: #分表策略，同分库策略
        
      keyGeneratorColumnName: #自增列名称，缺省表示不使用自增主键生成器
      keyGeneratorClassName: #自增列值生成器类名称。该类需实现KeyGenerator接口并提供无参数的构造器
        
      logicIndex: #逻辑索引名称，对于分表的Oracle/PostgreSQL数据库中DROP INDEX XXX语句，需要通过配置逻辑索引名称定位所执行SQL的真实分表
  bindingTables: #绑定表规则列表
  - <logic_table_name1, logic_table_name2, ...> 
  - <logic_table_name3, logic_table_name4, ...>
  - <logic_table_name_x, logic_table_name_y, ...>
  
  defaultDataSourceName: #未配置分片规则的表将通过默认数据源定位  
  defaultDatabaseStrategy: #默认数据库分片策略，同分库策略
  defaultTableStrategy: #默认表分片策略，同分库策略
  defaultKeyGeneratorClassName: #默认自增列值生成器类名称，缺省使用io.shardingsphere.core.keygen.DefaultKeyGenerator。该类需实现KeyGenerator接口并提供无参数的构造器
  
  masterSlaveRules: #读写分离规则，详见读写分离部分
    <data_source_name>: #数据源名称，需要与真实数据源匹配，可配置多个data_source_name
      masterDataSourceName: #详见读写分离部分
      slaveDataSourceNames: #详见读写分离部分
      loadBalanceAlgorithmClassName: #详见读写分离部分
      loadBalanceAlgorithmType: #详见读写分离部分
      configMap: #用户自定义配置
          key1: value1
          key2: value2
          keyx: valuex
  
  props: #属性配置
    sql.show: #是否开启SQL显示，默认值: false
    executor.size: #工作线程数量，默认值: CPU核数
    
  configMap: #用户自定义配置
    key1: value1
    key2: value2
    keyx: valuex
```
