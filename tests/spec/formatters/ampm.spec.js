describe('formatter/ampm', function(){

    var view;

    beforeEach(function(){
        view = new $.timeAutocomplete.formatters.ampm(null, {});
    });

    describe('times', function(){

        it('should use times passed to it', function(){

            var times = [
                '1:00 AM',
                '1:30 AM',
                '1:50 AM',
                '1:00 PM',
                '3:00 PM'
            ];

            var Formatter = new $.timeAutocomplete.formatters.ampm(null, {
                times: times
            });

            expect(Formatter.options.times).toEqual(times);

        });

        it('should generate times when no times are passed in', function(){

            expect(view.options.times.length).toEqual(96);
            expect(view.options.times[0]).toEqual('12:00 AM');
            expect(view.options.times[1]).toEqual('12:15 AM');
            expect(view.options.times[2]).toEqual('12:30 AM');
            expect(view.options.times[3]).toEqual('12:45 AM');
            expect(view.options.times[4]).toEqual('1:00 AM');

        });

    });


    describe('increment', function(){

        it('should start with a different hour and use a 10 increment', function(){

            var Formatter = new $.timeAutocomplete.formatters.ampm(null, {
                increment: 10,
                start_hour: 23,
                end_hour: 24
            });

            expect(Formatter.options.times.length).toEqual(7);
            expect(Formatter.options.times[0]).toEqual('11:00 PM');
            expect(Formatter.options.times[1]).toEqual('11:10 PM');
            expect(Formatter.options.times[2]).toEqual('11:20 PM');
            expect(Formatter.options.times[3]).toEqual('11:30 PM');
            expect(Formatter.options.times[4]).toEqual('11:40 PM');
            expect(Formatter.options.times[5]).toEqual('11:50 PM');
            expect(Formatter.options.times[6]).toEqual('12:00 AM');

        });

        it('should start with a different hour and use a 10 increment', function(){

            var Formatter = new $.timeAutocomplete.formatters.ampm(null, {
                increment: 30,
                start_hour: 1,
                end_hour: 3
            });

            expect(Formatter.options.times.length).toEqual(5);
            expect(Formatter.options.times[0]).toEqual('1:00 AM');
            expect(Formatter.options.times[1]).toEqual('1:30 AM');
            expect(Formatter.options.times[2]).toEqual('2:00 AM');
            expect(Formatter.options.times[3]).toEqual('2:30 AM');
            expect(Formatter.options.times[4]).toEqual('3:00 AM');

        });

     });

    describe('am/pm text', function(){

        it('should change the am/pm text', function(){

            var Formatter = new $.timeAutocomplete.formatters.ampm(null, {
                pm_text: 'pee-em',
                am_text: 'eh-em',
                start_hour: 11,
                end_hour: 13
            });

            var result = ["11:00 eh-em", "11:15 eh-em", "11:30 eh-em", "11:45 eh-em", "12:00 pee-em", "12:15 pee-em", "12:30 pee-em", "12:45 pee-em", "1:00 pee-em"];

            expect(Formatter.options.times).toEqual(result);

        });

    });

    describe('hook_getTimeObjectFromHis', function(){

        it('should return the proper formatted time when over 12pm', function(){

            var Formatter = new $.timeAutocomplete.formatters.ampm(null, {});
            expect(Formatter.hook_getTimeObjectFromHis('19:00:00')).toEqual({
                h: 7,
                m: '00',
                sep: ':',
                postfix : ' PM'
            });

        });

        it('should return the proper formatted time when under 12pm', function(){

            var Formatter = new $.timeAutocomplete.formatters.ampm(null, {});
            expect(Formatter.hook_getTimeObjectFromHis('05:43:00')).toEqual({
                h: 5,
                m: '43',
                sep: ':',
                postfix : ' AM'
            });

        });

        it('should return the proper formatted time when under 12pm', function(){

            var Formatter = new $.timeAutocomplete.formatters.ampm(null, {});
            expect(Formatter.hook_getTimeObjectFromHis('00:43:00')).toEqual({
                h: 12,
                m: '43',
                sep: ':',
                postfix : ' AM'
            });

        });

    });

    describe('parseTime', function(){

        it('should parse any time into H:i:s format', function(){

            var re = {
                '01:00pm': '13:00:00',
                '12am': '00:00:00',
                '12 a': '00:00:00',
                '123 am': '01:23:00',
                '13': '13:00:00',
                '2330': '23:30:00',
                '2:3': '23:00:00',
                '2:15am': '02:15:00',
                '15:30am': '15:30:00',
                '6:30 PM': '18:30:00',
                '6:60 PM': '18:00:00',
                '25:60 PM': '02:50:00',
                '83': '08:30:00',
                '27': '02:07:00',
                '33': '03:30:00'
            };

            for(var k in re){
                expect(view.parseTime(k)).toEqual(re[k]);
            }

        });

        it('should parse any time into g:i A format', function(){

            var re = {
                '01:00pm': '1:00 PM',
                '12am': '12:00 AM',
                '12 a': '12:00 AM',
                '123 am': '1:23 AM',
                '13': '1:00 PM',
                '2330': '11:30 PM',
                '2:3': '11:00 PM',
                '2:15am': '2:15 AM',
                '15:30am': '3:30 PM',
                '6:30 PM': '6:30 PM',
                '12:60 PM': '12:00 PM',
                '25:60 PM': '2:50 PM',
                '83 PM': '8:30 PM',
                '27 PM': '2:07 PM',
                '33 PM': '3:30 PM',
                '23': '11:00 PM',
                '00': '12:00 AM',
                '12': '12:00 PM'
            };

            for(var k in re){
                expect(view.parseTime(k, 'g:i A')).toEqual(re[k]);
            }

        });

    });

});