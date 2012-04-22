// Based on Caleb Troughton's original [MooSwipe](http://mootools.net/forge/p/mooswipe)
// and extended to support swipes up and down.
var MooSwipe = MooSwipe || new Class({
	Implements: [Options, Events],

	options: {
		tolerance: 20,
		preventDefaults: true
	},

	element: null,
	startX: null,
	startY: null,
	isMoving: false,

	initialize: function(el, options){
		this.setOptions(options);
		this.element = $(el);
		this.element.addListener('touchstart', this.onTouchStart.bind(this));
	},

	cancelTouch: function(){
		this.element.removeListener('touchmove', this.onTouchMove);
		this.startX = null;
		this.startY = null;
		this.isMoving = false;
	},

	onTouchMove: function(e){
		if(this.options.preventDefaults){
			e.preventDefault();
		}
		if(this.isMoving){
			var x  = e.touches[0].pageX,
			    y  = e.touches[0].pageY,
			    dx = this.startX - x,
			    dy = this.startY - y;
			if(Math.abs(dx) >= this.options.tolerance){
				this.cancelTouch();
				this.fireEvent(dx > 0 ? 'swipeLeft' : 'swipeRight');
				this.fireEvent('swipe', dx > 0 ? 'left' : 'right');
			}
			if(Math.abs(dy) >= this.options.tolerance){
				this.cancelTouch();
				this.fireEvent(dy > 0 ? 'swipeUp' : 'swipeDown');
				this.fireEvent('swipe', dy > 0 ? 'up' : 'down');
			}
		}
	},

	onTouchStart: function(e){
		if(e.touches.length == 1){
			this.startX = e.touches[0].pageX;
			this.startY = e.touches[0].pageY;
			this.isMoving = true;
			this.element.addListener('touchmove', this.onTouchMove.bind(this));
		}
	}
});