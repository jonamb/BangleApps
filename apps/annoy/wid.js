// Widget

(() => {
  FILE = "annoy.json";
  REFRESHPERIOD = 1 * 1000; // check every second for debug, change so 30 or 60 seconds for prod

  function draw() {
    g.drawImage(atob("GBiEAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAjIAAAAAAAAAAAADMzM7AAAAAAAAAAAj/yO/AAAAAAAAAAACIz8iAAAAAAAAAAAAA78AAAAAAAAAAAAAA78iAAHAAAAAAAAAI78z8jICAAAAAAAAIz878z8z8AAAAAAAIz878z8z8AAAAAAAI7+7+7+78AAAAAADM7//////8AAAAAAz87//////8AAAAAI/87//////8AAAAAM/87//////8AAAAAI/////////8AAAAAAz////////8AAAAAADP///////8AAAAAAAM///////8AAAAAAAAz//////oAAAAAAAACMzMzMyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), this.x, this.y);
  }

  function checkAnnoy() {
    annset = {
      act: true,
      lsd: -1,
      nxt: 0,
      itv: 7,
      itr: 8,
      wds: -1,
      wes: -1,
      dnd: 0,
      buz: ",,,"
    };

    file = require("Storage").readJSON(FILE, true) || {};
    annset = Object.assign(annset, file);

    date = Date(Date.now());

    // Check if we should start annoying according to schedule
    if (date.getDate() != annset.lsd) {
      // hasn't been started today
      isWeekend = (date.getDate() == 0 || date.getDate() == 6);
      startHour = isWeekend ? annset.wes : annset.wds;

      // If starthour is negative (shown as "Off" in annset) don't start.
      if (date.getHours() >= startHour || startHour >= 0) {
        annset.act = true;
        annset.lsd = date.getDate();
      }
    }

    // Check if we should annoy
    if (annset.act) {
      timestampSeconds = Math.round(date.getTime() / 1000);
      if (timestampSeconds > annset.nxt) {
        // Time to annoy and set next annoyance
        quietMode = (require("Storage").readJSON("setting.json", true) || {}).quiet || 0;

        if (annset.dnd >= quietMode) {
          require("buzz").pattern(annset.buz);
        }

        delay = Math.round(60 * (annset.itv + Math.random() * annset.itr)); // For testing this was changed to seconds, add * 60 for prod
        annset.nxt = timestampSeconds + delay;
      }
    }
    require("Storage").writeJSON(FILE, annset);
  }
  setInterval(checkAnnoy, REFRESHPERIOD);

  annset = require("Storage").readJSON(FILE, true);
  if (annset.act) {
    WIDGETS["annoy"] = {
      area: "tl",
      width: 24,
      draw: draw
    };
  }
})();
