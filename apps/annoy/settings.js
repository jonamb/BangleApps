// Settings Page

/*
Settings:
intv (Interfal: interval between buzzes in ms)
intvRnd (IntervalRandom: ammount of ms added to interval randomly, set 0 for fixed)
wds (WeekdayStart: At which time should the automatic annoy start Mo-Fr)
wes (WeekendStart:At which time should the automatic annoy start Sa-Su)
dnd (DoNotDisturb: 0: never during quiet mode, 1: if quiet/alarm mode, 2: always buzz)

Variables:
act (Active: should you annoy)
lsd (LastStartDay: Last day of the month annoy was activated to not activate twice per day)
nxt (Next: Timestamp (in seconds) when to next annoy)

*/
(function(back) {
  var FILE = "annoy.json";
  var dndChoices = ["Always", "Alarm", "Never"];
  var settings = Object.assign({
      // Default values
      act: false,
      itv: 7,
      itr: 8,
      wds: 9,
      wes: 13,
      dnd: 0
    },
    require("Storage").readJSON(FILE, true) || {});

  function writeSettings() {
    require("Storage").writeJSON(FILE, settings);
  }

  E.showMenu({
    "": {
      "title": "Annoy"
    },
    "< Back": () => back(),
    "Active": {
      value: !!settings.act,
      min: 0,
      max: 1,
      onchange: v => {
        settings.act = v;
        writeSettings();
      },
      // format: v => v ? "Active" : "Inactive",
    },
    "Interval": {
      value: settings.itv,
      min: 1,
      max: 30,
      onchange: v => {
        settings.itv = v;
        writeSettings();
      },
      format: v => v + "min",
    },
    "Add Randomness": {
      value: settings.itr,
      min: 0,
      max: 30,
      onchange: v => {
        settings.itr = v;
        writeSettings();
      },
      format: v => v + "min",
    },
    "Weekday Start Hour": {
      value: settings.wds,
      min: 0,
      max: 23,
      onchange: v => {
        settings.wds = v;
        writeSettings();
      },
      format: v => v + "h",
    },
    "Weekend Start Hour": {
      value: settings.wes,
      min: 0,
      max: 23,
      onchange: v => {
        settings.wes = v;
        writeSettings();
      },
      format: v => v + "h",
    },
    "Follow DND": {
      value: settings.dnd,
      min: 0,
      max: 2,
      format: v => dndChoices[v],
      onchange: v => {
        settings.dnd = v;
        writeSettings();
      },
    },
  });
})
