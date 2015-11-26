var Intro = function(game, name) {
  this.name = name;
  this.game = game;
  this.game.state.add(name, this);
};

Intro.prototype.start = function() {
  this.game.state.start(this.name);
};

Intro.prototype.preload = function() {
  this.game.load.bitmapFont('gem', 'assets/fonts/bitmapFonts/gem.png', 'assets/fonts/bitmapFonts/gem.xml');
};

Intro.prototype.create = function() {
  this.game.stage.backgroundColor = 0xffffff;
  this.title = this.game.add.bitmapText(game.world.centerX, game.world.centerY, 'gem', 'Start', 16);
  this.title.anchor.set(0.5);
};

Intro.prototype.update = function() {
};

Intro.prototype.render = function() {
};

var Level = function(game, name, levelFile) {
  this.name = name;
  this.levelFile = levelFile;
  this.game = game;
  this.game.state.add(name, this);
};

Level.prototype.start = function() {
  this.game.state.start(this.name);
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
  var map = game.add.tilemap('level');
  map.addTilesetImage('basic', 'basic');
  return map;
};

Level.prototype.createLayer = function(map) {
  var layer = map.createLayer(0);
  layer.resizeWorld();

  return layer;
};

Level.prototype.preload = function() {
  this.game.load.tilemap('level', this.levelFile, null, Phaser.Tilemap.TILED_JSON);
  this.game.load.image('basic', 'assets/tilemaps/tiles/basic_tileset.png', 32, 32);
  this.game.load.image('fussel', 'assets/sprites/fussel.png');
  this.game.load.image('chunk', 'assets/sprites/hair.png');
  this.game.load.bitmapFont('gem', 'assets/fonts/bitmapFonts/gem.png', 'assets/fonts/bitmapFonts/gem.xml');
  this.game.load.spritesheet('items', 'assets/sprites/items.png', 32, 32);
};

Level.prototype.createFussel = function(game, startPosition) {
  var sprite = game.add.sprite(startPosition.x, startPosition.y, 'fussel');
  sprite.anchor.set(0.5);

  game.physics.enable(sprite);
  game.camera.follow(sprite);

  return sprite;
};

Level.prototype.createItems = function(items) {
  var group = this.game.add.group();
  group.enableBody = true;

  var that = this;

  items.forEach(function(item) {
    that.map.createFromObjects("Objektebene 1", item[0], 'items', item[1], true, false, group);
  });

  return group;
};

Level.prototype.getUiGraphic = function() {
  var ui = this.game.add.graphics(0, 0);
  ui.lineStyle(1, 0x000000, 0.8);
  ui.beginFill(0xDEB383, 0.75);
  ui.drawRect(0, 0, 256, 64);
  ui.fixedToCamera = true;

  return ui;
}

Level.prototype.setupUi = function() {
  this.ui = this.getUiGraphic();

  this.title = this.game.add.bitmapText(8, 8, 'gem', 'Fussel 1.0', 16);
  this.title.maxWidth = 400;
  this.title.fixedToCamera = true;

  this.points = 0;

  this.score = this.game.add.bitmapText(8, 24, 'gem', '', 16);
  this.score.fixedToCamera = true;

  this.addPoints(0);
};

Level.prototype.getStartPosition = function() {
  var startPosition;
  this.map.objects['Objektebene 1'].forEach(function(obj) {
    if (obj.type == 'startPosition') {
      startPosition = obj;
    }
  });

  return startPosition;
};

Level.prototype.create = function() {
  this.map = this.createMap(this.game);
  this.layer = this.createLayer(this.map);

  this.updateCollision();

  var startPosition = this.getStartPosition();

  this.cursors = this.game.input.keyboard.createCursorKeys();

  this.emitter = this.createEmitter(this.game);

  this.sprite = this.createFussel(this.game, startPosition);

  this.items = this.createItems([[17, 0], [18, 1]]);

  this.setupUi();
};

Level.prototype.addPoints = function(points) {
  this.points += parseInt(points);
  this.score.text = 'score: ' + this.points;
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

Level.prototype.switchDarkness = function(dark) {
  if (dark) {
    this.layer.alpha = 0.05;
  }
  else {
    this.layer.alpha = 1;
  }
};

Level.prototype.handleMovement = function(cursors) {
  if (!cursors.left.isDown && !cursors.right.isDown && !cursors.up.isDown && !cursors.down.isDown) {
    return;
  }

  var index = this.map.getTileWorldXY(this.sprite.position.x, this.sprite.position.y).index;

  this.switchDarkness(index == 5);
};

Level.prototype.modifyVelocity = function(cursors, velocity) {
  var speed = 200;

  velocity.y = cursors.up.isDown ? speed*-1 : velocity.y;
  velocity.y = cursors.down.isDown ? speed : velocity.y;
  velocity.x = cursors.left.isDown ? speed*-1 : velocity.x;
  velocity.x = cursors.right.isDown ? speed : velocity.x;

};

Level.prototype.handleDirection = function(cursors) {
  if (cursors.left.isDown) {
    this.flipSprite(-1);
  }
  else if (cursors.right.isDown) {
    this.flipSprite(1);
  }
};

Level.prototype.handleCursors = function(cursors, velocity) {
  this.modifyVelocity(cursors, velocity);
  this.handleDirection(cursors);
  this.handleMovement(cursors);
};

Level.prototype.updateCollision = function(player, coin) {
  this.map.setCollisionByExclusion([], false, this.layer, true);
  this.map.setCollisionByExclusion([1,3,5], true, this.layer, true);
};

Level.prototype.collectCoin = function(player, coin) {
  this.addPoints(coin.score || 1);
  this.particleBurst();
  this.pickup(coin);
};

Level.prototype.collectLight = function(player, light) {
  this.particleBurst();
  this.pickup(light);
};

Level.prototype.pickup = function(item) {
  item.kill();
  this.afterPickup();
};

Level.prototype.afterPickup = function(player, item) {
  var remainingCoins = 0;

  this.items.forEachAlive(function(item) {
    id = item.texture.crop.x/32;
    if (id == 0) {
      remainingCoins++;
    }
  });

  if (remainingCoins == 0) {
    this.map.replace(4, 1);
    this.updateCollision();
  }
};

Level.prototype.collectItem = function(player, item) {
  var id = item.texture.crop.x/32;
  if (id == 0) {
    this.collectCoin(player, item);
  }
  else if (id == 1) {
    this.collectLight(player, item);
  }
};

Level.prototype.update = function() {
  var that = this;
  this.game.physics.arcade.overlap(this.sprite, this.items, this.collectItem, null, this);

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
  this.emitter.start(true, 2000, null, 10);
};

var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example');

var l = new Level(game, 'level1', 'assets/tilemaps/maps/test.json');
var i = new Intro(game, 'intro');
i.start();

