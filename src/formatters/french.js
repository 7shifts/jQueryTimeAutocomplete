(function($) {
  $.timeAutocomplete.formatters.french = function() {
    this.initialize.apply(this, arguments);
  };

  $.timeAutocomplete.formatters.french.prototype = $.extend(
    true,
    {},
    $.timeAutocomplete.formatters["24hr"].prototype,
    {
      default_opts: {
        empty: {
          sep: "h"
        }
      },

      hook_getUsableTimeValue: function(val) {
        return val.replace(this.options.empty.sep, ":") + ":00";
      }
    }
  );
})(jQuery);
