/**
 * HUDs (Head-Up Displays) show information to the
 * user above the actual game screen.
 *
 * For example, health, score, items and such...
 *
 * Each HUD shows a single information.
 * So we have a global container of HUDs, on which
 * we individually add each one to build the final
 * appearance.
 */

/*global game,me,friends*/

// Here we make sure to create only if it wasn't
// already created before
game.HUD = game.HUD || {};

/**
 * Container for all the HUDs on the game.
 */
game.HUD.Container = me.ObjectContainer.extend({

	init : function() {
		this.parent();

		// Persistent across level changes
		this.isPersistent = true;

		// Non collidable
		this.collidable = false;

		// Makes sure to always draw on top of everything
		this.z = Infinity;

		// Give a cute name
		// NOTE: What for?
		this.name = "HUD";

		// Score HUD: Shows current score
		// Adding it at the right-bottom position
		this.addChild(
			new game.HUD.score(
				me.game.viewport.width,
				me.game.viewport.height - 16
			)
		);

		// Friends HUD: Shows how many friends are
		//              waiting to be rescued.
		this.addChild(
			new game.HUD.friends(
				me.game.viewport.width,
				me.game.viewport.height - 32
			)
		);
	}
});

/**
 * Shows the current score.
 */
game.HUD.score = me.Renderable.extend({

	init : function(x, y) {

		// Call the parent constructor
		// (size does not matter here)
		this.parent(new me.Vector2d(x, y), 10, 10);

		// Won't use the global font because to draw
		// the score it needs to be aligned to the right
		this.font = new me.BitmapFont("font16x16", 16);
		this.font.set("right");

		// Local copy of the global score
		this.score = -1;

		// Make sure we use screen coordinates
		// (not relative)
		this.floating = true;
	},

	/**
	 * Called every frame to update the object.
	 *
	 * @note If it returns `false`, will not redraw
	 *       on the screen.
	 *       Good for optimizations.
	 */
	update : function() {

		// To avoid redrawing the HUD every frame,
		// we'll only return `true` if the score changed.
		if (this.score !== game.data.score) {
			this.score = game.data.score;
			return true;
		}
		return false;
	},

	/**
	 * Draw the score
	 */
	draw : function(context) {
		this.font.draw(context, game.data.score, this.pos.x, this.pos.y);
	}
});

/**
 * Shows how many friends do we need to rescue.
 */
game.HUD.friends = me.Renderable.extend({

	init : function(x, y) {

		// Call the parent constructor
		// (size does not matter here)
		this.parent(new me.Vector2d(x, y), 10, 10);

		// Won't use the global font because to draw
		// the score it needs to be aligned to the right
		this.font = new me.BitmapFont("font16x16", 16);
		this.font.set("right");

		// Local copy of how many friends are remaining
		this.remainingFriends = 0;

		// Make sure we use screen coordinates
		// (not relative)
		this.floating = true;
	},

	/**
	 * Called every frame to update the object.
	 *
	 * @note If it returns `false`, will not redraw
	 *       on the screen.
	 *       Good for optimizations.
	 */
	update : function() {

		// To avoid redrawing the HUD every frame,
		// we'll only return `true` if the remaining
		// friends changed.
		if (this.remainingFriends !== friends.remaining()) {
			this.remainingFriends = friends.remaining();
			return true;
		}
		return false;
	},

	/**
	 * Draws how many friends are remaining.
	 */
	draw : function(context) {
		var message = ((this.remainingFriends === 0) ?
					   "" :
					   "REMAINING: " + this.remainingFriends);

		this.font.draw(context, message, this.pos.x, this.pos.y);
	}
});

