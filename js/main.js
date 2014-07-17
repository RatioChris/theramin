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
		gain,
		frequency,
		convolver,
		duration = 0,
		decay = 0;

	var init = function() {
		context = new (window.AudioContext || window.webkitAudioContext)();
		bindEvents();
	}

	var bindEvents = function() {
		var stage = document.querySelector("canvas");

		if (isTouch) {
			stage.addEventListener("touchstart", on);
			stage.addEventListener("touchend", off);
			stage.addEventListener("touchmove", modulate);
			/*stage.addEventListener("touchmove", function(e) {
				e.preventDefault();
				modulate();
			});*/
		} else {
			stage.addEventListener("mouseover", on);
			stage.addEventListener("mouseout", off);
			stage.addEventListener("mousemove", modulate);
		}

		document.querySelector(".waveform").onclick = function(e) {
			setWaveform(e);
		};

		document.querySelector(".reverb").onclick = function(e) {
			setReverb(e);
		};
	}

	var on = function(e) {
		console.log('on');
		oscillator = context.createOscillator();    // create sound source (single-use entities)
		oscillator.type = isFirefox ? type.toLowerCase() : oscillator[type.toUpperCase()];

		gainNode = context.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(context.destination);  // connect sound to speakers

		if (duration) {
			convolver = context.createConvolver();
			convolver.buffer = impulseResponse(duration, decay);
			oscillator.connect(convolver);
			convolver.connect(context.destination);
		}

		oscillator.start(context.currentTime);
		modulate(e);
	}

	var off = function() {
		console.log('off');
		oscillator.stop(context.currentTime);
	}

	var modulate = function(e) {
		if (!oscillator) return;
		setGain(e);
		setFrequency(e);
	}

	var setGain = function(e) {
		y = isTouch ? e.touches[0].pageY : e.clientY;
		gain = 1 - y/window.innerHeight;
		gainNode.gain.value = gain;
	}

	var setFrequency = function(e) {
		x = isTouch ? e.touches[0].pageX : e.clientX;
		frequency = (1705 * x/window.innerWidth) + 55;  // 5 octaves between A1 (55Hz) and A6 (1760Hz)  // 27.5 --> 4186
		oscillator.frequency.value = Math.round(frequency);
	}

	var setWaveform = function(e) {
		type = e.target.textContent;
		console.log(type);
	}

	var setReverb = function(e) {
		duration = parseFloat(e.target.dataset.duration);
		decay = parseFloat(e.target.dataset.decay);
		console.log(e.target.textContent, duration, decay);
	}

	var impulseResponse = function(duration, decay) {
		var sampleRate = context.sampleRate,    // audio data in sample-frames per second
			length = sampleRate * duration,     // buffer size in sample-frames
			impulse = context.createBuffer(1, length, sampleRate),   // 1 channel = mono
			channel = impulse.getChannelData(0);

		for (var i = 0; i < length; i++) {
			channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
		}
		return impulse;
	}

	return {
		init: init
	}
}();

window.addEventListener("DOMContentLoaded", theremin.init, true);
