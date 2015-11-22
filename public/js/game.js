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

Level.prototype.create = function() {
  this.map = this.createMap(this.game);
  this.layer = this.createLayer(this.map);

  this.updateCollion();

  var startPosition;
  this.map.objects['Objektebene 1'].forEach(function(obj) {
    if (obj.type == 'startPosition') {
      startPosition = obj;
    }
  });

  this.cursors = this.game.input.keyboard.createCursorKeys();

  this.emitter = this.createEmitter(this.game);

  this.sprite = this.createFussel(this.game, startPosition);

  this.items = this.createItems([[17, 0], [18, 1]]);

  this.ui = this.game.add.graphics(0, 0);
  this.ui.lineStyle(1, 0x000000, 0.8);
  this.ui.beginFill(0xDEB383, 0.75);
  this.ui.drawRect(0, 0, 256, 64);
  this.ui.fixedToCamera = true;

  this.title = this.game.add.bitmapText(8, 8, 'gem', 'Fussel 1.0', 16);
  this.title.maxWidth = 400;
  this.title.fixedToCamera = true;

  this.points = 0;

  this.score = this.game.add.bitmapText(8, 24, 'gem', '', 16);
  this.score.fixedToCamera = true;

  this.addPoints(0);
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

Level.prototype.handleMovement = function() {
  var index = this.map.getTileWorldXY(this.sprite.position.x, this.sprite.position.y).index;
  if (index == 5) {
    this.layer.alpha = 0.05;
  }
  else {
    this.layer.alpha = 1;
  }
};

Level.prototype.handleCursors = function(cursors, velocity) {
  if (cursors.up.isDown)
  {
    velocity.y = -200;
    this.handleMovement();
  }
  else if (cursors.down.isDown)
  {
    velocity.y = 200;
    this.handleMovement();
  }

  if (cursors.left.isDown)
  {
    velocity.x = -200;
    this.flipSprite(-1);
    this.handleMovement();
  }
  else if (cursors.right.isDown)
  {
    velocity.x = 200;
    this.flipSprite(1);
    this.handleMovement();
  }
};

Level.prototype.updateCollion = function(player, coin) {
  this.map.setCollisionByExclusion([], false, this.layer, true);
  this.map.setCollisionByExclusion([1,3,5], true, this.layer, true);
};

Level.prototype.collectItem = function(player, item) {
  var id = item.texture.crop.x/32;
  if (id == 0) {
    this.addPoints(item.score || 1);
  }
  else if (id == 1) {
    alert('you got the light');
  }
  item.kill();
  this.particleBurst();
  var remainingCoins = 0;

  this.items.forEachAlive(function(item) {
    id = item.texture.crop.x/32;
    if (id == 0) {
      remainingCoins++;
    }
  });

  if (remainingCoins == 0) {
    this.map.replace(4, 1);
    this.updateCollion();
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

var l = new Level();
