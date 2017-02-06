// Background
function Background(game, image_terrain, image_walkable) {
    this.x = 0;
    this.y = 0;
    this.image_terrain = image_terrain;
    this.image_walkable = image_walkable;
    this.game = game;
    this.ctx = game.ctx;
	
}

Background.prototype.draw = function () {
    this.ctx.drawImage(this.image_terrain, this.x, this.y);
	
}

Background.prototype.update = function () {
	
}