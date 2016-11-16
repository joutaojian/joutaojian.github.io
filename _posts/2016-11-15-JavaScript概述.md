---
layout: post
title:  JavaScript概述
date:   2016-11-15 17:34:00 +0800
categories: 前端技术
tag: JavaScript
---

* content
{:toc}
`该文章是对Js的概括性学习总结，会遗漏很多知识点没写上，这里仅作为自己的记忆定位`

Thank you ,[廖雪峰](http://www.liaoxuefeng.com/)



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

### 3.1 闭包

留坑

### 3.2 箭头函数

留坑

### 3.3 高阶函数

* map/reduce
* filter
* sort


## 4.对象

### 4.1 Date对象

* Date可以获取当前时间，但这个时间是本地操作系统的时间，并不准确
* JavaScript的月份范围用整数表示是0~11，0表示一月，1表示二月，就是这么坑



### 4.2 RegExp对象

* 正则表达式可以校检字符串(`new RegExp()`)、切分字符串(`split`)、字符串分组(`exec()`)



### 4.3 JSON对象 

* 序列化：`JSON.stringify(Object)`
* 反序列化：`JSON.paese()`



## 5.BOM

### 5.1 主流浏览器

* PC端：IE6~11、Chrome(V8内核)、Safari(Webkit内核)、Firefox(OdinMonkey内核)
* 移动端：Chrome(Webkit内核)、Safari(Webkit内核)



### 5.2 浏览器对象

* windows，不但充当全局作用域，也表示当前浏览器实际窗口
* navigator，表示浏览器信息
* screen，表示屏幕信息
* location，表示当前页面的URL信息
* document，表示当前页面，是DOM树的根节点


## 6.DOM

留坑

## 7.框架

### 7.1 AJAX

​        AJAX适用于执行异步网络请求，因为WEB的运作原理是一个http请求对应一个页面，所以在页面加载完毕之后，使用AJAX在后面自行加载数据。AJAX请求是异步执行的，因此必须要通过回调函数获得响应结果。目前写AJAX主要依靠`XMLHttpRequest`对象和`jQuery`。

* 以下是`JavaScript`的AJAX实例：

```javascript
function success(text) {
    var textarea = document.getElementById('test-ie-response-text');
    textarea.value = text;
}

function fail(code) {
    var textarea = document.getElementById('test-ie-response-text');
    textarea.value = 'Error code: ' + code;
}

var request = new ActiveXObject('Microsoft.XMLHTTP'); // 新建Microsoft.XMLHTTP对象

request.onreadystatechange = function () { // 状态发生变化时，函数被回调
    if (request.readyState === 4) { // 成功完成
        // 判断响应结果:
        if (request.status === 200) {
            // 成功，通过responseText拿到响应的文本:
            return success(request.responseText);
        } else {
            // 失败，根据响应码判断失败原因:
            return fail(request.status);
        }
    } else {
        // HTTP请求还在继续...
    }
}

// 发送请求:
request.open('GET', '/api/categories');
request.send();

alert('请求已发送，请等待响应...');
```

* 以下是`jQuery`的AJAX实例：

```javascript
var jqxhr = $.ajax('/api/categories', {
    dataType: 'json'
}).done(function (data) {
    ajaxLog('成功, 收到的数据: ' + JSON.stringify(data));
}).fail(function (xhr, status) {
    ajaxLog('失败: ' + xhr.status + ', 原因: ' + status);
}).always(function () {
    ajaxLog('请求完成: 无论成功或失败都会调用');
});

//或者直接获取JSON

var jqxhr = $.getJSON('/path/to/resource', {
    name: 'Bob Lee',
    check: 1
}).done(function (data) {
    // data已经被解析为JSON对象了
});
```

### 7.2 jQuery

​        目前jQuery有1.x和2.x两个主要版本，区别在于2.x移除了对古老的IE 6、7、8的支持，因此2.x的代码更精简，选择哪个版本主要取决于你是否想支持IE 6~8。jQuery统一了不同浏览器之间的DOM操作的差异.

* $符号 (jQuery把所有功能全部封装在一个全局变量jQuery，\$等同于jQuery)
* 选择器 (快速定位到一个或多个DOM节点)
  * 按ID查找 (`selected = $('#para-1');`)

  * 按Tag查找 (`selected = $('p')`)

  * 按Class查找 (`selected = $('.color-red');`)

  * 按属性查找 (`selected = $('[name=email]');`)
* 事件 (JavaScript以单线程模式运行，页面加载完毕之后只能通过事件调用JavaScript)
  * 鼠标事件
  ```javascript
  click: 鼠标单击时触发；
  dblclick：鼠标双击时触发；
  mouseenter：鼠标进入时触发；
  mouseleave：鼠标移出时触发；
  mousemove：鼠标在DOM内部移动时触发；
  hover：鼠标进入和退出时触发两个函数，相当于mouseenter加上mouseleave。
  ```
  ```javascript
  实例：
  a.click(function () {
    alert('Hello!');
  });
  ```

  * 键盘事件 (键盘事件仅作用在当前焦点的DOM上，通常是`<input>`和`<textarea>`)
  ```javascript
  keydown：键盘按下时触发；
  keyup：键盘松开时触发；
  keypress：按一次键后触发。
  ```

### 7.3 underscore

​        underscore则提供了一套完善的函数式编程的接口，让我们更方便地在JavaScript中实现函数式编程(如：箭头函数和高阶函数)，underscore会把自身绑定到唯一的全局变量`_`上，如：`_.map([1, 2, 3], (x) => x * x); `

