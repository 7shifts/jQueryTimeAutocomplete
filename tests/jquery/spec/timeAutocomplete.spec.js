describe("timeAutocomplete", function() {

    var sut,
        $el;

    beforeEach(function(){
        $el = affix('input');
        sut = new $.timeAutocomplete._raw($el);
    });

    describe('initialize', function(){

        it('should merge in default_opts with opts passed in', function(){
            var opts = { passed: 'options', formatter: 'bleh' };
            sut.initialize($el, opts);
            expect(sut.options).toEqual($.extend(true, {}, sut.default_opts, opts));
        });

    });

    describe('render', function(){

        beforeEach(function(){
            spyOn(sut, 'setFormatter');
            spyOn(sut, '_callFormatterMethod');
            spyOn(sut, '_callAutocomplete');
            spyOn(sut, '_bindEvents');
            spyOn(sut, '_setupPlaceholder');
            spyOn(sut, '_setValueAsTime');

            sut.render();
        });

        it('should call setFormatter', function(){
            expect(sut.setFormatter).toHaveBeenCalled();
        });

        it('should call _setValueAsTime', function(){
            expect(sut._setValueAsTime).toHaveBeenCalled();
        });

        it('should call_bindEvents', function(){
            expect(sut._bindEvents).toHaveBeenCalled();
        });

        it('should call _callAutocomplete', function(){
            expect(sut._callAutocomplete).toHaveBeenCalled();
        });

        it('should call _setupPlaceholder', function(){
            expect(sut._setupPlaceholder).toHaveBeenCalled();
        });

        it('should not call _setValueAsTime if this.options.auto_value is false', function(){
            var $ta_el = affix('input');
            var TimeAutocompleteInstance = new $.timeAutocomplete._raw($ta_el);
            spyOn(TimeAutocompleteInstance, 'setFormatter');
            spyOn(TimeAutocompleteInstance, '_callFormatterMethod');
            spyOn(TimeAutocompleteInstance, '_callAutocomplete');
            spyOn(TimeAutocompleteInstance, '_bindEvents');
            spyOn(TimeAutocompleteInstance, '_setupPlaceholder');
            spyOn(TimeAutocompleteInstance, '_setValueAsTime');

            TimeAutocompleteInstance.options.auto_value = false;
            TimeAutocompleteInstance.render();

            expect(TimeAutocompleteInstance._setValueAsTime).not.toHaveBeenCalled();
        });

    });

    describe('_setValueAsTime', function(){

        beforeEach(function(){
            spyOn(sut, 'setTime');
            spyOn(sut, '_attacheUsableTimeData');
            spyOn(sut, '_getCurrentTimeAsValue');

        });

        it('should not set time with options.value', function(){
            sut.el = affix('input[value=""]');
            sut.options.value = '03:40:00';
            sut._setValueAsTime();
            expect(sut.setTime).toHaveBeenCalledWith(sut.options.value);
        });

        it('should not set time (string)', function(){
            sut.el = affix('input[value="some thing"]');
            sut._setValueAsTime();
            expect(sut.setTime).not.toHaveBeenCalled();
        });

        it('should not set the time (badly formed number)', function(){
            sut.el = affix('input[value="03:00:"]');
            sut._setValueAsTime();
            expect(sut.setTime).not.toHaveBeenCalled();
        });

        it('should set the time', function(){
            sut.el = affix('input[value="03:00:00"]');
            sut._setValueAsTime();
            expect(sut.setTime).toHaveBeenCalledWith('03:00:00');
        });

    });

    describe('_callAutocomplete', function(){

        beforeEach(function(){
            spyOn(sut, '_callFormatterMethod');
            spyOn(sut.el, 'autocomplete');
            sut.options.auto_complete = { wee: 'data' };
            sut._callAutocomplete();
        });

        it('should call our callFormatterMethod with args', function(){
            expect(sut._callFormatterMethod.argsForCall[0][0]).toEqual('filterSource');
            expect(sut._callFormatterMethod.argsForCall[0][1]).toEqual([$el]);
            expect(function(){ sut._callFormatterMethod.argsForCall[0][2]() }).toThrow('You must set a hook_filterSource method in your formatter.');
        });

        it('should call autocomplete', function(){
            expect(sut.el.autocomplete).toHaveBeenCalledWith(sut.options.auto_complete);
        });

    });

    describe('_bindEvents', function(){

        beforeEach(function(){
            sut.el = affix('input');
            spyOn($.fn, 'bind').andCallThrough();
            spyOn($.fn, 'trigger');
            sut._bindEvents();
        });

        it('should bind keydown', function(){
            spyOn(sut, '_keydownAutocomplete');
            expect($.fn.bind.argsForCall[0][0]).toEqual('keydown.timeAutocomplete');
            var e = { target: 'a' };
            var ctx = {};
            $.fn.bind.argsForCall[0][1].call(ctx, e);
            expect(sut._keydownAutocomplete).toHaveBeenCalledWith(e);
        });

        it('should bind keyup', function(){
            spyOn(sut, '_keyupAutocomplete');
            expect($.fn.bind.argsForCall[1][0]).toEqual('keyup.timeAutocomplete');
            var e = { target: 'a' };
            var ctx = {};
            $.fn.bind.argsForCall[1][1].call(ctx, e);
            expect(sut._keyupAutocomplete).toHaveBeenCalledWith(e);
        });

        it('should bind blur', function(){
            spyOn(sut, '_blurAutocomplete');
            expect($.fn.bind.argsForCall[2][0]).toEqual('blur.timeAutocomplete');
            var e = { target: 'a' };
            var ctx = {};
            $.fn.bind.argsForCall[2][1].call(ctx, e);
            expect(sut._blurAutocomplete).toHaveBeenCalledWith(e);
        });

        it('should trigger a blur event', function(){
            expect($.fn.trigger).toHaveBeenCalledWith('blur.timeAutocomplete');
        });

    });

    describe('_callFormatterMethod', function(){

        it('should call formatter if it exists', function(){
            var method = 'myMethod';
            sut._formatter = {
                hook_myMethod: jasmine.createSpy()
            };
            sut._callFormatterMethod(method, ['some', 'args'], 1);
            expect(sut._formatter.hook_myMethod).toHaveBeenCalledWith('some', 'args');
        });

        it('should return default val', function(){
            var method = 'myMethod';
            sut._formatter = {};
            expect(sut._callFormatterMethod(method, ['some', 'args'], 1)).toEqual(1);
        });

    });

    describe('_readMind', function(){

        it('should call callFormatterMethod with proper params', function(){
            spyOn(sut, '_callFormatterMethod');
            var v = 'my default val';
            sut._readMind(v);
            expect(sut._callFormatterMethod).toHaveBeenCalledWith('readMind', [v], v);
        });

    });

    describe('_getCurrentTimeAsValue', function(){

        var _24hr,
            times;

        beforeEach(function(){
            times = [
                '12:00 AM',
                '12:15 AM',
                '11:00 PM',
                '11:15 PM',
                '11:30 PM',
                '11:45 PM',
                '12:00 AM'
            ];

            _24hr = {
                '12:00 AM': '00:00:00',
                '12:15 AM': '00:15:00',
                '11:00 PM': '23:00:00',
                '11:15 PM': '23:15:00',
                '11:30 PM': '23:30:00',
                '11:45 PM': '23:45:00'
            };

            spyOn(sut, 'getFormatter').andReturn({
                options: {
                    times: times
                }
            });

            spyOn(sut, '_callFormatterMethod').andCallFake(function(method, args){

                var time_parts = _24hr[args[0]].split(':');
                var h = time_parts[0];
                var m = time_parts[1];

                return (new Date(args[1][0], args[1][1], args[1][2], h, m)).getTime();
            });
        });

        it('should set the proper start time based on the users current time: 11:23 PM', function(){

            spyOn(sut, '_getCurrentDate').andReturn(new Date(1999, 1, 1, 23, 23));
            var val = sut._getCurrentTimeAsValue();
            expect(val).toEqual('11:30 PM');

        });

        it('should set the proper start time based on the users current time 11:58 PM', function(){

            spyOn(sut, '_getCurrentDate').andReturn(new Date(1999, 1, 1, 23, 58));
            var val = sut._getCurrentTimeAsValue();
            expect(val).toEqual('12:00 AM');

        });

        it('should set the proper start time based on the users current time 11:45 PM', function(){

            spyOn(sut, '_getCurrentDate').andReturn(new Date(1999, 1, 1, 23, 45));
            var val = sut._getCurrentTimeAsValue();
            expect(val).toEqual('11:45 PM');

        });

    });

});