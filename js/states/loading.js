/**
 * My cute custom loading screen.
 *
 * Has a background image and a progress bar on the
 * bottom.
 */

/*global game,me*/

/**
 * Helper class that only draws when you call `forceDraw`.
 *
 * @param x Position on the x axis to place the image
 * @param x Position on the y axis to place the image
 * @param w Independently of the image's width, we'll stretch it to this.
 * @param h Independently of the image's width, we'll stretch it to this.
 *
 * @note I need this class because I redraw the progress bar
 *       only sometimes, while if this was a regular `SpriteObject`
 *       it would _always_ be drawn.
 *       Thus, the progress bar would never show.
 *       So I only need to draw this once - when created.
 */
var BackgroundImageThatOnlyDrawsWhenAsked = me.SpriteObject.extend({

	init : function(image, x, y, w, h) {
		this.parent(x, y, image);

		// From now on, we'll resize the image from it's
		// top-left point
		this.anchorPoint = new me.Vector2d(0, 0);

		// This resizes the image based on a ratio - here
		// we're adjusting the image to supplied `w`/`h`,
		// no matter what the image's original size is
		this.resize(
			w / this.width,
			h / this.height
		);

		this.willForceDraw = false;
	},

	draw : function(context) {

		// Only draw when I tell you to
		if (this.willForceDraw) {
			this.willForceDraw = false;
			this.parent(context);
		}
	},

	forceDraw : function() {
		this.willForceDraw = true;
	}
});


/**
 * The actual loading screen.
 */
game.CustomLoadingScreen = me.ScreenObject.extend({

	"init" : function() {
		this.parent(true);

		// Thing that keeps watching for progress
		// on the loading and calls our internal function
		// when it changes
		this.handler = null;
	},


	/**
	 * When entering the state.
	 */
	"onResetEvent" : function() {

		// Creating and adding the background image
		this.backgroundImage = new BackgroundImageThatOnlyDrawsWhenAsked(
			me.loader.getImage("loading-bg"),
			0, 0,
			me.game.viewport.width, me.game.viewport.height
		);
		this.backgroundImage.forceDraw();
		me.game.world.addChild(this.backgroundImage, 1);

		// Creating my cute progress bar.
		//
		// Remember the order of the arguments:
		// - Vector2d(x, y)
		// - w, h,
		// - Vector2d(padding x, padding y)
		//
		this.progressBar = new me.ProgressBar(
			new me.Vector2d(0,    me.video.getHeight() - game.tile(1)),
			me.video.getWidth(),  game.half_tile(1),
			new me.Vector2d(0,    2)
		);
		this.progressBar.setColors('green', 'black');
		me.game.world.addChild(this.progressBar, 1);

		// Updating the progress bar each time something
		// is loaded.
		//
		// @note When a LOADER_PROGRESS event happens, we get
		//       two arguments:
		//       - Total load percentage (number between 0 and 1)
		//       - Resource just loaded (resource Object)
		this.handler = me.event.subscribe(
			me.event.LOADER_PROGRESS,
			this.onProgressUpdate.bind(this)
		);
	},

	/**
	 * Called when the loading screen's progress changes.
	 *
	 * @note This is _not_ an automatic melonJS callback!
	 *       I set this up at the end of `onResetEvent`.
	 *
	 * @note When a `LOADER_PROGRESS` event happens, we get
	 *       two arguments:
	 *       - Total load percentage (number between 0 and 1)
	 *       - Resource just loaded (resource Object)
	 */
	"onProgressUpdate" : function(progress, res) {
		this.progressBar.onProgressUpdate(
			progress,
			"Loaded " + res.type + ": " + res.name + "..."
		);
	},

	"onDestroyEvent" : function() {
		if (this.handler !== null)
			me.event.unsubscribe(this.handler);
	}
});

