> 不要再写出小学生一样的代码了！
## 判断
1、判空操作
```java
反例：
if(null == o){...}

正例：
if(Objects.isNull(o)){...}
```

2、判断集合为空
```
反例：
if (collection.size() == 0) {...}

正例：
if (collection.isEmpty()) {...}
```

3、判断是否为数字
```
反例：
无

正例：
if (NumberUtils.isCreatable(intValue)) {...}
```

4、获取随机数
```
反例：
无

正例：
//获取随机6位数的数字+字母
String verifyCode = RandomStringUtils.randomAlphanumeric(6);
```

##集合
1、guava创建集合
```java
反例：
List l = new ArrayList();

正例：
List l = Lists.newArrayList();
```

2、不可变集合(更安全)
