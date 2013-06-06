(function($){

    $.timeAutocomplete.formatters['24hr'] = function(){
        this.initialize.apply(this, arguments);
    };

    $.timeAutocomplete.formatters['24hr'].prototype = {

        /*
         * The main instance that was created. Found on $('#el').data('timeAutocomplete')
         * of that specific element. Gets stuffed in on initialize();
         */
        main_instance: null,

        /*
         * These get merged in later. We take the default_opts and the formatter_opts from
         * initialize() and merge them into this options object.
         */
        options: {},

        /*
         * Some defaults to get over-ridden if needed. Can be done using
         * $('#el').timeAutocomplete({ formatter: '24hr' } });
         */
        default_opts: {
            increment: 15,
            start_hour: '00',
            hour_max: 24,
            blur_empty_populate: true,
            times: [],
            empty: {
                h: '12',
                m: '00',
                sep: ':',
                postfix: ''
            }
        },

        /*
         * Initialize the formatter
         *
         * @param {Object} main_instance Instance of timeAutocomplete on that element
         * @param {Object} formatter_opts Any options passed... $('#el').timeAutocomplete({ formatter: 'ampm', from_selector: ... });
         */
        initialize: function(main_instance, formatter_opts){

            this.main_instance = main_instance;
            this.options = $.extend(true, {}, this.default_opts, formatter_opts);
            this.generateTimes();

        },

        hook_placeholderValue: function(){
            return this.main_instance._createStringFromFormat(this.options.empty);
        },

        /*
         * Get the timestamp on a time value
         *
         * @param {String} t The time (2:00 PM)
         * @param {Array} fake_date_data [1987, 1, 17]
         */
        hook_getTime: function(t, fake_date_data){

            var time_parts = t.split(this.options.empty.sep);
            var h = time_parts[0];
            var m = time_parts[1];

            return (new Date(fake_date_data[0], fake_date_data[1], fake_date_data[2], h, m)).getTime();

        },

        /*
         * Get the H:is (13:30:00) time format and turn it into a time object
         * that we can pass back to the main view.
         *
         * @param {String} time_his 13:30:00
         */
        hook_getTimeObjectFromHis: function(time_his){

            var time = time_his.split(':');
            var hour = time[0];
            var min = time[1];

            var time_obj = {
                h: hour,
                m: min,
                sep: this.options.empty.sep
            };

            return time_obj;

        },

        /*
         * Setup a filter when we type a key into this input.
         *
         * @param {Object} el The jQuery element
         */
        hook_filterSource: function(el){

            var self = this;
            el = el[0];

            return (function(times, self){
                return function(req, responseFn){

                    var self_val = $.trim(el.value);

                    if(req.term.length == 1 && req.term.substr(0, 1) < 10){
                        req.term = '0' + req.term;
                    }

                    var re = $.ui.autocomplete.escapeRegex(req.term);

                    var matcher = new RegExp("^" + re, "i");
                    var a = [];

                    if(self_val){
                        a = $.grep(times, function(item){

                            if(item.substr(0, 1) == 0 && item.length == 1){
                                item = item.substr(1);
                            }

                            return matcher.test(item);
                        });
                    }

                    responseFn(a);

                    var val = self_val.toLowerCase();
                    if(!a.length && val.length > 5){
                        // Should never be longer than 5 in french/24hr. Ie. 04h30 (5 characters), if it's longer, truncate it.
                        self.main_instance.el.val(val.substr(0, 5));
                    }

                }
            })(self.options.times, self);
        },

        /*
         * If we blurred and it was an empty value.
         */
        hook_blurEmpty: function(){

            if(this.options.blur_empty_populate){
                return this.main_instance._createStringFromFormat(this.options.empty);
            }
            else {
                return '';
            }

        },

        /*
         * Where our formatting actually happens.
         *
         * @param {String} val The value we're formatting
         */
        hook_readMind: function(val){

            val = val.toLowerCase();

            return this.getTimeObject(val);

        },

        hook_getUsableTimeValue: function(val){
            return val + ':00'
        },

        /**
         * Format our numbers.
         *
         * @param {String} original_val The original value
         */
        getTimeObject: function(original_val){

            var h = '';
            var m = '';
            var new_num = '';

            if(~original_val.indexOf('h')){
                var parts = original_val.split('h');
                h = (parts[0]) ? parts[0] : this.options.empty.h; // really? no hour. Must be jack-assery.
                m = (parts[1]) ? parts[1] : this.options.empty.m;
            }
            else {
                var numbers = original_val.replace(/[^\d]/g, "");
                numbers = numbers.split('');
                if(numbers.length == 4){
                    h = numbers[0] + numbers[1];
                    m = numbers[2] + numbers[3];
                }
                else if(numbers.length == 3){
                    h = '0' + numbers[0];
                    m = numbers[1] + numbers[2];
                }
                else if(numbers.length == 2){
                    h = numbers.join('');
                    m = '00';
                }
                else if(numbers.length == 1){
                    h = numbers.join('');
                    m = '00';
                }
            }

            // 91 entered.. format it to 09h10
            if(h > 24 && m == '00'){
                h = h.split('');
                m = h[1] + '0';
                h = '0' + h[0];
            }

            if(h.length == 1){
                h = '0' + h;
            }

            if(m.length == 1){
                m = m + '0';
            }

            if(!h && !m){
                new_num = this.options.empty;
            }
            else {
                new_num = {
                    h: h,
                    m: m,
                    sep: this.options.empty.sep
                };
            }

            return new_num;

        },

        /*
         * Generate an array of times to pass to our autocomplete source.
         * ['12h00', '12h15'] etc. Totally depends on the increment options set.
         */
        generateTimes: function(){

            if(!this.options.times.length){

                var start_minute = 60;
                var increment = this.options.increment;
                var date = new Date(2012, 1, 1, (this.options.start_hour - 1), (start_minute - increment));
                var arr = [];
                var hour_len = 60;
                var hours = this.options.hour_max;

                for(var i = 0, loop_int = hours * (hour_len/increment); i < loop_int; i++){

                    date.setMinutes(date.getMinutes() + increment);
                    var h = date.getHours();
                    var m = date.getMinutes();

                    if(("" + h).length == 1){
                        h = '0' + h;
                    }

                    if(("" + m).length == 1){
                        m = '0' + m;
                    }

                    var label = h + this.options.empty.sep + m;
                    arr.push(label);
                }

                this.options.times = arr;
            }

        }

    };

})(jQuery);