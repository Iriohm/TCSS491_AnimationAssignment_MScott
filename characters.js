function AnimationCharacter(spriteSheet, frameSize, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
	
	this.sheetWidth = frameSize * frames * 5;
	this.sheetHeight = frameSize * 5;
	this.frameSize = frameSize;
    this.frameDuration = frameDuration;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
	this.frames_state = [frames, frames, frames, frames, 1];
	
	// Caches a reversed version of the sprite-sheet, for animations facing from north-east to south-east.
    var offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = this.sheetWidth;
    offscreenCanvas.height = this.sheetHeight;
    var offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.save();
	offscreenCtx.scale(-1, 1);
    offscreenCtx.drawImage(spriteSheet, 0 - this.sheetWidth, 0);
    offscreenCtx.restore();
    this.spriteSheetReversed = offscreenCanvas;
	
	/*
	    4
	  3   5
	2       6
	  1   7
	    0
	*/
	this.facing = 0;
	
	/*	Number	State
		0		Idle
		1		Moving
		2		Attacking
		3		Dying
		4		Corpse
	*/
	this.state = 0;
	
	// Switch this to true whenever the character should begin a new animation, such as a transition from moving to attacking.
	this.state_switched = false;
	
}

AnimationCharacter.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
		if 	(this.loop) this.elapsedTime = 0;
		if	(this.state === 3) { this.state = 4; }
	}
	
	/*
	    4
	  3   5
	2       6
	  1   7
	    0
	*/
	
	// Code for calculating the correct sprites for the direction the character is facing.
	var direction = this.facing;
	if	(direction > 4) { direction = direction - (2 * (direction - 4)); }

	var frame = this.currentFrame();
    var source_x = 0;
    var source_y = 0;
	
	source_x = (frame + (this.frames_state[this.state] * direction)) * this.frameSize;
	source_y = this.frameSize * this.state;	
	
	// Set up to pull from the reversed sprite-sheet if the character is facing
	// directions North-east to South-east.
	if	(this.facing < 5) {
		sourceImage = this.spriteSheet;
	} else {
		sourceImage = this.spriteSheetReversed;
		source_x = this.sheetWidth - source_x - this.frameSize;
	}
	
	ctx.drawImage(sourceImage,
		 source_x, source_y,  // Source from the sprite sheet.
		 this.frameSize, this.frameSize,
		 x, y,
		 this.frameSize * this.scale,
		 this.frameSize * this.scale);

				 
}

AnimationCharacter.prototype.currentFrame = function () {
	if	(this.state_switched === true) {
		this.state_switched = false;
		
		return 0;
		
	} else {
		return Math.floor(this.elapsedTime / this.frameDuration);
		
	}
	
}

AnimationCharacter.prototype.isDone = function () {
    return (this.elapsedTime >= this.frameDuration * this.frames_state[this.state]);
}


// Basic PC
function CharacterPC(game, spritesheet, x, y) {
    this.animation = new AnimationCharacter(spritesheet, 120, 0.05, 15, true, 1);
    this.x = x;
    this.y = y;
    this.speed = 110;
    this.game = game;
    this.ctx = game.ctx;
	
	// Movement
	this.is_moving = false;
	this.desired_x = x + 60;
	this.desired_y = y + 60;
	
}

CharacterPC.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

CharacterPC.prototype.update = function () {
	if	(this.game.mouse_clicked_right) {
		this.desired_x = this.game.click.x;
		this.desired_y = this.game.click.y;
		
		this.is_moving = true;
		
		this.game.mouse_clicked_right = false;
		
	}
	
	// Death animation.
	if	(this.game.keyD) {
		this.animation.state = 3;
		this.state_switched = true;
		this.game.keyD = false;
	}
	
	// Attack animation.
	if	(this.game.keyA) {
		this.animation.state = 2;
		this.state_switched = true;
		this.game.keyA = false;
	}
	
	handleMovement(this);
	
}



// ====================================
//            E N E M I E S
// ====================================

// Enemy Melee Skeleton
function Enemy_Skeleton_Melee(game, spritesheet, x, y) {
    this.animation = new AnimationCharacter(spritesheet, 120, 0.05, 15, true, 1);
	this.animation.frames_state[0] = 7;
	this.animation.frames_state[2] = 10;
	this.animation.frames_state[3] = 10;
    this.x = x;
    this.y = y;
    this.speed = 110;
    this.game = game;
    this.ctx = game.ctx;
	
	// Movement
	this.is_moving = false;
	this.desired_x = x + 60;
	this.desired_y = y + 60;
	
}

Enemy_Skeleton_Melee.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

Enemy_Skeleton_Melee.prototype.update = function () {
	handleMovement(this);
	
}


// ====================================
//             A L L I E S
// ====================================


// Basic Villager
function Ally_Villager(game, spritesheet, x, y) {
    this.animation = new AnimationCharacter(spritesheet, 120, 0.05, 15, true, 1);
    this.x = x;
    this.y = y;
    this.speed = 110;
    this.game = game;
    this.ctx = game.ctx;
	
	// Movement
	this.is_moving = false;
	this.desired_x = x + 60;
	this.desired_y = y + 60;
	
}

Ally_Villager.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

Ally_Villager.prototype.update = function () {
	handleMovement(this);
	
}

// ====================================
//   S H A R E D   F U N C T I O N S
// ====================================


// Handles movement for all Characters. Should be called from the Character.update() function.
function handleMovement(character) {
	if	(character.is_moving === true) {
		var frameHalfSize = (character.animation.frameSize / 2);
		if	(Math.abs(character.x + frameHalfSize - character.desired_x) < 1 &&
			 Math.abs(character.y + frameHalfSize - character.desired_y) < 1) {
			character.x = character.desired_x - frameHalfSize;
			character.y = character.desired_y - frameHalfSize;
			character.is_moving = false;
			character.animation.state = 0;
			character.animation.state_switched = true;
			
		} else {
			character.animation.state = 1;
			
			// Tests to make sure the character is facing the appropriate direction.
			var desired_movement_arc = calculateMovementArc(character.x + frameHalfSize, character.y + frameHalfSize,
														character.desired_x, character.desired_y);
			if	(desired_movement_arc !== character.animation.facing) {
				character.animation.state_switched = true;
				character.animation.facing = desired_movement_arc;
				
			}
			
			var direction = Math.atan2(character.desired_y - (character.y + frameHalfSize),
										character.desired_x - (character.x + frameHalfSize));
			
			character.x += character.game.clockTick * character.speed * Math.cos(direction);
			character.y += character.game.clockTick * character.speed * Math.sin(direction) / 2;
			
		}
	
	}
	
}

// http://math.stackexchange.com/questions/796243/how-to-determine-the-direction-of-one-point-from-another-given-their-coordinate
function calculateMovementArc(current_x, current_y, desired_x, desired_y) {
	var direction = Math.atan2(current_y - desired_y, desired_x - current_x) - (Math.PI / 8);	
	if	(direction < 0) { direction += 2 * Math.PI; }
	
	if		(direction >= Math.PI / 2		&&		direction < 3 * Math.PI / 4) 		{ return 3; }
	else if	(direction >= 3 * Math.PI / 4	&&		direction < Math.PI) 				{ return 2; }
	else if	(direction >= Math.PI			&&		direction < 5 * Math.PI / 4) 		{ return 1; }
	else if	(direction >= 5 * Math.PI / 4	&&		direction < 3 * Math.PI / 2) 		{ return 0; }
	else if	(direction >= 3 * Math.PI / 2	&&		direction < 7 * Math.PI / 4) 		{ return 7; }
	else if	(direction >= 7 * Math.PI / 4) 												{ return 6; }
	else if	(direction < Math.PI / 4) 													{ return 5; }
	else if	(direction >= Math.PI / 4		&&		direction < Math.PI / 2) 			{ return 4; }
	else																				{ return 0; }
	
}
/*
function Path(x1, y1, x2, y2) {
	
	
	function 
	
}

Character.prototype.update = function () {
	if	(this.game.mouse_clicked) {
		this.desired_x = this.game.click.x;
		this.desired_y = this.game.click.y;
		
		console.log(this.desired_x);
		console.log(this.desired_y);
		
		this.is_moving = true;
		
		this.game.mouse_clicked = false;
		
	}
	handleMovement(this);
	
}
*/