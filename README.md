#Widget

Widget 是使用 Base 创建的 UI 组件的基础类，约定了组件的基本生命周期，默认带有 Class，Events，Base 模块的功能。

##使用

下载项目中 dist 目录里面的文件，并配置好模块相关信息（如：路径，别名），使用如下示例代码即可开始使用。

```
seajs.use(['widget'], function(Widget){
    var WidgetA = Widget.extend({
        attrs : {
            a : 1
        },
        method : function(){
            console.log(this.get('a'));
        }
    });
    
    var widget = new WidgetA({
        a : 2
    }).render();
    widget.method(); // 2    
});

require(['widget'], function(Widget){
    var WidgetA = Widget.extend({
        attrs : {
            a : 1
        },
        method : function(){
            console.log(this.get('a'));
        }
    });
    
    var widget = new WidgetA({
        a : 2
    }).render();
    widget.method(); // 2    
});
```

##使用说明

###``Widget.extend([properties])``

基于 Widget 派生子类，``properties``是要混入的实例属性集合。

```
var Widget = require('widget');

var WidgetA = Widget.extend({
    attrs : {
        a : 1
    },
    method : function(){
        console.log(this.get('a'));
    }
});

var widget = new WidgetA({
    a : 2
}).render();
widget.method(); // 2
```

###``properties``集合中特殊属性

####``element``属性，widget 实例对应的 DOM 节点，是一个 jQuery / Zepto 对象，每个 widget 只有一个 element

该属性不挂载在 attrs 属性集合中，而是直接挂载在实例上。

```
$('<div id="test"></div>').appendTo(document.body);

var WidgetA = Widget.extend({
    element : '#test'
});

var widgetA = new WidgetA();
console.log(widgetA.element); // jQuery DOM: #test

var WidgetB = Widget.extend({});
var widgetB = new WidgetB();
console.log(widgetB.element); // jQuery DOM: div，类定义和实例都不传入 element, 就用 template 生成 element
```

####``events``属性，声明``this.element``需要代理的事件，是一个 key/value 的对象

该属性不挂载在 attrs 属性集合中，而是直接挂载在实例上。

``events``中每一项的格式是：``"eventType selector" : "callback"``，当省略``selector``时，默认会将事件绑定到``this.element``上，``callback``可以是字符串，表示当前实例上的方法名，也可以直接传入函数。

```
$('<div id="test"><p></p><span></span></div>').appendTo(document.body);

var WidgetA = Widget.extend({
    element : '#test',
    events : {
        'click p' : 'fn'
        'click span' : function(){
            console.log('span');
        }
    },
    fn : function(){
        console.log('p');
    }
});

var widgetA = new WidgetA();
widgetA.$('p').trigger('click'); // p
widgetA.$('span').trigger('click'); // span
```

####``init``属性，提供给子类的初始化方法，可以在此处理更多用户自定义的初始化信息

```
var Demo = Widget.exnted({
    init : function(){
        console.log('init');
    }
});

new Demo(); // init
```

####``attrs``属性，类定义时，通过设置 attrs 来定义该类有哪些属性

```
var Demo = Widget.extend({
    attrs : {
        value1 : 1,
        value2 : 'a',
        value3 : true,
        value4 : /a/g,
        value5 : [a,b,c],
        value6 : {a : 'a'},
        value7 : function(){},
        value8 : null
    }
});
```

####``attrs.template``属性，使用模板生成``this.element``

该属性默认值是``<div></div>``。

如若类定义和实例化都没有传入``element``属性，那么就用``template``生成``element``，生成方式是将 html 模板直接转换成 jQuery 对象。

```
var WidgetA = Widget.extend({
    attrs : {
        template : '<div><p><p><div>'
    } 
});

var widgetA = new WidgetA();
console.log(widgetA.$('p').length === 1); // true
```

####``attrs.parentNode``属性

该属性默认值是``document.body``。

该属性的值只能是 jQuery / Zepto / DOM 对象。

详情参考下面的``render``方法使用说明。

###delegateEvents ``obj.delegateEvents(eventsObj)``

添加事件代理，将所有事件都代理到``this.element``对象上

```
var spy1 = false, spy2 = false;
var widget = new Widget({
    template: '<div><p></p><ul><li></li></ul><span></span></div>'
}).render();

widget.delegateEvents({
    'click p' : function(){
        spy1 = true;
    },
    'mouseenter' : function(){
        syp2 = true;
    }
});

widget.$('p').trigger('click');
widget.element.trigger('mouseenter');

console.log(spy1 === true); // true
console.log(spy2 === true); // true
```

###undelegateEvents ``obj.undelegateEvents([eventName])``

卸载事件代理，不带参数时，表示卸载所有事件

```
var spy1 = false, spy2 = false;
var widget = new Widget({
    template: '<div><p></p><ul><li></li></ul><span></span></div>'
}).render();

widget.delegateEvents({
    'click p' : function(){
        spy1 = true;
    },
    'mouseenter' : function(){
        syp2 = true;
    }
});

widget.$('p').trigger('click');
widget.element.trigger('mouseenter');

console.log(spy1 === true); // true
console.log(spy2 === true); // true

spy1 = false;
spy2 = false;

widget.undelegateEvents('click p');
widget.$('p').trigger('click');
console.log(spy1 === false); // true

widget.undelegateEvents();
widget.element.trigger('mouseenter');
console.log(spy2 === false); // true
```

###render ``obj.render()``

将``this.element``渲染到页面上，子类如果覆盖此方法，请使用``return this``来保持该方法的链式约定

render 具体实现是获得``attrs.parentNode``的值，然后把``this.element``属性 appendTo 到该值里

```
var WidgetA = Widget.extend({
    attrs : {
        template : '<div id="widget-test"></div>'
    }
});

var widgetA = new WidgetA();

console.log($('#widget-test').length === 0); // true
widgetA.render();
console.log($('#widget-test').length === 1); // true

var WdigetB = Widget.extend({
    attrs : {
        template : '<div id="widget-test"></div>'
    },
    render : function(){
        WidgetB.superclass.render.call(this); // 子类覆盖父类 render 方法，一定要记得调用父类的 render 方法，除非重新实现了父类的 render 方法
        
        console.log('override parent render method test');
        
        return this; // 保持链式调用
    }
});

var widgetB = new WidgetB();
console.log($('#widget-test').length === 0); // true
widgetB.render(); // override parent render method test
console.log($('#widget-test').length === 1); // true
```

###$ ``obj.$(selector)``

在``this.element``内查找匹配的节点

```
var div = $('<div id="test2"><p></p></div>').appendTo(document.body);

var WidgetA = Widget.extend({
    attrs : {
        a : 1
    },
    element : '#test2',
    events : {
        'click' : 'open',
        'click .close' : 'close'
    },
    open : function(){},
    close : function(){}
});

var widgetA = new WidgetA({
    a : 2
});

console.log(widgetA.$('p')[0].tagName === 'P'); // true
```

###destroy ``obj.destroy()``

销毁实例，将实例对应的 element 和事件都销毁

```
var WidgetA = Widget.extend({
    attrs : {
        a : 1
    },
    events : {
        'click' : 'open',
        'click .close' : 'close'
    },
    open : function(){
        console.log(this.get('a'));
    },
    close : function(){}
});

var widgetA = new WidgetA({
    a : 2
});

console.log(widgetA.element); // jQuery DOM instance
widgetA.destroy();
console.log(widgetA.element); // null

```

###query ``Widget.query(selector)``

查询与 selector 配置的第一个 DOM 节点，得到与该 DOM 节点相关联的 Widget 实例

```
var WidgetA = Widget.extend({
    attrs : {
        a : 1
    },
    element : '#test',
    events : {
        'click' : 'open',
        'click .close' : 'close'
    },
    open : function(){
    },
    close : function(){
    }
});

var widgetA = new WidgetA({
    a : 2
});

console.log(Widget.query('#test') === widgetA); // true
```

###在 DOM 的属性上设置代理的事件

在 DOM 上添加一个`on-[eventType]`属性，值是一个或多个空格分隔的实例上的方法名称。

在 widget 初始化实例时，可以直接从 DOM 的属性上解析出需要代理的事件，所有的事件都将代理到``this.element``上。

目前支持``click``，``dblclick``，``blur``，``focus``，``mouseover``，``mouseenter``，``mouseout``事件类型。

```
var spy1 = false, spy2 = false, spy3 = false;

var WidgetA = Widget.extend({
    fn1 : function(){
        spy1 = true;
    },
    fn2 : function(){
        spy2 = true;
    },
    fn3 : function(){
        syp3 = true;
    }
});

var widgetA = new WidgetA({
    template : '<div id="test"><p on-click="fn1"></p><ul><li on-click="fn2"></li></ul><span on-mouseenter="fn3"></span></div>'
}).render();

widgetA.$('p').trigger('click');
console.log(spy1 === true); // true

widgetA.$('li').trigger('click');
console.log(spy2 === true); // true

widgetA.$('span').trigger('mouseenter');
console.log(spy3 === true); // true
```
