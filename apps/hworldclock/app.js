{ // must be inside our own scope here so that when we are unloaded everything disappears

// ------- Settings file
const SETTINGSFILE = "hworldclock.json";
var secondsMode;
var showSunInfo;
var colorWhenDark;
// ------- Settings file

const BANGLEJS2 = process.env.HWVERSION == 2;
const big = g.getWidth()>200;
// Font for primary time and date
const primaryTimeFontSize = big?6:5;
const primaryDateFontSize = big?3:2;
require("Font5x9Numeric7Seg").add(Graphics);
require("FontTeletext10x18Ascii").add(Graphics);

// Font for single secondary time
const secondaryTimeFontSize = 4; 
const secondaryTimeZoneFontSize = 2;

// Font / columns for multiple secondary times
const secondaryRowColFontSize = 2;
const xcol1 = 10;
const xcol2 = g.getWidth() - xcol1;

const font = "6x8";
let drag;

/* TODO: we could totally use 'Layout' here and
avoid a whole bunch of hard-coded offsets */

const xyCenter = g.getWidth() / 2;
const xyCenterSeconds = xyCenter + (big ? 85 : 68);
const yAmPm = xyCenter - (big ? 70 : 48);
const yposTime = big ? 70 : 55;
const yposTime2 = yposTime + (big ? 100 : 60);
const yposDate = big ? 135 : 95;
const yposWorld = big ? 170 : 120;

const OFFSET_TIME_ZONE = 0;
const OFFSET_HOURS = 1;

var PosInterval = 0; 

var offsets = require("Storage").readJSON("hworldclock.settings.json") || [];

//=======Sun
setting = require("Storage").readJSON("setting.json",1);
E.setTimeZone(setting.timezone); // timezone = 1 for MEZ, = 2 for MESZ
SunCalc = require("hsuncalc.js");
const LOCATION_FILE = "mylocation.json";
var rise = "read";
var set	= "...";
//var pos	 = {altitude: 20, azimuth: 135};
//var noonpos = {altitude: 37, azimuth: 180};
//=======Sun

var ampm = "AM";

// TESTING CODE
// Used to test offset array values during development.
// Uncomment to override secondary offsets value
/*
const mockOffsets = {
	zeroOffsets: [],
	oneOffset: [["UTC", 0]],
	twoOffsets: [
		["Tokyo", 9],
		["UTC", 0],
	],
	 fourOffsets: [
		["Tokyo", 9],
		["UTC", 0],
		["Denver", -7],
		["Miami", -5],
	],
};*/


// Example hworldclock.settings.json
// [["London","0"],["NY","-5"],["Denver","-6"]]


// Uncomment one at a time to test various offsets array scenarios
//offsets = mockOffsets.zeroOffsets; // should render nothing below primary time
//offsets = mockOffsets.oneOffset; // should render larger in two rows
//offsets = mockOffsets.twoOffsets; // should render two in columns
//offsets = mockOffsets.fourOffsets; // should render in columns

// END TESTING CODE
 

// Load settings
function loadMySettings() {
	// Helper function default setting
	function def (value, def) {return value !== undefined ? value : def;}

	var settings = require('Storage').readJSON(SETTINGSFILE, true) || {};
	secondsMode = def(settings.secondsMode, "when unlocked");
	showSunInfo = def(settings.showSunInfo, true);
	colorWhenDark = def(settings.colorWhenDark, "green");
}


// Check settings for what type our clock should be
var _12hour = (require("Storage").readJSON("setting.json",1)||{})["12hour"]||false;

// timeout used to update every minute
var drawTimeout;
var drawTimeoutSeconds;
var secondsTimeout;

g.setBgColor(g.theme.bg);

// schedule a draw for the next minute
function queueDraw() {
	if (drawTimeout) clearTimeout(drawTimeout);
		drawTimeout = setTimeout(function() {
			drawTimeout = undefined;
			draw();
		}, 60000 - (Date.now() % 60000));
}

// schedule a draw for the next second
function queueDrawSeconds() {
	if (drawTimeoutSeconds) clearTimeout(drawTimeoutSeconds);
		drawTimeoutSeconds = setTimeout(function() {
			drawTimeoutSeconds = undefined;
			drawSeconds();
			//console.log("TO: " + secondsTimeout);
		}, secondsTimeout - (Date.now() % secondsTimeout));
}

function doublenum(x) {
	return x < 10 ? "0" + x : "" + x;
}

function getCurrentTimeFromOffset(dt, offset) {
	return new Date(dt.getTime() + offset * 60 * 60 * 1000);
}

function updatePos() {
	coord = require("Storage").readJSON(LOCATION_FILE,1)||  {"lat":0,"lon":0,"location":"-"}; //{"lat":53.3,"lon":10.1,"location":"Pattensen"};
	if (coord.lat != 0 && coord.lon != 0) {
	//pos = SunCalc.getPosition(Date.now(), coord.lat, coord.lon);	
	times = SunCalc.getTimes(Date.now(), coord.lat, coord.lon);
	rise = "^" + times.sunrise.toString().split(" ")[4].substr(0,5);
	set	= "v" + times.sunset.toString().split(" ")[4].substr(0,5);
	//noonpos = SunCalc.getPosition(times.solarNoon, coord.lat, coord.lon);
	} else {
		rise = null;
		set  = null;
	}
}


function drawSeconds() {
	// get date
	let d = new Date();
	let da = d.toString().split(" ");

	// default draw styles
	g.reset().setBgColor(g.theme.bg).setFontAlign(0, 0);

	// draw time
	let time = da[4].split(":");
	let seconds = time[2];

	g.setFont("5x9Numeric7Seg",primaryTimeFontSize - 3);
	if (g.theme.dark) {
		if (colorWhenDark == "green") {
			g.setColor("#22ff05");
		} else {
			g.setColor(g.theme.fg);
		}
	} else {
		g.setColor(g.theme.fg);
	}
	//console.log("---");
	//console.log(seconds);
	if (Bangle.isLocked() && secondsMode != "always") seconds = seconds.slice(0, -1) + ':::'; // we use :: as the font does not have an x
	//console.log(seconds);
	g.drawString(`${seconds}`, xyCenterSeconds, yposTime+14, true); 
	queueDrawSeconds();

}

function draw() {
	// get date
	let d = new Date();
	let da = d.toString().split(" ");

	// default draw styles
	g.reset().setBgColor(g.theme.bg).setFontAlign(0, 0);

	// draw time
	let time = da[4].split(":");
	let hours = time[0],
	minutes = time[1];
	
	
	if (_12hour){
		//do 12 hour stuff
		if (hours > 12) {
			ampm = "PM";
			hours = hours - 12;	
			if (hours < 10) hours = doublenum(hours);	
		} else {
			ampm = "AM";	 
		}	 
	}	

	//g.setFont(font, primaryTimeFontSize);
	g.setFont("5x9Numeric7Seg",primaryTimeFontSize);
	if (g.theme.dark) {
		if (colorWhenDark == "green") {
			g.setColor("#22ff05");
		} else {
			g.setColor(g.theme.fg);
		}
	} else {
		g.setColor(g.theme.fg);
	}
	g.drawString(`${hours}:${minutes}`, xyCenter-10, yposTime, true);
	
	// am / PM ?
	if (_12hour){
	//do 12 hour stuff
		//let ampm = require("locale").medidian(new Date()); Not working
		g.setFont("Vector", 17);
		g.drawString(ampm, xyCenterSeconds, yAmPm, true);
	}	

	if (secondsMode != "none") drawSeconds(); // To make sure...
	
	// draw Day, name of month, Date	
	//DATE
	let localDate = require("locale").date(new Date(), 1);
	localDate = localDate.substring(0, localDate.length - 5);
	g.setFont("Vector", 17);
	g.drawString(require("locale").dow(new Date(), 1).toUpperCase() + ", " + localDate, xyCenter, yposDate, true);

	g.setFont(font, primaryDateFontSize);
	// set gmt to UTC+0
	let gmt = new Date(d.getTime() + d.getTimezoneOffset() * 60 * 1000);

	// Loop through offset(s) and render
	offsets.forEach((offset, index) => {
	dx = getCurrentTimeFromOffset(gmt, offset[OFFSET_HOURS]);
	hours = doublenum(dx.getHours());
	minutes = doublenum(dx.getMinutes());


	if (offsets.length === 1) {
		let date = [require("locale").dow(new Date(), 1), require("locale").date(new Date(), 1)];	
		// For a single secondary timezone, draw it bigger and drop time zone to second line
		const xOffset = 30;
		g.setFont(font, secondaryTimeFontSize).drawString(`${hours}:${minutes}`, xyCenter, yposTime2, true);
		g.setFont(font, secondaryTimeZoneFontSize).drawString(offset[OFFSET_TIME_ZONE], xyCenter, yposTime2 + 30, true);

		// draw Day, name of month, Date
		g.setFont(font, secondaryTimeZoneFontSize).drawString(date, xyCenter, yposDate, true);
	} else if (index < 3) {
		// For > 1 extra timezones, render as columns / rows
		g.setFont(font, secondaryRowColFontSize).setFontAlign(-1, 0);
		g.drawString(
			offset[OFFSET_TIME_ZONE],
			xcol1,
			yposWorld + index * 15,
			true
		);
		g.setFontAlign(1, 0).drawString(`${hours}:${minutes}`, xcol2, yposWorld + index * 15, true);
	}
	});

	if (showSunInfo) {
		if (rise != null){
			g.setFontAlign(-1, 0).setFont("Vector",12).drawString(`${rise}`, 10, 3 + yposWorld + 3 * 15, true); // draw rise
			g.setFontAlign(1, 0).drawString(`${set}`, xcol2, 3 + yposWorld + 3 * 15, true); // draw set
		} else {
			g.setFontAlign(-1, 0).setFont("Vector",11).drawString("set city in \'my location\' app!", 10, 3 + yposWorld + 3 * 15, true); 
		}
	}
	//debug settings
	//g.setFontAlign(1, 0);
	//g.drawString(secondsMode, xcol2, 3 + yposWorld + 3 * 15, true);
	//g.drawString(showSunInfo, xcol2, 3 + yposWorld + 3 * 15, true);
	//g.drawString(colorWhenDark, xcol2, 3 + yposWorld + 3 * 15, true);

	queueDraw();
	
	if (secondsMode != "none") queueDrawSeconds();
}

// clean app screen
g.clear();

// Init the settings of the app
loadMySettings();

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of the clock app
    if (PosInterval) clearInterval(PosInterval);
    PosInterval = undefined;
    if (drawTimeoutSeconds) clearTimeout(drawTimeoutSeconds);
    drawTimeoutSeconds = undefined;
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;	
  }});
Bangle.loadWidgets();
Bangle.drawWidgets();


// draw immediately at first, queue update
draw();



function initDragEvents() {
	
if (BANGLEJS2) { 	
	Bangle.on("drag", e => {
		if (!drag) { // start dragging
			drag = {x: e.x, y: e.y};
		} else if (!e.b) { // released
			const dx = e.x-drag.x, dy = e.y-drag.y;
			drag = null;
			if (Math.abs(dx)>Math.abs(dy)+10) {
				// horizontal
				if (dx < dy) {
					// for later purpose
				} else {
					// for later purpose
				}
			} else if (Math.abs(dy)>Math.abs(dx)+10) {
				// vertical
				if (dx < dy) { //down
					g.clear().setRotation(0);
					draw();
					Bangle.loadWidgets();
					Bangle.drawWidgets();
				} else {
					g.clear().setRotation(2);
					draw();
					Bangle.loadWidgets();
					Bangle.drawWidgets();
				}
			} else {
				//console.log("tap " + e.x + " " + e.y);
				if (e.x > 145 && e.y > 145) {
					// for later purpose
				}
			}
		}
	});
	} else {
			//setWatch(xxx, BTN1, { repeat: true, debounce:50 }); // maybe adding this later
			//setWatch(xxx, BTN3, { repeat: true, debounce:50 });
			//setWatch(xxx, BTN4, { repeat: true, debounce:50 });
			//setWatch(xxx, BTN5, { repeat: true, debounce:50 });
		}
}

initDragEvents();

if (!Bangle.isLocked())  { // Initial state
		if (showSunInfo) {
			if (PosInterval != 0 && typeof PosInterval != 'undefined') clearInterval(PosInterval);
			PosInterval = setInterval(updatePos, 60*10E3);	// refesh every 10 mins
			updatePos();
		}

		secondsTimeout =  1000;
		if (secondsMode != "none") {
			if (drawTimeoutSeconds) clearTimeout(drawTimeoutSeconds);
			drawTimeoutSeconds = undefined;
		}	
		if (drawTimeout) clearTimeout(drawTimeout);
		drawTimeout = undefined;
		draw(); // draw immediately, queue redraw
		
  }else{
		if (secondsMode == "always") secondsTimeout = 1000;
		if (secondsMode == "when unlocked") secondsTimeout = 10 * 1000;
		
		if (secondsMode != "none") {
			if (drawTimeoutSeconds) clearTimeout(drawTimeoutSeconds);
			drawTimeoutSeconds = undefined;
		}
		if (drawTimeout) clearTimeout(drawTimeout);
		drawTimeout = undefined;

		if (showSunInfo) {
			if (PosInterval != 0 && typeof PosInterval != 'undefined') clearInterval(PosInterval);
			PosInterval = setInterval(updatePos, 60*60E3);	// refesh every 60 mins
			updatePos();
		}
		draw(); // draw immediately, queue redraw
  }
 

Bangle.on('lock',on=>{
  if (!on) { // UNlocked
		if (showSunInfo) {
			if (PosInterval != 0) clearInterval(PosInterval);
			PosInterval = setInterval(updatePos, 60*10E3);	// refesh every 10 mins
			updatePos();
		}

		secondsTimeout =  1000;
		if (secondsMode != "none") {
			if (drawTimeoutSeconds) clearTimeout(drawTimeoutSeconds);
			drawTimeoutSeconds = undefined;
		}	
		if (drawTimeout) clearTimeout(drawTimeout);
		drawTimeout = undefined;

		draw(); // draw immediately, queue redraw
  }else{  // locked

		if (secondsMode == "always") secondsTimeout = 1000;
		if (secondsMode == "when unlocked") secondsTimeout = 10 * 1000;
		
		if (secondsMode != "none") {
			if (drawTimeoutSeconds) clearTimeout(drawTimeoutSeconds);
			drawTimeoutSeconds = undefined;
		}
		if (drawTimeout) clearTimeout(drawTimeout);
		drawTimeout = undefined;

		if (showSunInfo) {
			if (PosInterval != 0) clearInterval(PosInterval);
			PosInterval = setInterval(updatePos, 60*60E3);	// refesh every 60 mins
			updatePos();
		}
		draw(); // draw immediately, queue redraw		
  }
 });
}