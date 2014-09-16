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

####``element``属性
####``events``属性
####``init``属性
####``attrs``属性
####``attrs.template``属性
####``attrs.parentNode``属性

###parseElement ``obj.parseElement()``

根据配置信息，构建好``this.element``

###delegateEvents ``obj.delegateEvents(eventsObj)``

添加事件代理，将所有事件都代理到``this.element``对象上

###undelegateEvents ``obj.undelegateEvents([eventName])``

卸载事件代理，不带参数时，表示卸载所有事件

###render ``obj.render()``

将``this.element``渲染到页面上，子类如果覆盖此方法，请使用``return this``来保持该方法的链式约定

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
