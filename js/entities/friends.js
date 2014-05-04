/**
 * All the different friends you need to rescue.
 *
 * @note We expect you to create them on Tiled
 *       with the name `friend`.
 *
 * @note Their sprite will be randomly selected
 *       from the entire spritesheet.
 *
 * @note When you define a `friend` on Tiled you're
 *       just defining where it _could_ be.
 *       For more information, scroll down to the
 *       _invalid_ flag inside _friendEntity_.
 */

/*global game,me*/

/**
 * Global counter that keeps track of:
 *
 * - How many friends are currently on the map;
 * - Which of them were rescued;
 * - how many are left.
 *
 * @note This doesn't change anything on the map.
 *       Scroll down to see how we actually
 *       define the friends.
 */
var friends = {

	/**
	 * Container with all the friend Objects currently
	 * on the game.
	 */
	_friends : [],

	/**
	 * How many friends are there on the map.
	 * @note Don't use this directly, use the functions below.
	 */
	_total : 0,

	/**
	 * Initializes the friend counter.
	 * @note Make sure to call this before the game
	 *       starts, otherwise the counter will keep
	 *       adding up!
	 */
	reset : function() {
		friends._total   = 0;
		friends._friends = [];
	},

	/**
	 * Warns that we've just added a friend
	 * on the map.
	 *
	 * @note This doesn't actually changes nothing
	 *       on the map, just a virtual counter.
	 */
	add : function(friend) {
		friends._total = friends._friends.push(friend);
	},

	/**
	 * Removes a specific friend from the map.
	 */
	remove : function(friend) {
		friends.removeAt(friends._friends.indexOf(friend));
	},

	/**
	 * Removes a friend from a specific array index.
	 */
	removeAt : function(index) {
		friends._friends[index].invalid = true;
		friends._total--;
	},

	/**
	 * Tells if all the friends were rescued.
	 */
	wereRescued : function() {
		return (friends._total == 0);
	},

	/**
	 * Tells how many friends are waiting to
	 * be rescued.
	 */
	remaining : function() {
		return friends._total;
	},

	/**
	 * Limits the currently existing amount of friends on the map.
	 *
	 * @param amount Maximum amount of friends allowed (inclusive).
	 */
	limitAmount : function(amount) {

		if (friends.remaining() <= amount)
			return;

		var deleteAmount = friends.remaining() - amount - 1; // don't remove this 1 here!
		var maxIndex     = friends.remaining() - 1;

		while (deleteAmount >= 0) {

			var i = 0;

			// Getting the first non-invalid friend
			do {

				i = Number.prototype.random(0, maxIndex);

			} while (friends._friends[i].invalid);

			// And "deleting" it
			friends.removeAt(i);
			deleteAmount--;
		}
	}
};

/**
 * Represents a single friend that the player
 * must rescue.
 *
 * @note Of utmost importance is the `invalid`
 *       flag. Check it out.
 */
game.friendEntity = me.CollectableEntity.extend({

	/**
	 * This flag tells if this friend _actually exist_.
	 *
	 * Here's the thing:
	 *   on the Tiled map we define
	 *   several places where friends COULD exist.
	 *
	 * Now, when we get to the maximum allowed
	 *   amount of friends (say, 7) the rest of them
	 *   becomes "invalid", meaning they will not exist.
	 *
	 * As a matter of fact, they're just placeholders
	 *   for possible friends
	 *   to exist.
	 */
	invalid : false,

	init : function(x, y, settings) {

		settings.image = "friends-spritesheet";

		// The collision box will be of approximately 1 tile
		// Even though each individual sprite has the following sizes:
		settings.spritewidth  = settings.width  = 43;
		settings.spriteheight = settings.height = 50;

		// Setting up parent-class stuff
		this.parent(x, y, settings);

		// Adjusting the collision box
		// (we'll count only the bottom tile)
		// var shape = this.getShape();
		// shape.pos.x = 5;
		// shape.pos.y = 6;
		// shape.resize(
		// 	32,//shape.width  - 2*shape.pos.x,
		// 	32//shape.height - 2*shape.pos.y
		// );

		// Randomly selecting this friends' sprite
		switch (Number.prototype.random(0, 6))
		{
		case 0:
			this.renderable.addAnimation("horse", [0]);
			this.renderable.setCurrentAnimation("horse");
			break;

		case 1:
			this.renderable.addAnimation("cabra", [1]);
			this.renderable.setCurrentAnimation("cabra");
			break;

		case 2:
			this.renderable.addAnimation("cat", [2]);
			this.renderable.setCurrentAnimation("cat");
			break;

		case 3:
			this.renderable.addAnimation("bear", [3]);
			this.renderable.setCurrentAnimation("bear");

		case 4:
			this.renderable.addAnimation("cat", [4]);
			this.renderable.setCurrentAnimation("cat");
			break;

		case 5:
			this.renderable.addAnimation("rabbit", [5]);
			this.renderable.setCurrentAnimation("rabbit");
			break;

		default:
			this.renderable.addAnimation("pig", [6]);
			this.renderable.setCurrentAnimation("pig");
		}

		// Warning the the global counter
		friends.add(this);
	},

	update : function(dt) {
		if (! this.invalid)
			this.parent(dt);
	},

	draw : function(context) {
		if (! this.invalid)
			this.parent(context);
	},

	// Function called by the engine when object
	// is touched by something
	onCollision : function() {

		if (this.invalid)
			return;

		// do something when collected
		game.data.score += 100;

		// make sure it can't be collected again
		this.collidable = false;

		// Warning the global counter
		friends.remove(this);

		// Not removing child from world because
		// since I'm using a `invalid` flag, I need to
		// keep accessing it
//		me.game.world.removeChild(this);

		me.audio.play("cling");
		if (friends.remaining() === 0)
			me.game.player.victory();
	}
});

