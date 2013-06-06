# jQuery timeAutocomplete Plugin

### What is this?

It's a time picker similar to how Google Calendar's time picker works for events. It's meant to be smart, sexy and intuitive.

Some things that make is super duper fantastic:

*   Start time defaults to users current time (within your set increment).
*   Tabbing out of the field without selecting a time will cause it to make an educated guess. Try typing a badly formatted time like 115 or 1 or 1pm or 28 then tabbing out.
*   If the end time is less than the start time, evaluate it to the opposite am/pm of the start time. Example: 7:00AM - 5... 5 will default to PM.
*   Fetch time in H:i:s format (13:30:00) for comparing/validating. Done so by calling $(input).data('timeAutocomplete').getTime()
*   Uses placeholder attribute if detected, if not, it uses our own placeholder text.
*   Oh, and it's tested :) - see tests/index.html to run tests

### Basic Usage
```
$('#basic-example').timeAutocomplete();
```

### Advanced usage #1

Injecting an existing value and using 24hr as the formatter.

```
$('#from-24hr').timeAutocomplete({
    formatter: '24hr',
    value: '07:00:00'
});
```
```
$('#to-24hr').timeAutocomplete({
    formatter: '24hr',
    value: '09:30:00'
});
```

### More documentation and examples
* http://7shifts.com/blog/better-time-drop-downs-for-scheduling-jquery-timeautocomplete/