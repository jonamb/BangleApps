// annset Page

/*
annset:
intv (Interfal: interval between buzzes in ms)
intvRnd (IntervalRandom: ammount of ms added to interval randomly, set 0 for fixed)
wds (WeekdayStart: At which time should the automatic annoy start Mo-Fr)
wes (WeekendStart:At which time should the automatic annoy start Sa-Su)
dnd (DoNotDisturb: 0: never during quiet mode, 1: if quiet/alarm mode, 2: always buzz, mode inannset: Quiet: 2, Alarms: 1, Normal: 0)
buz (Buzz pattern from buzz_menu)
Variables:
act (Active: should you annoy)
lsd (LastStartDay: Last day of the month annoy was activated to not activate twice per day)
nxt (Next: Timestamp (in seconds) when to next annoy)
*/
(function(back) {
  var FILE = "annoy.json";
  var dndChoices = ["Always", "Alarm", "Never"];
  var annset = Object.assign({
      // Default values
      act: false,
      itv: 7,
      itr: 8,
      wds: -1,
      wes: -1,
      dnd: 0,
      buz: "::",
    },
    require("Storage").readJSON(FILE, true) || {});

  function writeannset() {
    require("Storage").writeJSON(FILE, annset);
  }

  E.showMenu({
    "": {
      "title": "Annoy"
    },
    "< Back": () => back(),
    "Interval": {
      value: annset.itv,
      min: 1,
      max: 30,
      onchange: v => {
        annset.itv = v;
        writeannset();
      },
      format: v => v + "min",
    },
    "Add Randomness": {
      value: annset.itr,
      min: 0,
      max: 30,
      onchange: v => {
        annset.itr = v;
        writeannset();
      },
      format: v => v + "min",
    },
    "Buzz": require("buzz_menu").pattern(annset.buz, v => {
      annset.buz = v;
      writeannset();
    }),
    "Weekday Start Hour": {
      value: annset.wds,
      min: -1,
      max: 23,
      wrap: true,
      onchange: v => {

        annset.wds = v;
        writeannset();
      },
      format: v => v >= 0 ? v + "h" : "Off",
    },
    "Weekend Start Hour": {
      value: annset.wes,
      min: -1,
      max: 23,
      wrap: true,
      onchange: v => {
        annset.wes = v;
        writeannset();
      },
      format: v => v >= 0 ? v + "h" : "Off",
    },
    "Follow DND": {
      value: annset.dnd,
      min: 0,
      max: 2,
      format: v => dndChoices[v],
      onchange: v => {
        annset.dnd = v;
        writeannset();
      }
    },
    "Active": {
      value: !!annset.act,
      min: 0,
      max: 1,
      onchange: v => {
        annset.act = v;
        writeannset();
      },
    },
  });
})
