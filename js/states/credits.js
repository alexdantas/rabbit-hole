/**
 * Credits screen, shows some info on the game.
 *
 * Has static text, links and if any key is pressed
 * it goes back to the main menu.
 */

/*global game,me*/

game.CreditsState = me.ScreenObject.extend({

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
			},

			update : function(dt) {
				// This will make it redraw every frame
				return true;
			},

			draw : function(context) {

				var xoffset = game.half_tile(10);

				me.game.font.draw(
					context,
					"RABBIT HOLE CREDITS",
					game.tile(3),
					game.tile(1)
				);

				me.game.font.draw(
					context,
					"DEVELOPER:    ALEXANDRE DANTAS",
					game.tile(0),
					game.tile(3)
				);

				me.game.font.draw(
					context,
					"DESIGNER:     NATALIA CRISTINA",
					game.tile(0),
					game.tile(4)
				);
				me.game.font.draw(
					context,
					"GAME MADE FOR THE LUDUMDARE 29",
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


		// If any key is pressed, go back
		// to the Main Menu
		this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
			me.state.change(me.state.STATE_MAIN_MENU);
		});
	},

	/**
	 * Action to perform when leaving the state (state change).
	 */
	onDestroyEvent : function() {
		me.event.unsubscribe(this.handler);
	}
});



