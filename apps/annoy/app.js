// App

FILE = "annoy.json";
annset = require("Storage").readJSON(FILE, true);

if (annset.act) {
  annset.act = false;
  require("Storage").writeJSON(FILE, annset);
  Bangle.buzz(320).then(Bangle.showClock);
} else {
  annset.act = true;
  delay = 60 * (annset.itv + Math.random() * annset.itr);
  annset.nxt = Math.round(Date.now() / 1000 + delay);
  require("Storage").writeJSON(FILE, annset);
  require("buzz").pattern(", ,").then(Bangle.showClock);
}
