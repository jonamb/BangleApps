// App

FILE = "annoy.json";
settings = require("Storage").readJSON(FILE, true);

if (settings.act) {
  settings.act = false;
  Bangle.buzz(320);
  require("Storage").writeJSON(FILE, settings);
} else {
  settings.act = true;
  delay = 60 * (settings.itv + Math.random() * settings.itr);
  settings.nxt = Math.round(Date.now() / 1000 + delay);
  require("Storage").writeJSON(FILE, settings);
  require("buzz").pattern(settings.buz).then(() => {Bangle.showClock;});
}
setTimeout(Bangle.showClock, 350);
