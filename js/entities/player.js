/* Player entity.
 *
 * The character you control around the game.
 *
 * Thanks:
 * - For giving a perspective on implementing variable-height jump
 *   http://gamedev.stackexchange.com/a/44766
 * - Same here (this is way easier to implement)
 *   http://documentation.flatredball.com/frb/docs/?title=Tutorials:Platforer:Variable-Height_Jumps
 * - Nice tutorial on jump physics' ideas
 *   http://poemdexter.com/blog/jump-physics-games/
 */

/*global game,me*/

// Default values for HEALTH and LIVES
// (restored at every respawn)
var defaultPlayerHealth = 5;
var defaultPlayerLives  = 3;

game.playerEntity = me.ObjectEntity.extend({

	// Constructor
	init : function(x, y, settings) {

		// Aside from the `settings` passed by Tiled
		settings.image = "player-spritesheet";

		settings.spritewidth  = settings.width  = 32;
		settings.spriteheight = settings.height = 64;

		this.parent(x, y, settings);

		// To respawn later
		this.originalPosition = new me.Vector2d(x, y);

		// Normally things outside the screen (viewport)
		// are not updated.
		// It's not the case of the player.
		this.alwaysUpdate = true;

		// Adjusting the collision rectangle to the sprite
		// (not assuming the whole image)
		var shape = this.getShape();
		shape.pos.x = 7;
		shape.resize(
			shape.width - 2*shape.pos.x,
			shape.height - 1
		);

		// Maximum speed on which we
		// throw the player up
		var maxJumpVelocity = 10;

		// Deceleration when walking and falling.
		// (it is automatically handled by melonJS)
		this.setFriction(0.65, 0);

		// Initial speed when walking
		this.setVelocity(0.9, maxJumpVelocity);

		// Maximum velocity the player can get
		// while walking.
		this.maxWalkingVelocity   = new me.Vector2d();
		this.maxWalkingVelocity.x = 3.1;
		this.maxWalkingVelocity.y = maxJumpVelocity;

		// Maximum velocity the player can get
		// while running.
		this.maxRunningVelocity   = new me.Vector2d();
		this.maxRunningVelocity.x = 5;
		this.maxRunningVelocity.y = maxJumpVelocity;

		// The absolute maximum velocity the player
		// can be at any times
		// (melonJS assures it'll never get faster than this)
		this.setMaxVelocity(
			this.maxRunningVelocity.x,
			this.maxRunningVelocity.y
		);

		// X speed must be lower than this so
		// we can apply the "standing" sprite
		// (absolute value, don't worry)
		this.standingThreshold = 0.2;

		// Animations based on a sprite sheet.
		//
		// First argument are the sprite indexes for the animation,
		// with an optional ms delay between them.
		this.renderable.addAnimation("standing", [0]);
		this.renderable.addAnimation("jumping",  [9]);
		this.renderable.addAnimation("falling",  [10]);
		this.renderable.addAnimation("walking",  [1, 2, 3, 2], 150);
		this.renderable.addAnimation("running",  [4, 5, 6, 7], 75);

		// This forces the current animation.
		//
		// Just a note, if you keep calling this every frame,
		// the animation will NOT happen.
		// You need to check first if this is the current
		// animation AND THEN calling this.
		this.renderable.setCurrentAnimation("standing");

		// Here's all the flags
		// They tell how the player is behaving _right now_
		this.standing    = true;
		this.facingLeft  = false;
		this.running     = false;
		this.invincible  = false;
		this.jumping     = false;

		// Maximum time (ms) that the user can hold
		// the jump key, thus making the player jump higher
		this.jumpTimerDelta = 150;

		// Number of seconds that holding the Jump key
		// will have effect
		this.jumpKeyReleased = false;

		this.health = defaultPlayerHealth;
		this.lives  = defaultPlayerLives;

		// Tells display to follow our position on both axis.
		me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);

		// A nice trick - save current level to
		// return to it if dead.
		// @note Saving to current session only.
		//       If you want to persistently save it,
		//       save to `me.save`
		game.data.currentLevel = me.levelDirector.getCurrentLevelId();

		// We need this flag to be sure the player's
		// "death animation" is running
		this.dying = false;

		this.type = me.game.PLAYER_OBJECT;
	},

	/**
	 * Called every frame to update the Player's internal state.
	 *
	 * @note Remember, if we return `true` we tell the engine
	 *       to redraw the player. `false` tells it to avoid
	 *       having all the work of doing that.
	 */

	update : function(delta) {

		if (! this.alive)
			return false;

		// Player's death animation is happening
		if (this.dying)
			return true;

		// // Fell into outside the screen
		// if (! this.inViewport) {
		// 	this.die();
		// 	return false;
		// }

		// Handling input

		// If player holds this key, we make the player run
		this.running = me.input.keyStatus("boost");

		this.handleJump();

		var walkedOnThisFrame = false;

		if (me.input.isKeyPressed("left")) {

			this.standing     = false;
			this.facingLeft   = true;
			walkedOnThisFrame = true;

		} else if (me.input.isKeyPressed("right")) {

			this.standing     = false;
			this.facingLeft   = false;
			walkedOnThisFrame = true;

		} else {

			// No need to make the player stop
			// (friction is handled by melonJS)

			// Sudden stop
			//this.vel.x = 0;

			if ((this.vel.x >= -this.standingThreshold) &&
				(this.vel.x <=  this.standingThreshold))
				this.standing = true;
		}

		// Secret! Don't tell anyone
		if (game.debugMode)
			this.debugUpdate();

		// Updating speed based on the previous input.
		if (! this.standing && walkedOnThisFrame) {

			var speedIncrease = this.accel.x *= me.timer.tick;

			this.vel.x += ((this.facingLeft) ?
						    -speedIncrease :
						     speedIncrease);

			// If the player is running, will achieve maximum
			// speed anyways.
			//
			// If it's only walking, we should limit the speed
			// here.
			if (! this.running) {
				this.vel.x = this.vel.x.clamp(
					-this.maxWalkingVelocity.x,
					 this.maxWalkingVelocity.x
				);
			}
		}

		// Updates and commits the animation.
		this.updateAnimation();
		this.parent(delta);

		// Now, to updating the logical movement.
		// (melonJS function)
		this.updateMovement();

		// Checking for collision with other things...
		var res = me.game.world.collide(this);

		if (res) {

			if (res.obj.type === me.game.SPIKE_OBJECT) {
				this.die();
				return false;
			}

			// Did we Collided with an enemy?
			if (res.obj.type === me.game.ENEMY_OBJECT) {

				// Check if we jumped on it
				if ((res.y > 0) && !this.jumping) {

					// Bounce
					this.falling = false;
					this.vel.y = -this.maxVel.y * me.timer.tick;

					this.jumping = true;
					me.audio.play("stomp");
				}
				else {

					// Oops, we got hit by an enemy
					if (! this.invincible) {

						this.health--;

						if (this.health <= 0) {
							this.die();
							return false;
						}

						// Throw the player a la Castlevania
						this.vel.x = 3 * ((this.vel.x > 0) ?
										  -this.maxVel.x :
										   this.maxVel.x) * me.timer.tick;
						this.vel.y = -this.maxVel.y * me.timer.tick;
						this.jumping = true;

						this.makeInvincible(750);
					}
				}
			}
		}

		// If we return false, the player does
		// not get redrawn.
		return true;
	},

	/**
	 * Updates internal animation, based on
	 * all the player's flags.
	 *
	 * @note: Must be called before melonJS' `updateAnimation`!
	 */
	updateAnimation : function() {

		// Which animation we'll apply now
		// By default, we'll assume the player is standing
		var animation = "";

		if      (this.jumping)  animation = "jumping";
		else if (this.falling)  animation = "falling";
		else if (this.standing) animation = "standing";
		else if (this.running)  animation = "running";
		else                    animation = "walking";

		// Flipping the sprite if needed.
		// (since all sprites are by default facing right)
		this.flipX(this.facingLeft);

		// Applying!
		if (!this.renderable.isCurrentAnimation(animation))
			this.renderable.setCurrentAnimation(animation);
	},

	/**
	 * Logic behind the player jumping.
	 *
	 * It has a variable jumping height - like dem Mario gamezz biatch.
	 */
	handleJump : function() {

		var iWannaJump = (me.input.keyStatus("jump"));
		var imOnGround = (!this.falling && !this.jumping);

		// Static local variable that we use to
		// measure if we can jump higher by holding
		// the jump key
		this.jumpTimer = this.jumpTimer || 0;

		if (imOnGround && iWannaJump) {

			this.jumping = true;

			this.vel.y = -this.maxVel.y * me.timer.tick;

			// Opening a window of time on which the player
			// can hold the button to jump higher
			this.jumpTimer = me.timer.getTime();

			me.audio.play("jump");
		}
		else if (!imOnGround && iWannaJump) {

			// Only jumping a little higher if the
			// timer allows.
			if ((me.timer.getTime() - this.jumpTimer) < this.jumpTimerDelta) {
				this.vel.y = -this.maxVel.y * me.timer.tick;
			}
		}

		// Why is this here?
		this.standing = false;
	},

	/**
	 * Starts the player dying animation.
	 * When it finishes, will actually make the player die
	 *
	 * @see #dieForReal()
	 */
	die : function() {

		// No more updating for Mr. Player!
		me.game.player.dying = true;

		var originalOpacity  = this.renderable.getOpacity();

		// Making the player slowly vanish
		// (creating a Tween to change it's opacity)
		new me.Tween({ opacity: originalOpacity })
			.to({ opacity: 0 }, 500)
			.easing(me.Tween.Easing.Exponential.InOut)
			.onUpdate(function() {
				// Note that `this` here refers to the Tween's
				// current value - not the player's!
				me.game.player.renderable.setOpacity(this.opacity);
			})
			.onComplete(function() {

				// Now we really make the player die!
				//
				// Just a catch - before that we must restore
				// the player's original opacity!
				// Otherwise it'll be invisible forever
				me.game.player.renderable.setOpacity(originalOpacity);
				me.game.player.dying = false;

				// DIE, motherfucker
				me.game.player.dieForReal();
			})
			.start();
	},

	/**
	 * Actually makes the player die and respawn.
	 * It also plays with the viewport, check it out!
	 *
	 * @note Please don't call this directly... Prefer the
	 *       `die()` animation.
	 * @note If there are no more lives left, goes to the
	 *       Game Over state/screen.
	 */
	dieForReal : function() {
		this.lives--;

		// We still have lives left, let's respawn
		// the player.
		if (this.lives >= 0) {

			// Restore player's original position
			this.pos.x = this.originalPosition.x;
			this.pos.y = this.originalPosition.y;

			this.makeInvincible(2000);
			this.health = defaultPlayerHealth;

			// Let's animate the screen a little!
			// When the player dies it's going to slowly go
			// from where he died to it's respawn point.
			//
			// So it's a tricky manipulation on the viewport
			// position.
			//
			// First, we need to save the current viewport position
			// (where player died)
			var viewportCurrentX = me.game.viewport.pos.x;
			var viewportCurrentY = me.game.viewport.pos.y;

			// Then we need to get where the viewport will be
			// when he focuses on the player again
			// (player respawn position)
			//
			// @note `viewport.follow` forces the camera to update
			//       around the followed target
			me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
			var viewportFinalX = me.game.viewport.pos.x;
			var viewportFinalY = me.game.viewport.pos.y;

			// Now stop following the player
			me.game.viewport.follow(this.pos, me.game.viewport.AXIS.NONE);

			// And since we changed the viewport position,
			// let's restore to where the player died
			me.game.viewport.pos.x = viewportCurrentX;
			me.game.viewport.pos.y = viewportCurrentY;

			// Finally, gently go to the player's spawn point
			new me.Tween(me.game.viewport.pos)
				.to({ x: viewportFinalX, y: viewportFinalY }, 1000)
				.easing(me.Tween.Easing.Exponential.Out)
				.onComplete(function() {
					// When you're done, restart following
					// the player again
					me.game.viewport.follow(
						me.game.player.pos,
						me.game.viewport.AXIS.BOTH
					);
				})
				.start();

			return;
		}

		// Oops, game over!
		this.alive = false;

		me.device.vibrate(500);
		me.game.world.removeChild(this);

		// Shake the screen a little bit and,
		// when finished, go to the game over screen.
		me.game.viewport.shake(
			7, // max pixels to shake
			500, // duration (ms)
			me.game.viewport.AXIS.BOTH,
			function() {
				me.state.change(me.state.STATE_GAME_OVER);
			}
		);
	},

	/**
	 * Makes the player invincible (flickering it's Sprite) for a while.
	 *
	 * @param timeout How long (in ms) it'll stay invincible.
	 */
	makeInvincible : function(timeout) {

		if (timeout <= 0 || timeout > 5000) {
			// Insert cheat-detecting code here
		}

		this.renderable.flicker(
			timeout,
			function() {
				me.game.player.invincible = false;
			}
		);
		this.invincible = true;
	},






























































	// Oh my, you found me!
	debugUpdate : function() {

		if (me.input.isKeyPressed("die"))
			this.die();

		else if (me.input.isKeyPressed("score+"))
			game.data.score += Number.prototype.random(1, 11);

		else if (me.input.isKeyPressed("score-"))
			game.data.score -= Number.prototype.random(1, 11);

		else if (me.input.isKeyPressed("area+"))
			me.levelDirector.previousLevel();

		else if (me.input.isKeyPressed("area-"))
			me.levelDirector.previousLevel();
	}
});

