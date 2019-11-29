(function(){
     class Events{
	  listeners = [];
	  
	  addEvent(el, e, fn, capture){
	    el && el.addEventListener(e, fn, capture);
	    this.listeners.push({el, fn, e})
	  }
	  destroyAll(){
	    this.listeners.forEach( l =>{
	      l.el.removeEventListener(l.e, l.fn)
	    })
	  }
	}

	function dispatchEvent(target, type, details){
		let event = new CustomEvent(type, {
			bubbles: true,
			cancelable : true,
			detail : details
		});

		target.dispatchEvent(event);
	}

	let timer = null;

	function Clock(){
		this.currentTime = this.getLocalTime();
		this.isUTC = false;
		this.events = new Events();
	}
	
	Clock.prototype.getLocalTime = function() {
		const date = new Date();
		return {
			h : date.getHours()%12 || 12,
			m : date.getMinutes(),
			s : date.getSeconds()
		}
	}

	Clock.prototype.getUTCTime = function() {
		const date = new Date();
	    return {
	    	h : date.getUTCHours()%12 || 12,
	    	m : date.getUTCMinutes(),
	    	s : date.getUTCSeconds()
	    }
	}

	Clock.prototype.getTime = function(){
		return this.currentTime;
	}

	Clock.prototype.updateTime = function(){
		if(this.isUTC){
			this.currentTime = this.getUTCTime();
		} else {
			this.currentTime = this.getLocalTime();
		}
		return this.currentTime;
	}


	Clock.prototype.startTimer = function(){
		const that = this;
		if(!timer){
			timer = setInterval(function(){
				that.updateTime();
				that.render();
			}, 1000);
		}
	}

	Clock.prototype.stopTimer = function(){
		clearInterval(timer);
		timer = null;
	}

	Clock.prototype.switchTimeZone = function(){
		this.stopTimer();
		if(this.isUTC){
			this.isUTC = false;
		} else {
			this.isUTC = true;
		}
		this.updateTime();
		this.render();
		this.startTimer();
	}

	Clock.prototype.setTime = function(utc){
		if(utc || this.isUTC){
			this.currentTime = this.getUTCTime();
		} else {
			this.currentTime = this.getLocalTime();
		}
	}

	Clock.prototype.stopClock = function(){
		if(interval){
			cancelInterval(interval);
			interval = null;
		}
	}

	Clock.prototype.getHoursInDegree = function(hours){
		const hour = this.currentTime.h;
		return Math.floor((hour/12) * 360) + (this.currentTime.m*0.5);
	}
	
	Clock.prototype.getMinutesInDegree = function(minutes){
		const minute = this.currentTime.m;
		return Math.floor((minute/60) * 360);
	}
	
	Clock.prototype.getSecondsInDegree = function(seconds){
		const second = this.currentTime.s;
		return Math.floor((second/60) * 360);
	}

	Clock.prototype.render = function(){
		new Error('Extend this class to implement method');
	}

	window.DigitalClock = (function(){

	function DigitalClock(){

		this.digitalClockElement = document.querySelector('.digitalClock');
		this.timeElm = this.digitalClockElement.querySelector('.time');
		this.buttonElement = this.digitalClockElement.querySelector('#switch');
		this.buttonElement = this.digitalClockElement.querySelector('#switch');
		this.init();
	}

	DigitalClock.prototype = new Clock();
	DigitalClock.prototype.constructor = DigitalClock;

	DigitalClock.prototype.init = function(){
		this.render(this.currentTime);
		this.events.addEvent(this.buttonElement, 'click', e => {
			e.preventDefault();
			this.switchTimeZone();
			dispatchEvent(this.buttonElement, 'utc-local-change', { isUTC : this.isUTC });
		})
		this.startTimer();
	}

	DigitalClock.prototype.render = function(time){
		//UTC is same as GMT. Ireland timezone is in GMT
		time = time || this.getTime();
		this.digitalClockElement.querySelector('.hour').innerHTML = time.h.toString().length < 2 ? `0${time.h}`:time.h;
		this.digitalClockElement.querySelector('.minutes').innerHTML = time.m.toString().length < 2 ? `0${time.m}`:time.m;
		this.digitalClockElement.querySelector('.seconds').innerHTML = time.s.toString().length < 2 ? `0${time.s}`:time.s;
		this.buttonElement.innerHTML = this.isUTC ? 'Switch to Local':'Switch to UTC';
	}

	return DigitalClock;

	})();


	window.AnalogClock = (function(){

		var interval = null;

		AnalogClock.prototype = new Clock();
		AnalogClock.prototype.constructor = AnalogClock;
		
		function AnalogClock(){
			this.clockElm = document.querySelector('.analogClock'),
			this.hourHandElm  = this.clockElm.querySelector('.hourHand');
			this.minutesHandElm = this.clockElm.querySelector('.minutesHand');
			this.secondsHandElm = this.clockElm.querySelector('.secondsHand');
			this.init();
		}

		AnalogClock.prototype.init = function(){
			this.render();
			interval = setInterval(() => {
				this.setTime();
				this.render();
			}, 1000);
			this.events.addEvent(document.body,'utc-local-change', e => {
				this.isUTC = e.detail.isUTC;
				this.setTime();
				this.render();
			})

		}

		AnalogClock.prototype.render = function(){
			this.hourHandElm.style.setProperty('--rotation', this.getHoursInDegree(this.currentTime.h));
			this.minutesHandElm.style.setProperty('--rotation', this.getMinutesInDegree(this.currentTime.m));
			this.secondsHandElm.style.setProperty('--rotation', this.getSecondsInDegree(this.currentTime.s));
		}

		return AnalogClock;

	})();
})();
