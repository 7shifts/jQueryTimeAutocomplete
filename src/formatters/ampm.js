(function($){

    $.timeAutocomplete.formatters.ampm = function(){
        this.initialize.apply(this, arguments);
    };

    $.timeAutocomplete.formatters.ampm.prototype = {

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
         * $('#el').timeAutocomplete({ formatter: 'ampm', from_selector: ... });
         */
        default_opts: {
            from_selector: '',
            increment: 15,
            start_hour: 0,
            end_hour: 24,
            pm_text: 'PM',
            am_text: 'AM',
            blur_empty_populate: true,
            times: [], // over-ride if not using built-in populator
            empty: {
                h: '12',
                m: '00',
                sep: ':',
                postfix: ' PM'
            }
        },

        /*
         * Initialize the formatter. Called from within TimeAutocomplete file.
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
                    var re = $.ui.autocomplete.escapeRegex(req.term);
                    var has_am = ~re.toLowerCase().indexOf('a');
                    var has_pm = ~re.toLowerCase().indexOf('p');
                    var trim_ampm_possibilities = '';
                    var is_one = !!(self_val == 1); // if they type "1", don't show "11" and "12".
                    var do_has_am_pm_mind_read = (has_am || has_pm) && re.replace(/a|m|p/gi, '').length <= 2;

                    if(do_has_am_pm_mind_read){
                        re = $.trim(re.replace(/a|m|p/gi, '')) + ':00 ';
                        re += (has_am) ? self.options.am_text : self.options.pm_text;
                    }

                    // If the starting (from) time was 9:00 AM, and they start to type
                    // 2 in the (to) spot, default to 2 PM because 2 is less than 9.
                    // Only works on english.. not french.
                    if(self.options.from_selector){
                        trim_ampm_possibilities = self.detectAMPMFromInstanceOverlap() == self.options.am_text ? self.options.pm_text : self.options.am_text;
                    }

                    var matcher = new RegExp("^" + re, "i");
                    var a = [];

                    if(self_val){
                        a = $.grep(times, function(item){
                            var return_nil =
                                // If we want to trim out some AM/PM slots based on our mind reading
                                (trim_ampm_possibilities && (new RegExp(trim_ampm_possibilities, "gi")).test(item))
                                // If we type in "1", don't show "11" and "12" possibilities
                                || (is_one && item.substring(0, 2) != '1:')
                                || (~self_val.toLowerCase().indexOf('p') && !~item.toLowerCase().indexOf('p'))
                                || (~self_val.toLowerCase().indexOf('a') && !~item.toLowerCase().indexOf('a'));
                            if(return_nil){
                                return;
                            }
                            return matcher.test(item);
                        });
                    }

                    responseFn(a);

                }
            })(self.options.times, self);

        },

        /*
         * When we blur on the input field. Make any corrections/modifications to the value
         *
         * @param {String} val The input value
         */
        hook_blur: function(val){

            // Clean up 03:00 am
            if(val.charAt(0) == 0){
                val = val.substr(1);
            }

            return val;

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

            var am_pm = '';

            val = val.toLowerCase();
            if(this.options.from_selector && !~val.indexOf('a') && !~val.indexOf('p'))
            {
                am_pm = this.detectAMPMFromInstanceOverlap();
            }

            return this.getTimeObject(val, am_pm);

        },

        /*
         * Convert an '1:00 PM' to H:i:s so it's usable for storing in the DB.
         *
         * @param {String} val
         */
        hook_getUsableTimeValue: function(val){
            return this.parseTime(val);
        },

        /*
         * Get the timestamp on a time value
         *
         * @param {String} t The time (2:00 PM)
         * @param {Array} fake_date_data [1987, 1, 17]
         */
        hook_getTime: function(t, fake_date_data){

            var time_parts = this.parseTime(t).split(this.options.empty.sep);
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
            var ampm = (hour >= 12) ? this.options.pm_text : this.options.am_text;

            if(hour.length == 2 && parseInt(hour, 10) < 10){
                hour = hour.substr(1);
            }

            if(hour > 12){
                hour -= 12;
            }

            if(hour == 0){
                hour = 12;
            }

            var time_obj = {
                h: parseInt(hour, 10),
                m: min,
                sep: this.options.empty.sep,
                postfix: ' ' + ampm
            };

            return time_obj;

        },

        /**
         * If we have a $(self.options.from_selector), then we type '2' into the To field,
         * we should look at the From field to determine whether or not to make it 2pm
         * or 2am. Do awesome stuff to figure it out.
         */
        detectAMPMFromInstanceOverlap: function(){

            var trim_ampm_possibilities = '';
            var from_obj = this.getTimeObject($(this.options.from_selector).val());
            var to_obj = this.getTimeObject($.trim(this.main_instance.el.val()));

            if(from_obj.postfix && (~from_obj.postfix.toLowerCase().indexOf('a') || ~from_obj.postfix.toLowerCase().indexOf('p'))){

                var from_ampm = (~from_obj.postfix.toLowerCase().indexOf('a')) ? this.options.am_text : this.options.pm_text;
                var to_hour = to_obj.h;
                var from_hour = from_obj.h;

                // If it's 11:00 PM - 12.. it should say 12 AM and not PM.
                if(from_hour == 12 && to_hour != 12){
                    trim_ampm_possibilities = (from_ampm == this.options.am_text) ? this.options.am_text : this.options.pm_text;
                }
                else if(to_hour == 12 && from_hour != 12){
                    trim_ampm_possibilities = (from_ampm == this.options.am_text) ? this.options.pm_text : this.options.am_text;
                }
                // 10:00 AM > 2:00 PM, 10:00 PM > 2:00 AM
                else if(from_hour > to_hour){
                    trim_ampm_possibilities = (from_ampm == this.options.am_text) ? this.options.pm_text : this.options.am_text;
                }
                // 10:00 AM < 11:00 AM, 5:00 PM < 7:00 PM
                else {
                    trim_ampm_possibilities = (from_ampm == this.options.am_text) ? this.options.am_text : this.options.pm_text;
                }

            }

            return trim_ampm_possibilities;

        },

        /**
         * Format what we've got into an english readable format.
         * So turn '1030' into '10:30 am' etc.
         *
         * @param {String} original_val The original value to format
         * @param {String} am_pm Whether or not it's 'am' or 'pm'
         */
        getTimeObject: function(original_val, am_pm){

            var t = this.parseTime(original_val, 'g:i:A').split(':');
            var h = t[0];
            var m = t[1];
            var new_num;

            if(!h && !m){
                new_num = this.options.empty;
            }
            else {
                new_num = {
                    h: h,
                    m: m,
                    sep: ':',
                    postfix: ' ' + (am_pm ? am_pm : t[2])
                };
            }

            return new_num;

        },

        /*
         * Generate an array of times to pass to our autocomplete source.
         * ['12:00 AM', '12:15 AM'] etc. Totally depends on the start_hour and increment options set.
         */
        generateTimes: function(){

            if(!this.options.times.length){

                var start_minute = 60;
                var increment = this.options.increment;
                var date = new Date(2012, 1, 1, (this.options.start_hour - 1), (start_minute - increment));
                var arr = [];
                var hour_len = 60;
                var hours = this.options.end_hour;
                var hour_looper = (hours - this.options.start_hour);
                var pop_last = false;

                if(hour_looper == 24){
                    pop_last = true;
                }

                for(var i = 0, loop_int = hour_looper * (hour_len / increment); i <= loop_int; i++){

                    date.setMinutes(date.getMinutes() + increment);
                    var h = date.getHours();
                    var m = date.getMinutes();
                    var ampm = h > 11 ? this.options.pm_text : this.options.am_text;

                    if(h == 0){
                        h = 12;
                    }

                    if(h > 12){
                        h = h - 12;
                    }

                    if(("" + m).length == 1){
                        m = '0' + m;
                    }

                    var label = h + ':' + m + ' ' + ampm;
                    arr.push(label);
                }

                if(pop_last){
                    arr.pop();
                }

                this.options.times = arr;
            }

        },

        parseTime: function(time, format){

            var hour,
                minute,
                format = format || 'H:i:s',
                pm = time.match(/p/i) !== null,
                am = time.match(/a/i) !== null,
                num = time.replace(/[^0-9]/g, '');

            // Parse for hour and minute
            switch(num.length){
                case 4:
                    hour = parseInt(num.charAt(0) + num.charAt(1), 10);
                    minute = parseInt(num.charAt(2) + num.charAt(3), 10);
                    break;
                case 3:
                    hour = parseInt(num.charAt(0), 10);
                    minute = parseInt(num.charAt(1) + num.charAt(2), 10);
                    break;
                case 2:
                case 1:
                    hour = parseInt(num.charAt(0) + (num.charAt(1) || ''), 10);
                    minute = 0;
                    break;
                default:
                    return '';
            }

            // if 12 and am/pm not specified assume pm
            if (hour == 12 && pm === false && am === false) {
                hour = 12;
                pm = true;
            } else if (hour == 12 && pm === false) {
                hour = 0;
            } else if (pm === true && hour > 0 && hour < 12) {
                hour += 12;
            }

            // Keep within range
            if(hour <= 0 ){
                hour = 0;
            }

            if(hour >= 24 && ("" + hour + "").length == 2){
                var parts = ("" + hour + "").split('');
                hour = parseInt(parts[0], 10);
                minute = parseInt(parts[1], 10);
                if(minute < 6){
                    minute = minute + '0';
                }
            }

            if(minute < 0 || minute > 59){
                minute = 0;
            }

            if(hour >= 13 && hour <= 23){
                pm = true;
            }

            return format
                // 12 hour without leading 0
                .replace(/g/g, hour === 0 ? '12' : 'g')
                .replace(/g/g, hour > 12 ? hour - 12 : hour)
                // 12 hour with leading 0
                .replace(/h/g, hour.toString().length > 1 ? (hour > 12 ? hour - 12 : hour) : '0' + (hour > 12 ? hour - 12 : hour))
                // 24 hour with leading 0
                .replace(/H/g, hour.toString().length > 1 ? hour : '0' + hour)
                // minutes with leading zero
                .replace(/i/g, minute.toString().length > 1 ? minute : '0' + minute)
                // simulate seconds
                .replace(/s/g, '00')
                // lowercase am/pm
                .replace(/A/g, pm ? this.options.pm_text : this.options.am_text);

        }

    };

})(jQuery);