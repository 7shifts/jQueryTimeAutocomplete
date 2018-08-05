import parse from "../../src/core/AMPMParser";

test("should parse any time into H:i:s format", () => {
  var cases = {
    "01:00pm": "13:00:00",
    "12am": "00:00:00",
    "12 a": "00:00:00",
    "123 am": "01:23:00",
    "13": "13:00:00",
    "2330": "23:30:00",
    "2:3": "23:00:00",
    "2:15am": "02:15:00",
    "15:30am": "15:30:00",
    "6:30 PM": "18:30:00",
    "6:60 PM": "18:00:00",
    "25:60 PM": "02:50:00",
    "83": "08:30:00",
    "27": "02:07:00",
    "33": "03:30:00"
  };

  for (var k in cases) {
    expect(parse(k)).toBe(cases[k]);
  }
});

test("should parse any time into g:i A format", () => {
  var cases = {
    "01:00pm": "1:00 PM",
    "12am": "12:00 AM",
    "12 a": "12:00 AM",
    "123 am": "1:23 AM",
    "13": "1:00 PM",
    "2330": "11:30 PM",
    "2:3": "11:00 PM",
    "2:15am": "2:15 AM",
    "15:30am": "3:30 PM",
    "6:30 PM": "6:30 PM",
    "12:60 PM": "12:00 PM",
    "25:60 PM": "2:50 PM",
    "83 PM": "8:30 PM",
    "27 PM": "2:07 PM",
    "33 PM": "3:30 PM",
    "23": "11:00 PM",
    "00": "12:00 AM",
    "12": "12:00 PM"
  };

  for (var k in cases) {
    expect(parse(k, "g:i A")).toEqual(cases[k]);
  }
});
