const defaultOptions = {
  from_selector: "",
  increment: 15,
  start_hour: 0,
  end_hour: 24,
  pm_text: "PM",
  am_text: "AM",
  blur_empty_populate: true,
  times: [], // over-ride if not using built-in populator
  empty: {
    h: "12",
    m: "00",
    sep: ":",
    postfix: " PM"
  }
};

const parse = (time, format, options = defaultOptions) => {
  var hour,
    minute,
    format = format || "H:i:s",
    pm = time.match(/p/i) !== null,
    am = time.match(/a/i) !== null,
    num = time.replace(/[^0-9]/g, "");

  // Parse for hour and minute
  switch (num.length) {
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
      hour = parseInt(num.charAt(0) + (num.charAt(1) || ""), 10);
      minute = 0;
      break;
    default:
      return "";
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
  if (hour <= 0) {
    hour = 0;
  }

  if (hour >= 24 && ("" + hour + "").length == 2) {
    var parts = ("" + hour + "").split("");
    hour = parseInt(parts[0], 10);
    minute = parseInt(parts[1], 10);
    if (minute < 6) {
      minute = minute + "0";
    }
  }

  if (minute < 0 || minute > 59) {
    minute = 0;
  }

  if (hour >= 13 && hour <= 23) {
    pm = true;
  }

  return (
    format
      // 12 hour without leading 0
      .replace(/g/g, hour === 0 ? "12" : "g")
      .replace(/g/g, hour > 12 ? hour - 12 : hour)
      // 12 hour with leading 0
      .replace(
        /h/g,
        hour.toString().length > 1
          ? hour > 12
            ? hour - 12
            : hour
          : "0" + (hour > 12 ? hour - 12 : hour)
      )
      // 24 hour with leading 0
      .replace(/H/g, hour.toString().length > 1 ? hour : "0" + hour)
      // minutes with leading zero
      .replace(/i/g, minute.toString().length > 1 ? minute : "0" + minute)
      // simulate seconds
      .replace(/s/g, "00")
      // lowercase am/pm
      .replace(/A/g, pm ? options.pm_text : options.am_text)
  );
};
export default parse;
