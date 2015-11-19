var Level = function() {
  this.game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', this);
};

Level.prototype.createEmitter = function(game) {
  var emitter = game.add.emitter(0, 0, 200);
  emitter.makeParticles('chunk');
  emitter.minRotation = 0;
  emitter.maxRotation = 0;
  emitter.gravity = 150;
  emitter.bounce.setTo(0.5, 0.5);

  return emitter;
};

Level.prototype.createMap = function(game) {
  var map = game.add.tilemap('level3');
  map.addTilesetImage('basic', 'basic');
  map.setCollisionByExclusion([1,3]);

  return map;
};

Level.prototype.createLayer = function(map) {
  var layer = map.createLayer(0);
  layer.resizeWorld();

  return layer;
};

Level.prototype.preload = function() {
  this.game.load.tilemap('level3', 'assets/tilemaps/maps/test.json', null, Phaser.Tilemap.TILED_JSON);
  this.game.load.image('basic', 'assets/tilemaps/tiles/basic_tileset.png', 32, 32);
  this.game.load.image('fussel', 'assets/sprites/fussel.png');
  this.game.load.image('chunk', 'assets/sprites/hair.png');
  this.game.load.image('coin', 'assets/sprites/coin.png');
};

Level.prototype.createFussel = function(game) {
  var sprite = game.add.sprite(300, 90, 'fussel');
  sprite.anchor.set(0.5);

  game.physics.enable(sprite);
  game.camera.follow(sprite);

  return sprite;
};

Level.prototype.create = function() {
  var map = this.createMap(this.game);
  this.layer = this.createLayer(map);

  this.cursors = this.game.input.keyboard.createCursorKeys();

  this.emitter = this.createEmitter(this.game);

  this.sprite = this.createFussel(this.game);

  this.coins = this.game.add.group();
  this.coins.enableBody = true;

  map.createFromObjects("Objektebene 1", 5, 'coin', 0, true, false, this.coins);
};

Level.prototype.stopSprite = function(sprite) {
  sprite.body.velocity.x = 0;
  sprite.body.velocity.y = 0;
};

Level.prototype.collide = function(layer, sprite, emitter) {
  this.game.physics.arcade.collide(sprite, layer);
  this.game.physics.arcade.collide(emitter, layer);
};

Level.prototype.flipSprite = function(value) {
  this.sprite.scale.x = value;
};

Level.prototype.handleCursors = function(cursors, velocity) {
  if (cursors.up.isDown)
  {
      velocity.y = -200;
      this.particleBurst();
  }
  else if (cursors.down.isDown)
  {
      velocity.y = 200;
      this.particleBurst();
  }

  if (cursors.left.isDown)
  {
      velocity.x = -200;
      this.flipSprite(-1);
      this.particleBurst();
  }
  else if (cursors.right.isDown)
  {
      velocity.x = 200;
      this.flipSprite(1);
      this.particleBurst();
  }
};

Level.prototype.update = function() {
  this.game.physics.arcade.overlap(this.sprite, this.coins, function(player, coin) {
    coin.kill();
  }, null, this);

  this.collide(this.layer, this.sprite, this.emitter);

  this.stopSprite(this.sprite);
  this.handleCursors(this.cursors, this.sprite.body.velocity);
};

Level.prototype.render = function() {
  // game.debug.body(sprite);
};

Level.prototype.particleBurst = function() {
  this.emitter.x = this.sprite.x;
  this.emitter.y = this.sprite.y;
  this.emitter.start(true, 2000, null, 1);
};

var l = new Level();
