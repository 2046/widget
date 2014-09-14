define(function(require, exports, module){
    'use strict'
    
    var Base, Widget, cidCounter, cachedInstances;
    
    Base = require('base');
    
    cidCounter = 0;
    cachedInstances = {};
    
    Widget = Base.extend({
        attrs : {
            template : '<div></div>',
            parentNode : document.body
        },
        events : null,
        element : null,
        specialProps : ['element', 'events'],
        initialize : function(opt){
            Widget.superclass.initialize.call(this, opt);
    
            this.cid = uniqueCid();
            this.parseElement();
            if(!this.element || !this.element[0]){
                throw new Error('element is invalid');
            }
    
            this.delegateEvents();
            stamp(this);
            this.setup && this.setup();
        },
        parseElement : function(){
            var element = this.element;
    
            if(element){
                this.element = $(element);
            }else if(this.get('template')){
                this.element = $(this.get('template'));
            }
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
            var parentNode;
    
            if(!this.rendered){
                this.rendered = true;
            }
    
            parentNode = this.get('parentNode');
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
    
        ctx.element.data('widgetId', ctx);
        cachedInstances[cid] = ctx;
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
    
    function isFunction(val){
        return Object.prototype.toString.call(val) === '[object Function]';
    };
    
    module.exports = Widget;
});