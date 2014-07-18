var theremin = function() {
	"use strict";

	/** config params */
	var isTouch = 'ontouchstart' in window,
		isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;

	/** audio params */
	var context,
		oscillator,
		type = 'SINE',
		convolver,
		duration = 0,
		decay = 0;

	/** constructors */
	var Oscillator = function() {
		this.osc = context.createOscillator();  // create sound source
		this.amp = context.createGain();
		this.osc.connect(this.amp);
		this.amp.connect(context.destination);  // connect sound to speakers
		this.osc.type = isFirefox ? type.toLowerCase() : this.osc[type.toUpperCase()];
	}

	var Convolver = function() {
		this.convolver = context.createConvolver();
		this.convolver.buffer = new ImpulseResponse();
		oscillator.osc.connect(this.convolver);
		this.convolver.connect(context.destination);
	}

	var ImpulseResponse = function() {
		var sampleRate = context.sampleRate,    // audio data in sample-frames per second
			length = sampleRate * duration,     // buffer size in sample-frames
			impulse = context.createBuffer(1, length, sampleRate),   // 1 channel = mono
			channel = impulse.getChannelData(0);

		for (var i = 0; i < length; i++) {
			channel[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
		}
		return impulse;
	}

	/** methods */
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
		oscillator = new Oscillator();
		oscillator.osc.start(context.currentTime);
		modulate(e);

		if (duration)
			convolver = new Convolver();
	}

	var off = function() {
		oscillator.osc.stop(context.currentTime);
	}

	var modulate = function(e) {
		if (!oscillator) return;
		setGain(e);
		setFrequency(e);
	}

	var setGain = function(e) {
		var y = isTouch ? e.touches[0].pageY : e.clientY,
			gain = 1 - y/window.innerHeight;

		oscillator.amp.gain.value = gain;
	}

	var setFrequency = function(e) {
		var x = isTouch ? e.touches[0].pageX : e.clientX,
			frequency = (1705 * x/window.innerWidth) + 55;  // 5 octaves between A1 (55Hz) and A6 (1760Hz)  // 27.5 --> 4186

		oscillator.osc.frequency.value = Math.round(frequency);
	}

	var setWaveform = function(e) {
		type = e.target.textContent;
		console.log(type);
	}

	var setReverb = function(e) {
		duration = parseFloat(e.target.dataset.duration);
		decay = parseFloat(e.target.dataset.decay);
		console.log(e.target.textContent);
	}

	return {
		init: init
	}
}();

window.addEventListener("DOMContentLoaded", theremin.init, true);