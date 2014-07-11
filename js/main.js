var theremin = function() {
	"use strict";

	// params
	var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1,
		isTouch = 'ontouchstart' in window,
		x = 0,
		y = 0;

	// audio params
	var context,
		oscillator,
		type = 'SINE',
		gainNode,
		frequency,
		gain;

	var init = function() {
		context = new (window.AudioContext || window.webkitAudioContext)();
		bindEvents();
	}

	var bindEvents = function() {
		var stage = document.querySelector("canvas");

		if (isTouch) {
			stage.addEventListener("touchstart", on, false);
			stage.addEventListener("touchend", off, false);
			stage.addEventListener("touchmove", modulate, false);
		} else {
			stage.addEventListener("mouseover", on, false);
			stage.addEventListener("mouseout", off, false);
			stage.addEventListener("mousemove", modulate, false);
		}

		document.querySelector(".type").onclick = function(e) {
			setType(e);
		};
	}

	var on = function(e) {
		console.log('on');
		oscillator = context.createOscillator();
		oscillator.type = isFirefox ? type.toLowerCase() : oscillator[type.toUpperCase()];
		gainNode = context.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(context.destination);
		oscillator.start(0);
		modulate(e);
	}

	var off = function() {
		console.log('off');
		oscillator.stop(0);
	}

	var modulate = function(e) {
		if (!oscillator) return;
		setFrequency(e);
		setGain(e);
	}

	var setType = function(e) {
		type = e.target.textContent;
		console.log(type);
	}

	var setFrequency = function(e) {
		x = isTouch ? e.touches[0].pageX : e.clientX;
		frequency = (1705 * x/window.innerWidth) + 55; // 5 octaves between A1 (55Hz) and A6 (1760Hz)  // 27.5 --> 4186
		oscillator.frequency.value = Math.round(frequency);
	}

	var setGain = function(e) {
		y = isTouch ? e.touches[0].pageY : e.clientY;
		gain = 1 - y/window.innerHeight;
		gainNode.gain.value = gain;
	}

	return {
		init: init
	}
}();

window.addEventListener("DOMContentLoaded", theremin.init, true);
