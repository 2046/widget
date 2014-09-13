'use strict'

var Base, Widget, cidCounter, cachedInstances, delegateEventSplitter;

Base = require('base');

cidCounter = 0;
cachedInstances = {};
delegateEventSplitter = /^(\S+)\s*(.*)$/;

Widget = Base.extend({
    attrs : {
        template : '<div></div>',
        parentNode : document.body
    },
    events : null,
    element : null,
    initialize : function(opt){
        Widget.superclass.initialize.call(this, opt);

        this.cid = uniqueCid();
        this.parseElement();
        console.log(this)
        console.log(this.element)
        if(!this.element || !this.element[0]){
            throw new Error('element is invalid');
        }

        this.delegateEvents();
        stamp();
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
        var key, method, match, eventName, selector;

        if(!(events || (events = this.element))){
            return this;
        }

        this.undelegateEvents();

        for(key in events){
            if(!events.hasOwnProperty(key)){
                continue;
            }

            mthod = events[key];

            if(!method){
                continue;
            }

            if(!isFunction(method)){
                method = this[events[key]];
            }

            match = key.match(delegateEventSplitter);
            selector = match[2];
            eventName = match[1] + '.delegateEvents' + this.cid;

            (function(handler, widget){
                function cb(args){
                    handler.call(widget, args);
                };

                if(selector){
                    widget.element.on(eventName, selector, cb);
                }else{
                    widget.element.on(eventName, cb);
                }
            })(method, this);
        }

        return this;
    },
    undelegateEvents : function(eventName){
        eventName || (eventName = '');
        this.element.off(eventName + '.delegateEvents' + this.cid);
        return this;
    },
    render : function(){
        var parentNode;

        if(!this.rendered){
            this.rendered = true;
        }

        parentNode = this.get('parentNode');

        if(parentNode && $.contains(this.element[0])){
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

function isFunction(val){
    return Object.prototype.toString.call(val) === '[object Function]';
};

module.exports = Widget;