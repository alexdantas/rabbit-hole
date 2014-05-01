/**
 * All the different friends you need to rescue.
 *
 * @note We expect you to create them on Tiled.
 *
 * @note Their sprite will be randomly selected
 *       from the entire spritesheet
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
	 * How many friends are there on the map.
	 * @note Don't use this directly, use the functions below.
	 */
	_total : 0,

	/**
	 * How many friends were rescued.
	 * @note Don't use this directly, use the functions below.
	 */
	_rescued : 0,

	/**
	 * Warns that we've just added a friend
	 * on the map.
	 *
	 * @note This doesn't actually changes nothing
	 *       on the map, just a virtual counter.
	 */
	add : function() {
		friends._total++;
	},

	remove : function() {
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
	}
};

game.friendEntity = me.CollectableEntity.extend({

	init : function(x, y, settings) {

		settings.image = "friends-spritesheet";

		settings.spritewidth  = settings.width  = 32;
		settings.spriteheight = settings.height = 64;

		this.parent(x, y, settings);

		// Randomly selecting this friends' sprite
		switch (Number.prototype.random(0, 5))
		{
		case 0:
			this.renderable.addAnimation("pig", [0]);
			this.renderable.setCurrentAnimation("pig");
			break;

		case 1:
			this.renderable.addAnimation("rabbit", [1]);
			this.renderable.setCurrentAnimation("rabbit");
			break;

		case 2:
			this.renderable.addAnimation("bear", [2]);
			this.renderable.setCurrentAnimation("bear");
			break;

		case 3:
			this.renderable.addAnimation("dog", [3]);
			this.renderable.setCurrentAnimation("dog");

		case 4:
			this.renderable.addAnimation("cat", [4]);
			this.renderable.setCurrentAnimation("cat");
			break;

		default:
			this.renderable.addAnimation("goat", [5]);
			this.renderable.setCurrentAnimation("goat");
		}

		// Adjusting the collision box
		// (we'll count only the bottom tile)
		var shape = this.getShape();
		shape.pos.y = 32;
		shape.resize(
			shape.width,
			32
		);

		// Warning the the global counter
		friends.add();
	},

	// Function called by the engine when object
	// is touched by something
	onCollision : function() {

		// do something when collected
		game.data.score += 100;

		// make sure it can't be collected again
		this.collidable = false;

		// Warning the global counter
		friends.remove();

		me.game.world.removeChild(this);
		me.audio.play("cling");
	}
});

