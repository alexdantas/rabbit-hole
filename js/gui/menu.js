/**
 * A (vertical) menu that can be interacted with
 * both the keyboard and mouse (and thus touch).
 *
 * Displays items that can be selected or not.
 * It automatically handles positioning, images and
 * stuff.
 *
 * All you need to do is provide item titles and callbacks.
 *
 * Example:
 *
 * var menu = new me.Menu(x, y);
 *
 * // You can add as many as you want
 * menu.addItem(
 *     "title",
 *     function() {
 *         console.log("Clicked");
 *     }
 * );
 */

/*global me game*/

/**
 * A single Menu Item.
 *
 * @note Don't create standalone Items!
 *       They're nothing without a menu to be attached to.
 *
 * Keep scrollin'.
 */
me.MenuItem = me.GUI_Object.extend({

	init : function (x, y, label, menu, callback) {

		this.select(false);

		// Sending the argument list to the parent
		// constructor
		var settings = {};
		settings.image = this.image;
		settings.spritewidth  = this.image.width;
		settings.spriteheight = this.image.height;
		this.parent(x, y, settings);

		this.label    = label;
		this.callback = callback;

		// Our big daddy
		this.menu = menu;

		// We'll randomly flip the sprite horizontally
		// and vertically, making the menu look nice
		//
		// (testing if a random number is even, 50% chance)
		if (Number.prototype.random(0, 9)%2 == 0)
			this.flipX(true);

		if (Number.prototype.random(0, 9)%2 == 0)
			this.flipY(true);

		// Make sure we use screen coordinates
		this.floating = true;

		// Putting on front of most things
		// (related to the menu z order)
		this.z = 24;
	},

	toggle : function(option) {
		this.select(! this.selected);
	},

	select : function(option) {
		this.selected = option;

		this.image = me.loader.getImage(
			((this.selected) ?
			 "menu-button-on" :
			 "menu-button-off")
		);
	},

	onClick : function (event) {

		this.callback();

		// Don't propagate the click event
		return false;
	},

	draw : function(context) {
		// Making sure the image is drawn
		this.parent(context);

		me.game.font.draw(
			context,
			this.label,
			this.pos.x + 4,
			this.pos.y + 8
		);
	}
});

/**
 * The Menu!
 *
 * Add items and such.
 */
me.Menu = me.ObjectContainer.extend({

	init : function(x, y) {

		// Occupying the whole screen (viewport)
		this.parent(x, y);

		// Not wasting CPU with this
		this.autoSort   = false;
		this.collidable = false;

		// Put at the front of most things
		this.z = 25;
	},

	/**
	 * Creates a new Menu Item.
	 */
	addItem : function(title, callback) {

		var bottom_margin = 5;

		this.addChild(new me.MenuItem(
			this.pos.x,
			this.pos.y + game.tile(this.children.length) + (this.children.length * bottom_margin),
			title,
			this,
			callback
		));
	}
});

