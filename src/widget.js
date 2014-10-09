'use strict'

// Thanks to:
//     - http://documentcloud.github.io/backbone/#View
//     - https://github.com/aralejs/widget/blob/master/src/widget.js

var Base, Widget, cidCounter, cachedInstances, eventType;

Base = require('base');

cidCounter = 0;
cachedInstances = {};
eventType = ['click', 'dblclick', 'blur', 'focus', 'mouseover', 'mouseenter', 'mouseout'];

Widget = Base.extend({
    attrs : {
        style : null,
        className : '',
        template : '<div></div>',
        parentNode : document.body
    },
    events : null,
    element : null,
    specialProps : ['element', 'events'],
    initialize : function(opt){
        Widget.superclass.initialize.call(this, opt);

        this.cid = uniqueCid();
        parseElement(this);
        this.delegateEvents();
        delegateEventsForAttr(this);
        stamp(this);
        this.init && this.init();
    },
    delegateEvents : function(events){
        var key, method, ev;

        if(!(events || (events = this.events))){
            return this;
        }

        for(key in events){
            if(!events.hasOwnProperty(key)){
                continue;
            }

            method = events[key];

            if(!method){
                continue;
            }

            if(!isFunction(method)){
                method = this[events[key]];
            }

            ev = parseEventName(this, key);

            (function(handler, widget){
                function cb(args){
                    handler.call(widget, args);
                };

                if(ev.selector){
                    widget.element.on(ev.type, ev.selector, cb);
                }else{
                    widget.element.on(ev.type, cb);
                }
            })(method, this);
        }

        return this;
    },
    undelegateEvents : function(eventName){
        var ev = parseEventName(this, eventName || '');

        if(ev.selector){
            this.element.off(ev.type, ev.selector);
        }else{
            this.element.off(ev.type);
        }

        return this;
    },
    render : function(){
        var parentNode = this.get('parentNode');

        if(!this.rendered){
            renderAndBindAttrs(this);
            this.rendered = true;
        }

        if(parentNode && !$.contains(document.documentElement, this.element[0])){
            this.element.appendTo(parentNode);
        }

        return this;
    },
    $ : function(selector){
        return this.element.find(selector);
    },
    destroy : function(){
        this.undelegateEvents();
        delete cachedInstances[this.cid];
        this.element.off();
        this.element.remove();
        this.element = null;
        Widget.superclass.destroy.call(this);
    },
    _onRenderClassName : function(val){
        this.element.addClass(val);
    },
    _onRenderStyle : function(val){
        this.element.css(val);
    }
});

$(window).unload(function(){
    for(var key in cachedInstances){
        if(cachedInstances.hasOwnProperty(key)){
            cachedInstances[key].destroy();
        }
    }
});

Widget.query = function(selector){
    var element, cid;

    element = $(selector).eq(0);
    element && (cid = element.data('widgetId'));
    return cachedInstances[cid];
};

function uniqueCid(){
    return 'widget-' + cidCounter++;
};

function stamp(ctx){
    var cid = ctx.cid;

    ctx.element.data('widgetId', cid);
    cachedInstances[cid] = ctx;
};

function parseElement(ctx){
    var element = ctx.get('element');

    ctx.element = element ? $(element) : $(ctx.get('template'));

    if(!ctx.element || !ctx.element[0]){
        throw new Error('element is invalid');
    }
};

function renderAndBindAttrs(ctx){
    var attrs, attr, method, val;

    attrs = ctx.attrs;

    for(attr in attrs){
        if(!attrs.hasOwnProperty(attr)){
            continue;
        }

        method = '_onRender' + capitalize(attr);

        if(ctx[method]){
            val = ctx.get(attr);

            if(!isEmptyAttrValue(val)){
                ctx[method](val, undefined, attr);
            }

            (function(method){
                ctx.on('change:' + attr, function(val, prev, key){
                    ctx[method](val, prev, key);
                });
            })(method);
        }
    }
};

function parseEventName(ctx, eventName){
    var selector, match;

    if(match = eventName.match(/^(\S+)\s*(.*)$/)){
        selector = match[2];
        eventName = match[1];
    }

    return {
        selector : selector || undefined,
        type : (eventName || '') + '.delegateEvents' + ctx.cid
    };
};

function delegateEventsForAttr(ctx){
    var index, len, element, ns;

    element = ctx.element;
    len = eventType.length;
    ns = '.delegateEvents' + ctx.cid;

    for(index = 0; index < len; index++){
        (function(type){
            var attr, callbacks, i, l;

            attr =  'on-' + type;
            element.on(type + ns, '[' + attr + ']', function(){
                callbacks = $(this).attr(attr).split(' ');

                for(i = 0, l = callbacks.length; i < l; i++){
                    ctx[callbacks[i]] && ctx[callbacks[i]].apply(ctx, arguments);
                }
            });
        })(eventType[index]);
    }
};

function isFunction(val){
    return Object.prototype.toString.call(val) === '[object Function]';
};

function capitalize(val){
    return val.charAt(0).toUpperCase() + val.slice(1);
};

function isEmptyAttrValue(val){
    return val == null || val === undefined;
};

module.exports = Widget;