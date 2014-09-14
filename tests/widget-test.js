define(function(require, exports, module){
    var Widget, expect, sinon, body;

    Widget = require('widget');
    expect = require('expect');
    sinon = require('sinon');
    body = document.body;

    function equals(){
        var args = arguments;
        expect(args[0]).to.equal(args[1]);
    };

    function ok(o){
        expect(o).to.be.ok();
    };

    describe('Widget', function(){
        var globalVar = {};

        afterEach(function(){
            for(var v in globalVar){
                globalVar[v].destroy();
            }
            globalVar = {};
        });

        it('initAttrs', function(){
            var div = $('<div id="a"></div>').appendTo(document.body);

            var WidgetA = Widget.extend({
                element : '#defualt',
                attrs : {
                    foo : 'foo',
                    template : '<span></span>',
                    model : {
                        title : 'defualt title',
                        content : 'defualt content'
                    }
                }
            });

            var a = globalVar.a = new WidgetA({
                element : '#a',
                bar : 'bar',
                template : '<a></a>',
                model : {
                    title : 'title a'
                }
            });

            equals(a.get('bar'), 'bar');
            equals(a.get('foo'), 'foo');
            equals(a.get('template'), '<a></a>');
            equals(a.get('model').title, 'title a');
            equals(a.get('model').content, 'defualt content');
            equals(a.element[0].id, 'a');
            div.remove();
        });

        it('parseElement', function(){
            var div = $('<div id="a"></div>').appendTo(document.body);
            var widget = globalVar.widget = new Widget();
            equals(widget.element[0].tagName, 'DIV');

            widget = globalVar.widget = new Widget({element : '#a'});
            equals(widget.element[0].id, 'a');

            widget = globalVar.widget = new Widget({element : document.getElementById('a')});
            equals(widget.element[0].id, 'a');

            widget = globalVar.widget = new Widget({element : $('#a')});
            equals(widget.element[0].id, 'a');

            try{
                new Widget({element : '#b'});
            }catch(e){
                equals(e.message, 'element is invalid');
            }

            widget = globalVar.widget = new Widget({template : '<span></span>'});
            equals(widget.element[0].tagName, 'SPAN');
            div.remove();
        });

        it('parentNode is a document fragment', function(){
            var id = 'test' + new Date();
            var divs = $('<div id="' + id + '"></div><div></div>');

            new Widget({
                element : divs.eq(0),
                parentNode : document.body
            }).render();

            expect(document.getElementById(id).nodeType).to.equal(1);
        });

        it('delegateEvents()', function(){
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();
            var spy3 = sinon.spy();
            var that, event;

            var TestWidget = Widget.extend({
                events : {
                    'click p': 'fn1',
                    'click li' : 'fn2',
                    'mouseenter span' : 'fn3'
                },
                fn1 : spy1,
                fn2 : spy2,
                fn3 : function(ev){
                    spy3();
                    event = ev;
                    that = this;
                }
            });

            var widget = globalVar.widget = new TestWidget({
                template : '<div><p></p><ul><li></li></ul><span></span></div>'
            }).render();
            widget.$('p').trigger('click');
            ok(spy1.called);
            spy1.reset();

            widget.$('li').trigger('click');
            ok(spy2.called);
            spy2.reset();

            widget.element.trigger('click');
            expect(spy1.called).not.to.be.ok();
            expect(spy2.called).not.to.be.ok();
            spy1.reset();
            spy2.reset();

            widget.$('span').trigger('mouseenter');
            ok(spy3.called);
            equals(event.currentTarget.tagName, 'SPAN');
            expect(that).to.equal(widget);
        });

        it('delegateEvents(eventsObject)', function(){
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();
            var TestWidget = Widget.extend({
                fn1 : spy1
            });
            var widget = globalVar.widget = new TestWidget({
                template : '<div><p></p><ul><li></li></ul><span></span></div>'
            }).render();

            widget.delegateEvents({
                'click p' : 'fn1',
                'click span' : spy2
            });

            widget.$('p').trigger('click');
            ok(spy1.called);

            widget.$('span').trigger('click');
            ok(spy2.called);
        });

        it('undelegateEvents()', function(){
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();
            var widget = globalVar.widget = new Widget({
                template: '<div><p></p><ul><li></li></ul><span></span></div>'
            }).render();

            widget.delegateEvents({
                'click p' : spy1,
                'mouseenter' : spy2
            });

            widget.$('p').trigger('click');
            widget.element.trigger('mouseenter');

            ok(spy1.called);
            ok(spy2.called);
            spy1.reset();
            spy2.reset();

            widget.undelegateEvents();
            widget.$('p').trigger('click');
            widget.element.trigger('mouseenter');
            expect(spy1.called).not.to.be.ok();
            expect(spy2.called).not.to.be.ok();
        });

        it('undelegateEvents(eventName)', function(){
            var spy1 = sinon.spy();
            var spy2 = sinon.spy();
            var spy3 = sinon.spy();
            var widget = globalVar.widget = new Widget({
                template: '<div><p></p><ul><li></li></ul><span></span></div>'
            }).render();

            widget.delegateEvents({
                'click p' : spy1,
                'click span' : spy2,
                'click li' : spy3
            });

            widget.$('p').trigger('click');
            widget.$('span').trigger('click');
            widget.$('li').trigger('click');

            ok(spy1.called);
            ok(spy2.called);
            ok(spy3.called);
            spy1.reset();
            spy2.reset();
            spy3.reset();

            widget.undelegateEvents('click span');
            widget.$('p').trigger('click');
            widget.$('span').trigger('click');
            widget.$('li').trigger('click');
            ok(spy1.called);
            expect(spy2.called).not.to.be.ok();
            ok(spy3.called);
            spy1.reset();
            spy2.reset();
            spy3.reset();

            widget.undelegateEvents('click');
            widget.$('p').trigger('click');
            widget.$('span').trigger('click');
            widget.$('li').trigger('click');
            expect(spy1.called).not.to.be.ok();
            expect(spy2.called).not.to.be.ok();
            expect(spy3.called).not.to.be.ok();
        });

        it('delegate events inherited from ancestors', function(){
            var counter = 0;

            function incr(){
                counter++;
            };

            var A = Widget.extend({
                events : {
                    'click p' : incr
                }
            });

            var B = A.extend({
                events : {
                    'click div' : incr
                }
            });

            var obj = globalVar.obj = new B({
                template : '<section><p></p><div></div><span></span></section>',
                events : {
                    'click span' : incr
                }
            }).render();

            counter = 0;
            obj.$('p').trigger('click');
            equals(counter, 1);

            counter = 0;
            obj.$('div').trigger('click');
            equals(counter, 1);

            counter = 0;
            obj.$('span').trigger('click');
            equals(counter, 1);
        });

        it('inherited attrs', function(){
            var A = Widget.extend({
                attrs : {
                    a : '',
                    b : null
                }
            });

            var B = A.extend({
                attrs : {
                    a : '1'
                }
            });

            var C = B.extend({
                attrs : {
                    a : '2',
                    b : 'b'
                }
            });

            var c = globalVar.c = new C();
            equals(c.get('a'), '2');
            equals(c.get('b'), 'b');
        });

        it('#3 parentNode is a jQuery object', function(){
            $('<div id="test1"></div>').appendTo('body');

            var w = globalVar.w = new Widget({parentNode : $('#test1')});
            w.render();

            equals($('#test1 div').html(), '');
            $('#test1').remove();
        });

        it('override object in prototype', function(){
            var B = Widget.extend({
                o : {p1 : '1'}
            });

            var C = B.extend({
                o : {p2 : '2'}
            });

            var c = globalVar.c = new C();
            equals(c.o.p1, undefined);
            equals(c.o.p2, '2');
        });

        it('#38 destroy', function(){
            var A = new Widget({
                template : '<div id="destroy"><a></a></div>'
            }).render();

            expect(A.element[0]).to.eql($('#destroy')[0]);
            A.destroy();
            equals($('#destroy')[0], undefined);
            expect(A.element).to.be(null);
        });

        it('#25 destroy is called twice', function(){
            var A = new Widget({
                template : '<div id="destroy"><a></a></div>'
            }).render();

            expect(function(){
                A.destroy();
                A.destroy();
            }).to.not.throwError();
        });

        it('attr change callback', function(){
            var spy = sinon.spy();
            var Test = Widget.extend({
                attrs : {
                    a : 1
                },
                _onChangeA : spy
            });

            var test = new Test();
            test.set('a', 2);
            ok(spy.calledOnce);
        });

        it('destroy once', function(){
            var calledA = 0, calledB = 0;

            var A = Widget.extend({
                destroy : function(){
                    calledA++;
                    A.superclass.destroy.call(this);
                }
            });

            var B = A.extend({
                destroy : function(){
                    calledB++;
                    B.superclass.destroy.call(this);
                }
            });

            var c = new B().render();
            c.destroy();
            c.destroy();

            equals(calledA, 1);
            equals(calledB, 1);
        });

        it('set attribute to htmlElement', function(){
            var A = Widget.extend({
                attrs : {
                    testElement : null
                }
            });
            var a = new A();
            a.set('testElement', document.body);
            equals(a.get('testElement'), document.body);
        });
    });
});