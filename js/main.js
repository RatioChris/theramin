var theremin = function() {
	"use strict";

	var context,
		oscillator,
		type = 'SINE',
		instrument = document.querySelector("canvas"),
		gainNode;

	var init = function() {
		context = new AudioContext;
		bindEvents();
	}

	var bindEvents = function() {
		// mouse events
		instrument.addEventListener("mousedown", on, false);
		instrument.addEventListener("mouseup", off, false);
		instrument.addEventListener("mousemove", move, false);

		// touch events
		instrument.addEventListener("touchstart", on, false);
		instrument.addEventListener("touchend", off, false);
		instrument.addEventListener("touchmove", move, false);

		document.querySelector(".type").onclick = function(e) {
			setType(e);
		};


		window.addEventListener('deviceproximity', function(e) {
			console.log("value: " + e.value, "max: " + e.max, "min: " + e.min);
		});

		window.addEventListener('devicelight', function(e) {
			console.log("lux: " + e.value);
		});
	}

	var setType = function(e) {
		type = e.target.textContent.toUpperCase();
		console.log(type);
	}

	var on = function() {
		console.log('on');
		oscillator = context.createOscillator();
		oscillator.type = oscillator[type];
		gainNode = context.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(context.destination);
		oscillator.start();
	}

	var off = function() {
		console.log('off');
		oscillator.stop();
	}

	var move = function(e) {
		if (!oscillator) return;
		var horizontalPos = e.clientX;
		var verticalPos = e.clientY;
		var frequencyVal = (1705 * horizontalPos/window.innerWidth) + 55; // 5 octaves between A1 (55Hz) and A6 (1760Hz)  // 27.5 --> 4186
		var gainVal = 1 - verticalPos/window.innerHeight;
		oscillator.frequency.value = Math.round(frequencyVal);
		gainNode.gain.value = gainVal;
	}

	return {
		init: init
	}
}();

window.addEventListener("DOMContentLoaded", theremin.init, true);
