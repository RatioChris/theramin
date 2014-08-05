(function() {
	"use strict";

	/** config params */
	var isTouch = 'ontouchstart' in window;

	/** audio params */
	var context,
		oscillator,
		type = 'sine',
		convolver,
		duration = 0,
		decay = 0,
		tremolo = 0,
		vibrato = 0,
		tremoloFrame,
		vibratoFrame;

	/** constructors */
	var Oscillator = function() {
		this.osc = context.createOscillator();  // create sound source
		this.osc.type = type;
		this.amp = context.createGain();
		this.osc.connect(this.amp);
		this.amp.connect(context.destination);  // connect sound to speakers
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
			data = impulse.getChannelData(0);

		for (var i = 0; i < length; i++) {
			data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
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
			document.addEventListener("touchmove",function(e) {
				e.preventDefault(); // prevent elastic scroll on iOS
			});
			stage.addEventListener("touchstart", on);
			stage.addEventListener("touchend", off);
			stage.addEventListener("touchmove", modulate);
		} else {
			stage.addEventListener("mouseover", on);
			stage.addEventListener("mouseout", off);
			stage.addEventListener("mousemove", modulate);
		}

		document.querySelector(".waveform").onclick = function(e) {
			setWaveform(e);
		};
		document.querySelector(".tremolo").onclick = function(e) {
			setTremolo(e);
		};
		document.querySelector(".vibrato").onclick = function(e) {
			setVibrato(e);
		};
		document.querySelector(".reverb").onclick = function(e) {
			setReverb(e);
		};
	}

	var on = function(e) {
		oscillator = new Oscillator();
		oscillator.osc.start(context.currentTime);
		modulate(e);

		if (duration && decay)
			convolver = new Convolver();

		if (tremolo)
			shapeTremolo();

		if (vibrato)
			shapeVibrato();
	}

	var off = function() {
		oscillator.osc.stop(context.currentTime);

		cancelAnimationFrame(tremoloFrame);
		cancelAnimationFrame(vibratoFrame);
	}

	var modulate = function(e) {
		if (!oscillator) return;
		setGain(e);
		setFrequency(e);
	}

	var setGain = function(e) {
		var y = isTouch ? e.touches[0].pageY : e.clientY,
			val = 1 - y/window.innerHeight;

		oscillator.amp.gain.value = val;
	}

	var setFrequency = function(e) {
		var x = isTouch ? e.touches[0].pageX : e.clientX,
			val = (1705 * x/window.innerWidth) + 55;  // 5 octaves between A1 (55Hz) and A6 (1760Hz)  // 27.5 --> 4186

		oscillator.osc.frequency.value = Math.round(val);
	}

	var setWaveform = function(e) {
		type = e.target.textContent;
		console.log('waveform: ' + type);
	}

	var setReverb = function(e) {
		duration = parseFloat(e.target.dataset.duration);
		decay = parseFloat(e.target.dataset.decay);
		console.log('reverb: ' + e.target.textContent);
	}

	var setTremolo = function(e) {
		tremolo = parseFloat(e.target.dataset.tremolo);
		console.log('tremolo: ' + e.target.textContent);
	}

	var setVibrato = function(e) {
		vibrato = parseFloat(e.target.dataset.vibrato);
		console.log('vibrato: ' + e.target.textContent);
	}

	var shapeTremolo = function() {
		var gain = oscillator.amp.gain.value,
			val = gain + (Math.sin(context.currentTime * tremolo) * .25);

		console.log(gain, val);
		oscillator.amp.gain.value = val;
		tremoloFrame = requestAnimationFrame(shapeTremolo);
	}

	var shapeVibrato = function() {
		var freq = oscillator.osc.frequency.value,
			val = freq + (Math.sin(context.currentTime * 20) * vibrato);

		oscillator.osc.frequency.value = val;
		vibratoFrame = requestAnimationFrame(shapeVibrato);
	}

	window.addEventListener("DOMContentLoaded", init, true);
}());