/**
 * All the different friends you need to rescue.
 *
 * @note We expect you to create them on Tiled.
 *
 * @note Their sprite will be randomly selected
 *       from the entire spritesheet
 */

/*global game,me*/

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
	},

	// Function called by the engine when object
	// is touched by something
	onCollision : function() {

		// do something when collected
		game.data.score += 100;

		// make sure it can't be collected again
		this.collidable = false;

		me.game.world.removeChild(this);
		me.audio.play("cling");
	}
});

