/**
 * TimeFromToAutocomplete
 *
 * The from -> to autocomplete inputs (on absences dialog)
 */

(function($){

    /*
     * TimeAutcomplete
     *
     * @constructor
     * @param {Object} opts An object of options to over-ride the defaults
     */
    var namespace = 'timeAutocomplete';
    var time_data_prop = namespace + '.time';

    var TimeAutocomplete = function(){
        this.initialize.apply(this, arguments);
    };

    TimeAutocomplete.prototype = {

        // Gets set in initialize
        el: null,

        // Instance of our formatter
        _formatter: null,

        _calling_from_init: false,

        // Default options
        default_opts: {
            auto_complete: {
                delay: 0,
                autoFocus: true,
                minLength: 0
            },
            auto_value: true,
            value: '',
            formatter: 'ampm'
        },

        /**
         * Init called when we create a new instance
         * of this view. First param of 'options' passed in by backbonejs
         */
        initialize: function($el, opts){
            this.options = $.extend(true, {}, this.default_opts, opts);

            // Some global options (if set)
            if(typeof($.timeAutocompleteDefaults) !== 'undefined'){
                this.options = $.extend(true, {}, this.options, $.timeAutocompleteDefaults);
            }

            this.el = $el;
        },

        _callAutocomplete: function(){

            this.options.auto_complete.source = this._callFormatterMethod('filterSource', [this.el], function(req, responseFn){
                throw new Error("You must set a hook_filterSource method in your formatter.");
            });

            // Make sure we have loaded the autocomplete plugin
            if(typeof($.fn.autocomplete) === 'undefined'){
                throw new Error("You need to include the jQuery UI bundle that has the Autocomplete plugin.");
            }

            // Call our autocomplete plugin
            this.el.autocomplete(this.options.auto_complete);
        },

        /**
         * When we click on the element and there are no
         * initial values in there, make some to show the user
         * they have to start typing a number
         */
        _bindEvents: function(){

            var self = this;
            var allow_focus = true; /* IE fix */

            $('body').on('click.' + namespace, 'ul.ui-autocomplete a', function(){
                allow_focus = false;
                setTimeout(function(){
                    allow_focus = true;
                }, 100);
            });

            this.el
            .bind('keydown.' + namespace, function(e){
                self._keydownAutocomplete.apply(self, arguments);
            })
            .bind('keyup.' + namespace, function(e){
                self._keyupAutocomplete.apply(self, arguments);
            })
            .bind('blur.' + namespace, function(e){
                self._blurAutocomplete.apply(self, arguments);
            })
            .bind('focus.' + namespace, function(e){
                if(allow_focus){
                    self._focusAutocomplete.apply(self, arguments);
                }
            });

            if(this.options.auto_value){
                this.el.trigger('blur.' + namespace);
            }

        },

        _setupPlaceholder: function(){
            if(typeof(this.el.attr('placeholder')) === 'undefined'){
                this.el.attr('placeholder', this._callFormatterMethod('placeholderValue', [], ''));
            }
        },

        _focusAutocomplete: function(){
            var val = $.trim(this.el.val()).substr(0, 2);
            if(this.el.data('uiAutocomplete')){
                this.el.autocomplete('search', val);
            }
        },

        /*
         * Keydown autocomplete event
         *
         * @param {Object} e Event object
         * @param {HTMLElement} input The input we had the event performed on
         */
        _keydownAutocomplete: function(e){

            var val = $.trim(this.el.val());

            // If they hit any of these keys DO NOT disable the auto complete, these
            // are acceptable key strokes.
            var ignore_keydowns = [
                8, // backspace
                9, // tab
                13, // enter key
                38, // up arrow key
                40 // down arrow key
            ];

            if(!~$.inArray(e.which, ignore_keydowns) && ((e.which == 8) || (val.length > 1 && !~val.indexOf('h') && !~val.indexOf(':') && $.isNumeric(val)))){
                try {
                    this.el.autocomplete('close').autocomplete('disable');
                } catch(e){}
            }

        },

        /*
         * Keyup autocomplete event
         *
         * @param {Object} e Event object
         * @param {HTMLElement} input The input we had the event performed on
         */
        _keyupAutocomplete: function(e){

            if($.trim(this.el.val()) == '' && this.el.data('uiAutocomplete')){
                this.el.autocomplete('enable');
            }

        },

        /*
         * Blur autocomplete event
         *
         * @param {Object} e Event object
         * @param {HTMLElement} input The input we had the event performed on
         */
        _blurAutocomplete: function(e){

            var val = $.trim(this.el.val());
            val = this._callFormatterMethod('blur', [val], val);
            var new_value = '';

            if(val){
                new_value = this._createStringFromFormat(this._readMind(val));
            }
            else {
                new_value = this._callFormatterMethod('blurEmpty', [val], val);
            }

            this.el.val(new_value);

            this._attacheUsableTimeData();

        },

        /*
         * Hit a formatter hook to get at the date value, then store it in a data
         * attribute for later if need be
         */
        _attacheUsableTimeData: function(){
            var val = $.trim(this.el.val());
            this.el.data(time_data_prop, this._callFormatterMethod('getUsableTimeValue', [val]));
        },

        /**
         * Our 'ampm' formatter should be used by default. If we're adding a new
         * formatter, it will go into $.timeAutocomplete.formatters[formatter]
         *
         * @param {String} formatter The formater name we're setting to use.
         */
        setFormatter: function(formatter){

            this.options.formatter = formatter || this.options.formatter;

            if(!$.timeAutocomplete.formatters[this.options.formatter]){
                throw new Error("Formatter: '" + formatter + "' was not found. Make sure you're loading it (formatters/" + this.options.formatter + ".js) after you load src/TimeAutocomplete.js");
            }
            else {
                this._formatter = new $.timeAutocomplete.formatters[this.options.formatter](this, this.options);

                if(!this._calling_from_init){
                    this._callAutocomplete();
                }

                this._calling_from_init = false;
            }

        },

        /*
         * Gets the formatter
         */
        getFormatter: function(){
            return this._formatter;
        },

        /*
         * Gets the time in H:i:s format
         */
        getTime: function(){
            return this.el.data(time_data_prop) || '';
        },

        /**
         * Call the formatter method (if it exists). If you look in formatters/ampm.js, all our hooks that
         * get called there are prefixed by "hook_".
         *
         * @param {String} method_name The method to call in the formatter file
         * @param {Array} args The arguments to pass to the formatter
         * @param {Array|Function|Object|String} default_val The default if the method_name does not exist in the formatter
         */
        _callFormatterMethod: function(method_name, args, default_val){

            var formatter = this.getFormatter();

            if($.isFunction(formatter['hook_' + method_name])){
                return formatter['hook_' + method_name].apply(formatter, args);
            }

            return default_val;

        },

        /**
         * The person typed something in that wasn't to our satisfaction.
         * Like '10' or '13' or '135' or '1350'
         *
         * @param {String} val The value from our input
         */
        _readMind: function(val){
            return this._callFormatterMethod('readMind', [val], val);
        },

        /**
         * Combine formatted things
         *
         * @param {Object} obj The object containing h, m, sep etc.
         */
        _createStringFromFormat: function(obj){

            var combined = ("" + obj.h + "") + obj.sep + ("" + obj.m + "");

            if(obj.postfix){
                combined += obj.postfix;
            }

            return combined;

        },

        /*
         * Pass an H:i:s time format in as the value: '' attribute on the element or 'current'
         */
        _setValueAsTime: function(){

            var val = $.trim(this.el.val());
            var val_parts = val.split(':');

            if(val == '' && this.options.value){
                this.setTime(this.options.value);
            }
            else if(val_parts.length == 3 && this.isNumber(val_parts[0]) && this.isNumber(val_parts[1]) && this.isNumber(val_parts[2])){
                this.setTime(val);
            }
            else {
                var time = this._getCurrentTimeAsValue();
                this.el.val(time);
                this._attacheUsableTimeData();
            }

        },

        /*
         * Check if its a number
         *
         * @param {String|Int} n
         */
        isNumber: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        /*
         * Set the time by passing it a H:i:s format (13:30:00)
         *
         * @param {String} time 13:30:00
         */
        setTime: function(time){

            var stripped_time = time.replace(/[^0-9.]/g, "");
            var matched = stripped_time.match(/^[0-9]+$/);
            if(matched && matched.length && (matched[0].length == 5 || matched[0].length == 6)){
                var val = this._callFormatterMethod('getTimeObjectFromHis', [time]);
                val = this._createStringFromFormat(val);
                this.el.val(val);
                this._attacheUsableTimeData();
            } else {
                throw new Error('Setting a time must be in H:i:s format. Example: 03:30:00');
            }

        },

        /*
         * Populate the input with the current time value
         */
        _getCurrentTimeAsValue: function(){

            var formatter = this.getFormatter();
            var fake_date_data = [1987, 1, 17];
            var date = this._getCurrentDate();
            var current_h = date.getHours();
            var current_m = date.getMinutes();
            var current_time = (new Date(fake_date_data[0], fake_date_data[1], fake_date_data[2], current_h, current_m)).getTime();
            var bound_times = formatter.options.times.slice().concat(formatter.options.times);
            var entered_next_times = [];

            for(var i = 0, t = bound_times.length; i < t; i++){

                var time = this._callFormatterMethod('getTime', [bound_times[i], fake_date_data]);
                var next_time = (bound_times[i + 1]) ? this._callFormatterMethod('getTime', [bound_times[i + 1], fake_date_data]) : false;
                var already_entered_next_times = !!($.inArray(next_time, entered_next_times) !== -1);
                entered_next_times.push(next_time);

                if(current_time > time && ((next_time && current_time <= next_time) || (already_entered_next_times))){
                    return bound_times[i + 1];
                }
            }

        },

        /*
         * Get the current date
         */
        _getCurrentDate: function(){
            return new Date();
        },

        /*
         * Destroy the bound event to the element
         */
        destroy: function(){
            this.el.removeData(namespace);
            this.el.removeData(time_data_prop);
            this.el.unbind('.' + namespace);
            if(this.el.data('uiAutocomplete')){
                this.el.autocomplete('destroy');
            }
        },

        /*
         * Render it out to the page
         */
        render: function(){

            // Which formatter we're using.. 'ampm', 'french'?
            this._calling_from_init = true;
            this.setFormatter();
            this._callAutocomplete();

            if(this.options.auto_value){
                this._setValueAsTime();
            }

            this._bindEvents();
            this._setupPlaceholder();

            return this;

        }

    };

    /**
     * Just slappin' on a global object to access some convenient formatters
     */
    $.timeAutocomplete = {
        formatters: {},
        _raw: TimeAutocomplete // exposed globally for the sake of testing it
    };

    /*
     * Wrap it all into a nice jQuery function
     *
     * @param {Object} opts The options passed to it when called (optional)
     */
    $.fn.timeAutocomplete = function(opts){

        // Do the nasty on each one.
        return this.each(function(){

            var $el = $(this);

            // If it already exists, tear it down before setting a new one up
            if($el.data(namespace))
            {
                $el.data(namespace).destroy();
            }

            // Set up a new instance of the time autocomplete
            var ta_instance = (new TimeAutocomplete($el, opts)).render();
            $el.data(namespace, ta_instance);

        });

    };

})(jQuery);