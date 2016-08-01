##1、特性

* 主要考虑的是构建`CRUD应用`
* 通过新的属性、标签和表达式扩展了 HTML。
* 可以构建一个单一页面应用程序（SPAs：Single Page Applications），不依赖后端。



##2、MVVM

对于Angular.js的设计模式，目前有三种说法：MVC、MV没VM、MVM，因为它的特点在于视图与模型的双向绑定，控制器里面初始化了数据模型，控制器允许我们建立模型和视图之间的数据绑定，所以更加倾向于MVVM模式。

![MVVM](http://joutaojian.github.io/public/2.png)



##3、指令

内置指令:

* ng-app，声明Angular作用域的开始
* ng-model，用一个变量名绑定HTML的标签
* ng-controller，声明控制器的作用域
* ng-bind，等同于{{}}，不过ng-bind会在HTML完全加载完之后显示数据
* ng-hide，隐藏模块
* ng-init，初始化数据
* ng-repeat，for循环

自定义指令：

利用`.directive`函数来添加自定义的指令，使用驼峰法来命名一个指令，在HTML中使用时runoobDirective要变成runoob-directive，restrict 值可以是以下几种:

* E 只限元素名使用：

```html
<runoob-directive></runoob-directive>
```

* A 只限属性使用：

```html
<div runoob-directive></div>
```

* C 只限类名使用：

```html
<div class="runoob-directive"></div>
```

* M 只限注释使用：

```html
<!-- 指令: runoob-directive -->
```


## 4、Service

在 AngularJS 中，服务是一个函数或对象，可以直接使用，AngularJS 内建了30 多个服务。

* $location 服务 

```js
var app = angular.module('myApp', []);
app.controller('customersCtrl', function($scope, $location) {
    $scope.myUrl = $location.absUrl();
});
```

* $http 服务

```js
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $http) {
    $http.get("welcome.htm").then(function (response) {
        $scope.myWelcome = response.data;
    });
});
```

* $timeout 服务

```js
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $timeout) {
    $scope.myHeader = "Hello World!";
    $timeout(function () {
        $scope.myHeader = "How are you today?";
    }, 2000);
});
```

* $interval 服务

```js
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope, $interval) {
    $scope.theTime = new Date().toLocaleTimeString();
    $interval(function () {
        $scope.theTime = new Date().toLocaleTimeString();
    }, 1000);
});
```

* 自定义服务

```js
app.service('hexafy', function() {
    this.myFunc = function (x) {
        return x.toString(16);
    }
});
app.controller('myCtrl', function($scope, hexafy) {
    $scope.hex = hexafy.myFunc(255);
});
```



##5、API

AngularJS 全局 API 用于执行常见任务的 JavaScript 函数集合。

![MVVM](http://joutaojian.github.io/public/3.jpg)

```js
<div ng-app="myApp" ng-controller="myCtrl">
<p>{{ x1 }}</p>
<p>{{ x2 }}</p>
</div>

<script>
var app = angular.module('myApp', []);
app.controller('myCtrl', function($scope) {
$scope.x1 = "JOHN";
$scope.x2 = angular.lowercase($scope.x1);
});
</script>
```



##6、路由

* 通过 AngularJS 可以实现多视图的单页Web应用，但在单页Web应用中 AngularJS 通过 ”#“标记 实现
* 因为 # 号之后的内容在向服务端(后端)请求时会被浏览器忽略掉， 所以我们就需要自己在前端实现 # 号后面内容的功能实现

![MVVM](http://joutaojian.github.io/public/4.png)

```js
angular.module('routingDemoApp',['ngRoute']).config(['$routeProvider',function($routeProvider){
                $routeProvider
                .when('/',{template:'这是首页页面'})
                .when('/computers',{template:'这是电脑分类页面'})
                .when('/printers',{template:'这是打印机页面'})
                .otherwise({redirectTo:'/'});
                
}]);
```



##7、依赖注入

##8、模块、过滤器、输入验证、动画