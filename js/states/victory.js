/**
 * Victory screen, when the player beat the game.
 */

/*global game,me*/

game.VictoryState = me.ScreenObject.extend({

	/**
	 * Runs when entering the state.
	 */
	onResetEvent : function() {

		// Creating the static text
		me.game.world.addChild(new (me.Renderable.extend ({

			init : function() {
				// Embracing all the screen size
				this.parent(new me.Vector2d(0, 0),
				            me.game.viewport.width,
				            me.game.viewport.height);

				// Resetting player to the first level
				game.data.currentLevel = "area00";

				me.save.beatGame = me.save.beatGame + 1;
			},

			update : function(dt) {
				// This will make it redraw every frame
				return true;
			},

			draw : function(context) {

				var xoffset = game.half_tile(10);

				me.game.font.draw(
					context,
					"YOU WON!",
					game.tile(3),
					game.tile(1)
				);

				me.game.font.draw(
					context,
					"CECI RESCUED ALL HER FRIENDS",
					game.tile(0),
					game.tile(3)
				);

				me.game.font.draw(
					context,
					"THEY'RE THROWING A BIG PARTY",
					game.tile(0),
					game.tile(4)
				);
				me.game.font.draw(
					context,
					"YOU'RE AWESOME",
					game.tile(0),
					game.tile(6)
				);

				me.game.font.draw(
					context,
					"PRESS ANY KEY TO GO BACK",
					game.tile(0),
					me.game.viewport.height - game.half_tile(1)
				);
			}
		})));


		// When we press any key or click/tap, will return to the
		// main menu.
		//
		// But we don't want to check for that immediately, since the
		// user might be banging his head on the keyboard when he dies.
		//
		// So we'll create a timeout (in milliseconds).
		// When it happens, we'll look out for keypress events.
		me.timer.setTimeout(me.state.current().watchForKeypresses, 1500);
	},

	/**
	 * Starts monitoring user's keypresses.
	 *
	 * @note This function is called independently
	 *       of the object existing!
	 *       That's why we access ourselves with
	 *       `me.state.current()` instead of `this`
	 */
	watchForKeypresses : function() {

		// Here we're making the click/tap event seem like the key ENTER
		me.input.bindKey(me.input.KEY.ENTER, "enter", true);
		me.input.bindPointer(me.input.mouse.LEFT, me.input.KEY.ENTER);

		// This way, for any key pressed (or click/tap),
		// we'll go to the main menu
		me.state.current().handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
			me.state.change(me.state.STATE_MAIN_MENU);
		});
	},

	/**
	 * Action to perform when leaving the state (state change).
	 */
	onDestroyEvent : function() {
		me.input.unbindKey(me.input.KEY.ENTER);
		me.input.unbindPointer(me.input.mouse.LEFT);
		me.event.unsubscribe(this.handler);
	}
});

