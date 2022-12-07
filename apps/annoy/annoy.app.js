// App

FILE = "annoy.settings.json";
settings = require("Storage").readJSON(FILE, true);

if (settings.act) {
  settings.act = false;
  Bangle.buzz(320);
} else {
  settings.act = true;
  delay = 60 * (settings.itv + Math.random() * settings.itr);
  settings.nxt = Math.round(Date.now() / 1000 + delay);
  Bangle.buzz(80);
  setTimeout(Bangle.buzz, 150, 80);
  setTimeout(Bangle.buzz, 300, 80);
}
require("Storage").writeJSON(FILE, settings);
setTimeout(Bangle.showClock, 350);