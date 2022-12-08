// Widget

(() => {
  FILE = "annoy.json";
  REFRESHPERIOD = 1 * 1000; // check every second for debug, change so 30 or 60 seconds for prod

  function draw() {
    g.drawImage(atob("GBiEAAAAAAAAAAAAAAAAAAAAAAAHAAAAAAAAAAAAAAjIAAAAAAAAAAAADMzM7AAAAAAAAAAAj/yO/AAAAAAAAAAACIz8iAAAAAAAAAAAAA78AAAAAAAAAAAAAA78iAAHAAAAAAAAAI78z8jICAAAAAAAAIz878z8z8AAAAAAAIz878z8z8AAAAAAAI7+7+7+78AAAAAADM7//////8AAAAAAz87//////8AAAAAI/87//////8AAAAAM/87//////8AAAAAI/////////8AAAAAAz////////8AAAAAADP///////8AAAAAAAM///////8AAAAAAAAz//////oAAAAAAAACMzMzMyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="), this.x, this.y);
  }

  function checkAnnoy() {
    settings = {
      act: true,
      lsd: -1,
      nxt: 0,
      itv: 7,
      itr: 8,
      wds: 9,
      wes: 13,
      dnd: 0,
      buz: ",,,"
    };

    file = require("Storage").readJSON(FILE, true) || {};
    settings = Object.assign(settings, file);

    date = Date(Date.now());

    // Check if we should start annoying according to schedule
    if (date.getDate() != settings.lsd) {
      // hasn't been started today
      isWeekend = (date.getDate() == 0 || date.getDate() == 6);
      startHour = isWeekend ? settings.wes : settings.wds;

      // If starthour is negative (shown as "Off" in settings) don't start.
      if (date.getHours() >= startHour || startHour >= 0) {
        settings.act = true;
        settings.lsd = date.getDate();
      }
    }

    // Check if we should annoy
    if (settings.act) {
      timestampSeconds = Math.round(date.getTime() / 1000);
      if (timestampSeconds > settings.nxt) {
        // Time to annoy and set next annoyance
        quietMode = (require("Storage").readJSON("setting.json", true) || {}).quiet || 0;

        if (settings.dnd >= quietMode) {
          require("buzz").pattern(settings.buz);
        }

        delay = Math.round(60 * (settings.itv + Math.random() * settings.itr)); // For testing this was changed to seconds, add * 60 for prod
        settings.nxt = timestampSeconds + delay;
      }
    }
    require("Storage").writeJSON(FILE, settings);
  }
  setInterval(checkAnnoy, REFRESHPERIOD);

  settings = require("Storage").readJSON(FILE, true);
  if (settings.act) {
    WIDGETS["annoy"] = {
      area: "tl",
      width: 24,
      draw: draw
    };
  }
})();
