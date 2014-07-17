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
			stage.addEventListener("touchstart", on, false);
			stage.addEventListener("touchend", off, false);
			stage.addEventListener("touchmove", modulate, false);
			/*stage.addEventListener("touchmove", function(e) {
				e.preventDefault();
				modulate();
			}, false);*/
		} else {
			stage.addEventListener("mouseover", on, false);
			stage.addEventListener("mouseout", off, false);
			stage.addEventListener("mousemove", modulate, false);
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
		oscillator = context.createOscillator();
		oscillator.type = isFirefox ? type.toLowerCase() : oscillator[type.toUpperCase()];
		gainNode = context.createGain();
		oscillator.connect(gainNode);
		gainNode.connect(context.destination);

		if (duration > 0) {
			convolver = context.createConvolver();
			convolver.buffer = impulseResponse(duration, decay);
			oscillator.connect(convolver);
			convolver.connect(context.destination);
		}

		oscillator.start(0);
		modulate(e);
	}

	var off = function() {
		console.log('off');
		oscillator.stop(0);
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
		frequency = (1705 * x/window.innerWidth) + 55; // 5 octaves between A1 (55Hz) and A6 (1760Hz)  // 27.5 --> 4186
		oscillator.frequency.value = Math.round(frequency);
	}

	var setWaveform = function(e) {
		type = e.target.textContent;
		console.log(type);
	}

	var setReverb = function(e) {
		duration = parseFloat(e.target.dataset.duration);
		decay = parseFloat(e.target.dataset.decay);
		console.log(duration, decay);
	}

	var impulseResponse = function(duration, decay) {
		var sampleRate = context.sampleRate,
			length = sampleRate * duration,
			impulse = context.createBuffer(2, length, sampleRate),
			impulseL = impulse.getChannelData(0),
			impulseR = impulse.getChannelData(1);

		for (var i = 0; i < length; i++) {
			impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
			impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
		}
		return impulse;
	}

	return {
		init: init
	}
}();

window.addEventListener("DOMContentLoaded", theremin.init, true);
