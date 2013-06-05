# TimeAutocomplete

## What is this?
It's an autocomplete plugin that works specifically with time inputs. If you've ever used Google Calendar to input an event and time, you've used their autocomplete time input. This is based of Google Calendar's time input.
You can either start typing a number into the input, then choose an option that it presents from the autocomplete dropdown or you can just type in your own format and let the plugin figure it out (see tests for examples).

## Setup

### Option 1
Just look at example.html

### Option 2
In the &lt;head&gt; of your document, put links to jQuery and jQuery ui (must contain at least autocomplete with dependencies):

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js" type="text/javascript"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.21/jquery-ui.min.js" type="text/javascript"></script>

After you've included those, add the following code before the closing &lt;/body&gt; tag:

    <!-- The inputs our autocomplete is going to be attached to -->
    <input type="text" id="from" />
    <input type="text" id="to" />

    <script src="src/jquery.timeAutocomplete.js" type="text/javascript"></script>
    <script src="src/formatters/ampm.js" type="text/javascript"></script>

    <script type="text/javascript">

        $('#from').timeAutocomplete({
            increment: 15 // Generates a list of times at a 15 minute increment
        });

        $('#to').timeAutocomplete({
            // We pass in a #from TimeAutocomplete instance to our #to autocomplete. This allows our #to autocomplete
            // to be smart about which times it shows you as options. For example, if you've already
            // entered 5:00 PM in your #from input and then you go over to the #to input and you
            // type 4, it's going to show you 4:00 AM, 4:15 AM, 4:30 AM, 4:45 AM. This is because
            // it knows that 4 PM as a "to" value does not make sense if we're starting at "5:00 PM".
            // If you anything 5 or greater, it will default to show you PM.
            from_selector: '#from'
        });

    </script>

## Options
Here are all possible options you can pass to the plugin when you call it

    $('#from').timeAutocomplete({
        auto_complete: {}, // Any options for the jQuery ui autocomplete plugin (http://jqueryui.com/demos/autocomplete/#options)
        formatter: 'ampm' // The formatter to use. Defaults to 'ampm'
    })


## Formatters
Formatters are extensions and can be added to the plugin. Each formatter will tell us what format to expect for that specific input.
This plugin comes with two formatters out of the box: 'ampm' and 'french'. You can find them in the formatters folder.

### ampm
The 'ampm' formatter expects times to be in the following format:
* 12:00 AM
* 12:15 AM
* 12:30 AM

etc.

### french
The 'french' formatter expects times to be in the following format:
* 01h00
* 01h15
* 01h30

etc.

It's pretty easy to add your own formatter, just open up one of the example formatters and use that for a reference.

## Destroying it
If you've already set it up, you can destroy it by calling

    $('#from').data('timeAutocomplete').destroy();