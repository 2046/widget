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

            var a = new WidgetA({
                element : '#a',
                attrs : {
                    bar : 'bar',
                    template : '<a></a>',
                    model : {
                        title : 'title a'
                    }
                }
            });

            console.log(a)

            equals(a.get('bar'), 'bar');
        });
    });
});