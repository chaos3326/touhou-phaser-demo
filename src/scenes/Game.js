var randomArray = new Array(1723).fill(0);
var currentRandom = 0;
function random() {
  return (
    randomArray[currentRandom++] || ((currentRandom = 1) && randomArray[0])
  );
}
function generateNumber(value, randomRange) {
  return randomRange
    ? value + randomRange * random() - randomRange * 0.5
    : value;
}
var globalVar = {
  time: -1,
  best: 0,
};
var initGlobalVar = {
  time: -1,
};
var danmaku = [];
var danmakuBackup = undefined;
/**
 * feel free to change it to config the game
 */
var keyConfig = {
  up: Phaser.Input.Keyboard.KeyCodes.W,
  up2: Phaser.Input.Keyboard.KeyCodes.UP,
  down: Phaser.Input.Keyboard.KeyCodes.S,
  down2: Phaser.Input.Keyboard.KeyCodes.DOWN,
  left: Phaser.Input.Keyboard.KeyCodes.A,
  left2: Phaser.Input.Keyboard.KeyCodes.LEFT,
  right: Phaser.Input.Keyboard.KeyCodes.D,
  right2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
  aKey: Phaser.Input.Keyboard.KeyCodes.K,
  aKey2: Phaser.Input.Keyboard.KeyCodes.SHIFT,
  bKey: Phaser.Input.Keyboard.KeyCodes.O,
  bKey2: Phaser.Input.Keyboard.KeyCodes.Z,
  enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
};
var gameConfig = {
  bulletCap: 2048,
  top: 16,
  bottom: 464,
  left: 112,
  right: 528,
  // hitboxes in Radius
  hitbox: {
    player: 2,
    bacteria: 2.5,
    arrow: 3,
    rice: 3,
    shard: 3,
    kunai: 3,
    talisman: 3,
    tear: 3,
    sstar: 3,
    lstar: 6,
    sball: 4,
    ball: 6,
    lball: 12,
    butterfly: 6,
    knife: 6,
    bean: 6,
    heart: 10,
    bubble: 22,
    slight: 6,
    light: 8,
    llight: 12,
    syy: 13,
    lyy: 28,
    fire: 8,
  },
};

class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y);
  }
  fire(x, y, direction, speed, sprite, danmakuData = {}) {
    let defaultData = {
      lifetime: -1,
    };
    let element;
    this.danmakuData = JSON.parse(JSON.stringify(danmakuData));
    for (element in defaultData) {
      !this.danmakuData[element] &&
        (this.danmakuData[element] = defaultData[element]);
    }
    this.body.reset(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.setTexture("bullets", sprite);
    let radDirection = (direction * Math.PI) / 180;
    this.setVelocity(
      speed * Math.sin(radDirection),
      -speed * Math.cos(radDirection)
    );
    this.angle = direction;
    this.zise = gameConfig.hitbox[sprite.substring(sprite.indexOf("_") + 1)];
    this.setCircle(
      this.zise,
      this.width / 2 - this.zise,
      this.height / 2 - this.zise
    );
  }
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    /* special properties (except spawn) will prevent the bullets to despawn, 
                if there is any, the flag will be set to 1*/
    let flag = 0;
    this.danmakuData.bounce?.amount && (flag = 1) && this.handleBounce();
    this.danmakuData.gravity?.countDown && (flag = 1) && this.handleGravity();
    this.danmakuData.force?.countDown && (flag = 1) && this.handleForce();
    this.danmakuData.friction?.countDown &&
      (flag = 1) &&
      this.handleLinearFriction();
    this.danmakuData.spawn && this.handleSpawn();
    this.updateAngle();
    if (flag) return;
    // if (lifetime == -1) then if (y<{} || y>{} || x<{} || x>{}) then despawn()
    this.danmakuData.lifetime == -1 &&
      (this.y <= -32 || this.y >= 512 || this.x <= 64 || this.x >= 576) &&
      this.despawn();
    // lifetime--; if (!lifetime) then despawn()
    this.danmakuData.lifetime == 0 && this.despawn();
    this.danmakuData.lifetime >= 0 &&
      !this.danmakuData.lifetime-- &&
      this.despawn();
  }
  updateAngle() {
    let x = this.body.velocity.x;
    let y = this.body.velocity.y;
    let angle =
      y == 0 ? (x > 0 ? 90 : -90) : (Math.atan(-x / y) * 180) / Math.PI;
    angle += y > 0 ? 180 : 0;
    this.setAngle(angle);
  }
  silent() {
    !this.danmakuData.invulnerable && this.forceDespawn();
  }
  despawn() {
    this.deathrattle();
    this.forceDespawn();
  }
  forceDespawn() {
    this.setVelocity(0, 0);
    this.setPosition(0, 0);
    this.setActive(false);
    this.setVisible(false);
  }
  handleBounce() {
    this.danmakuData.bounce.wallMargin ||
      (this.danmakuData.bounce.wallMargin = 0);
    this.danmakuData.bounce.left &&
      this.x < gameConfig.left + this.danmakuData.bounce.wallMargin &&
      this.body.velocity.x < 0 &&
      this.bounce(true, gameConfig.left + this.danmakuData.bounce.wallMargin);
    this.danmakuData.bounce.right &&
      this.x > gameConfig.right - this.danmakuData.bounce.wallMargin &&
      this.body.velocity.x > 0 &&
      this.bounce(true, gameConfig.right - this.danmakuData.bounce.wallMargin);
    this.danmakuData.bounce.top &&
      this.y < gameConfig.top + this.danmakuData.bounce.wallMargin &&
      this.body.velocity.y < 0 &&
      this.bounce(false, gameConfig.top + this.danmakuData.bounce.wallMargin);
    this.danmakuData.bounce.bottom &&
      this.y > gameConfig.bottom - this.danmakuData.bounce.wallMargin &&
      this.body.velocity.y > 0 &&
      this.bounce(
        false,
        gameConfig.bottom - this.danmakuData.bounce.wallMargin
      );
    !this.danmakuData.bounce.left &&
      this.x < gameConfig.left + this.danmakuData.bounce.wallMargin &&
      this.body.velocity.x < 0 &&
      (this.danmakuData.bounce.amount = 0);
    !this.danmakuData.bounce.right &&
      this.x > gameConfig.right - this.danmakuData.bounce.wallMargin &&
      this.body.velocity.x > 0 &&
      (this.danmakuData.bounce.amount = 0);
    !this.danmakuData.bounce.top &&
      this.y < gameConfig.top + this.danmakuData.bounce.wallMargin &&
      this.body.velocity.y < 0 &&
      (this.danmakuData.bounce.amount = 0);
    !this.danmakuData.bounce.bottom &&
      this.y > gameConfig.bottom - this.danmakuData.bounce.wallMargin &&
      this.body.velocity.y > 0 &&
      (this.danmakuData.bounce.amount = 0);
    if (this.danmakuData.bounce.amount >= 0) {
      return;
    }
    if (this.danmakuData.bounce.amount == -2) {
      this.danmakuData.bounce.duration <= 0 &&
        (this.danmakuData.bounce.amount = 0);
      this.danmakuData.bounce.duration--;
      return;
    }
    if (this.danmakuData.bounce.amount == -1) {
      return;
    }
    this.danmakuData.bounce.amount = Math.ceil(this.danmakuData.bounce.amount);
  }
  bounce(verticalWall = true, wall) {
    this.danmakuData.bounce.amount > 0 && this.danmakuData.bounce.amount--;
    if (verticalWall) {
      this.setVelocity(-this.body.velocity.x, this.body.velocity.y);
      this.setX(2 * wall - this.x);
      return;
    }
    this.setVelocity(this.body.velocity.x, -this.body.velocity.y);
    this.setY(2 * wall - this.y);
  }
  handleGravity() {
    let data = this.danmakuData.gravity;
    data.countDown--;
    let action;
    for (action of data.actions) {
      action.countDown &&
        (--action.countDown ||
          this.setAcceleration(
            this.body.acceleration.x + action.x,
            this.body.acceleration.y + action.y
          ));
      !action.countDown &&
        action.duration &&
        (--action.duration ||
          this.setAcceleration(
            this.body.acceleration.x - action.x,
            this.body.acceleration.y - action.y
          ));
    }
    data.countDown < 0 && (data.countDown = 0);
  }
  handleForce() {
    let data = this.danmakuData.force;
    data.countDown--;
    let action;
    for (action of data.actions) {
      action.countDown && --action.countDown;
      !action.countDown &&
        action.duration &&
        this.force(action.x, action.y, action);
    }
    data.countDown < 0 && (data.countDown = 0);
  }
  force(x, y, action) {
    x = x / 60;
    y = y / 60;
    let angle = (this.angle - 90) * 0.0174532925;
    let forceX = x * Math.cos(angle) - y * Math.sin(angle);
    let forceY = x * Math.sin(angle) + y * Math.cos(angle);
    this.setVelocity(
      this.body.velocity.x + forceX,
      this.body.velocity.y + forceY
    );
    action.duration--;
  }
  handleLinearFriction() {
    let data = this.danmakuData.friction;
    data.countDown && --data.countDown;
    !data.countDown && data.duration && this.setFrictionForce(data.duration);
    data.countDown < 0 && (data.countDown = 0);
  }
  setFrictionForce(duration) {
    let data = {
      x: (-this.body.speed * 60) / (duration + 1),
      y: 0,
      countDown: 1,
      duration: duration,
    };
    if (!this.danmakuData.force) {
      this.danmakuData.force = {
        countDown: duration,
        actions: [],
      };
    }
    this.danmakuData.force.actions.push(JSON.parse(JSON.stringify(data)));
    this.danmakuData.force.countDown < data.duration &&
      (this.danmakuData.force.countDown = data.duration);
    this.danmakuData.friction = undefined;
  }
  deathrattle() {
    if (this.danmakuData.deathrattle) {
      for (let pattern of this.danmakuData.deathrattle) {
        if (pattern.relative) {
          pattern.positionX = this.x;
          pattern.positionY = this.y;
        }
        this.scene.shootBullet(pattern);
      }
    }
  }
  handleSpawn() {
    for (let pattern of this.danmakuData.spawn) {
      if (!pattern.countDown) {
        pattern.countDown = pattern.interval;
        if (pattern.relative) {
          pattern.positionX = this.x;
          pattern.positionY = this.y;
        }
        this.scene.shootBullet(pattern);
      }
      pattern.countDown--;
    }
  }
}

class BulletsPool extends Phaser.Physics.Arcade.Group {
  constructor(scene) {
    super(scene.physics.world, scene);
    this.createMultiple({
      classType: Bullet,
      frameQuantity: gameConfig.bulletCap,
      active: false,
      visible: false,
      key: "bullets",
    });
  }
  /**
   *
   * @param {number} x - compulsory value
   * @param {number} y - compulsory value
   * @param {number} direction - 0 is up, 90 is right, 180 is down, -90 is left, default is 'random() * 360'
   * @param {number} speed - default is '100 + random() * 100'
   * @param {string} sprite - default is red_rice
   * @param {object} danmakuData - contain every abnormal data in it
   */
  fire(x, y, direction, speed, sprite, danmakuData) {
    if (direction === undefined) {
      direction = random() * 360;
    }
    if (speed === undefined) {
      speed = 100 + random() * 100;
    }
    const bullet = this.getFirstDead(false);
    if (bullet) {
      bullet.fire(x, y, direction, speed, sprite, danmakuData);
    }
  }
  clearSomeBullets() {
    let member;
    for (member of this.getMatching("visible", true)) {
      member.silent();
    }
  }
  clearBullets() {
    let member;
    for (member of this.getMatching("visible", true)) {
      member.forceDespawn();
    }
  }
}

/********************************************************
 * The real Scene class from file
 */
export default class Game extends Phaser.Scene {
  init(initDanmaku) {
    initDanmaku?.hiScore && (globalVar.best = initDanmaku.hiScore);
    for (let element in initGlobalVar) {
      globalVar[element] = initGlobalVar[element];
    }
    initDanmaku.name && (this.wild = !!initDanmaku.wild);
    initDanmaku.name &&
      (danmakuBackup = JSON.parse(JSON.stringify(initDanmaku.danmaku)));
    danmakuBackup && (danmaku = JSON.parse(JSON.stringify(danmakuBackup)));
    this.life = 1;
  }
  constructor() {
    super("game");
  }
  preload() {
    this.physics.world.setFPS(60);
    this.load.image("background", "assets/images/backgrounds.png");
    this.load.image("foreground", "assets/images/foreground.png");
    this.load.image("player", "assets/images/player.png");
    this.load.image("player_hitbox", "assets/images/player_hitbox.png");
    this.load.image("pause", "assets/images/pause.png");
    this.load.atlas(
      "buttons",
      "assets/images/buttons.png",
      "assets/images/buttons.json"
    );
    this.load.atlas(
      "bullets",
      "assets/images/bullets.png",
      "assets/images/bullets.json"
    );
    this.load.audio("se_tan00", "assets/sounds/se_tan00.wav");
    this.load.audio("se_kira00", "assets/sounds/se_kira00.wav");
    this.load.audio("pldead", "assets/sounds/se_pldead00.wav");
    this.load.audio("cardget", "assets/sounds/se_cardget.wav");
    this.load.audio("cardend", "assets/sounds/se_piyo.wav");
    this.load.audio("extend", "assets/sounds/se_extend.wav");
  }
  create() {
    danmakuBackup = JSON.parse(JSON.stringify(danmaku));
    let that = this;
    this.add.image(500, 240, "background");
    this.player = this.physics.add.sprite(320, 400, "player");
    this.player.setCircle(
      gameConfig.hitbox.player,
      this.player.width / 2 - gameConfig.hitbox.player,
      this.player.height / 2 - gameConfig.hitbox.player
    );
    this.bulletsPool = new BulletsPool(this);
    this.playerHitbox = this.physics.add.image(320, 400, "player_hitbox");
    this.add.image(320, 240, "foreground");
    this.pauseImg = this.add.image(320, 240, "pause").setAlpha(0);
    this.buttonSet();
    this.add.image(552, 160, "player");
    this.addText();
    this.keys = this.input.keyboard.addKeys(keyConfig);
    this.shotSound = [0, 1];
    this.shotSound[0] = this.sound.add("se_tan00", { volume: 0.1 });
    this.shotSound[1] = this.sound.add("se_kira00", { volume: 0.1 });
    this.pichuun = this.sound.add("pldead", { volume: 0.1 });
    this.cardget = this.sound.add("cardget", { volume: 0.1 });
    this.cardend = this.sound.add("cardend", { volume: 0.1 });
    this.extend = this.sound.add("extend", { volume: 0.1 });
    this.physics.add.overlap(this.player, this.bulletsPool, function () {
      that.playerHit();
    });
    //setup a simple RNG
    for (let i in randomArray) {
      randomArray[i] = Math.random();
    }
    this.invulnerable = 120;
    this.capture = true;
  }
  update() {
    // spin all spinable object
    this.playerHitbox.angle += 3;
    // player invinsibility
    if (this.invulnerable > 0) {
      this.invulnerable--;
      this.player.setAlpha(
        1 - this.invulnerable / 4 + Math.floor(this.invulnerable / 4)
      );
    }
    // velocity of player
    let speed = 200;
    // get the control value
    let isLeft = this.keys.left.isDown || this.keys.left2.isDown;
    let isRight = this.keys.right.isDown || this.keys.right2.isDown;
    let isUp = this.keys.up.isDown || this.keys.up2.isDown;
    let isDown = this.keys.down.isDown || this.keys.down2.isDown;
    let isA = this.keys.aKey.isDown || this.keys.aKey2.isDown;
    // show hitbox when in focus mode
    this.playerHitbox.setAlpha(isA && 1 + 0);
    // Set player speed
    speed = speed + (isA && -110); // focus = slower speed
    speed = speed * (1 + ((isUp || isDown) && (isLeft || isRight) && -0.29289)); // move diagonal = split speed element
    // wall
    this.player.x > gameConfig.right - 16 && (isRight = false);
    this.player.x < gameConfig.left + 16 && (isLeft = false);
    this.player.y < gameConfig.top + 18 && (isUp = false);
    this.player.y > gameConfig.bottom - 18 && (isDown = false);
    //
    let speedX = (isRight && speed) + (isLeft && -speed);
    let speedY = (isDown && speed) + (isUp && -speed);
    this.player.setVelocity(speedX, speedY);
    this.playerHitbox.setPosition(this.player.x, this.player.y);

    this.buttonEffect();

    globalVar.time++;
    if (globalVar.best <= globalVar.time) {
      globalVar.best = globalVar.time;
      this.hiScore.setText(this.numPadding(globalVar.best, 8));
    }
    this.score.setText(this.numPadding(globalVar.time, 8));
    if (!this.wild) this.handleDanmaku(danmaku);
    else this.handleWildDanmaku(danmaku);
  }
  addText() {
    this.hiScore = this.add.text(536, 48, this.numPadding(globalVar.best, 8), {
      font: "22px Arial",
      fill: "#FFFFFF",
      align: "right",
    });
    this.score = this.add.text(536, 108, this.numPadding(globalVar.time, 8), {
      font: "22px Arial",
      fill: "#FFFFFF",
      align: "right",
    });
    this.lifeCount = this.add.text(569, 144, "× 0", {
      font: "32px Arial",
      fill: "#FFFFFF",
      align: "left",
    });
  }
  updateLifeDisplay() {}
  numPadding(number, length) {
    let s = number + "";
    while (s.length < length) s = "0" + s;
    return s;
  }
  handleDanmaku(danmaku) {
    let pattern;
    for (pattern of danmaku) {
      pattern.countDown > 0 && pattern.countDown--;
      pattern.AS > 0 &&
        pattern.countDown <= 0 &&
        (pattern.countDown += 1 / pattern.AS) &&
        this.shootBullet(pattern);
      if (pattern.directionSin) {
        pattern.direction =
          (pattern.directionCap - pattern.directionFoot) *
            0.5 *
            Math.sin(
              (pattern.directionPhase / pattern.directionInterval) * 6.283185
            ) +
          (pattern.directionCap + pattern.directionFoot) * 0.5;
        pattern.directionPhase++;
      } else {
        pattern.direction += pattern.directionV;
        pattern.directionV += pattern.directionA;
      }
      pattern.AS += pattern.ASV;
      pattern.amount += pattern.amountV;
      pattern.failChance += pattern.failChanceV;
      pattern.randomMemberDirection += pattern.randomMemberDirectionV;
      pattern.speed += pattern.speedV;
      pattern.speedLast += pattern.speedLastV;
      pattern.randomSpeed += pattern.randomSpeedV;
    }
  }
  handleWildDanmaku(danmaku) {
    // end spellcard
    if (globalVar.time % 1200 == 0) {
      if (globalVar.time == 0) {
        this.wildDanmakuInit(danmaku);
      }
      this.reloadWildDanmaku(globalVar.time / 1200);
      this.capture = true;
    }
    // extra life at 1200, 2400, 4800, 9600, 19200...
    if (
      Math.log2(globalVar.time / 1200) ==
        Math.floor(Math.log2(globalVar.time / 1200)) &&
      globalVar.time >= 1200
    ) {
      this.life++;
      this.lifeCount.setText("× " + (this.life - 1));
      this.extend.play();
    }
    // shoot
    let pattern;
    for (pattern of this.currentWildDanmaku) {
      pattern.countDown > 0 && pattern.countDown--;
      pattern.AS > 0 &&
        pattern.countDown <= 0 &&
        (pattern.countDown += 1 / pattern.AS) &&
        this.shootBullet(pattern);
      if (pattern.directionSin) {
        pattern.direction =
          (pattern.directionCap - pattern.directionFoot) *
            0.5 *
            Math.sin(
              (pattern.directionPhase / pattern.directionInterval) * 6.283185
            ) +
          (pattern.directionCap + pattern.directionFoot) * 0.5;
        pattern.directionPhase++;
      } else {
        pattern.direction += pattern.directionV;
        pattern.directionV += pattern.directionA;
      }
    }
  }
  wildDanmakuInit(danmaku) {
    this.wildDanmaku = JSON.parse(JSON.stringify(danmaku));
    ((array) => {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }
    })(this.wildDanmaku);
  }
  reloadWildDanmaku(serial) {
    this.currentWildDanmaku = JSON.parse(
      JSON.stringify(this.wildDanmaku[serial % this.wildDanmaku.length].danmaku)
    );
    let pattern;
    for (pattern of this.currentWildDanmaku) {
      let initAS = pattern.AS;
      pattern.AS += pattern.ASV * serial;
      pattern.amount += pattern.amountV * serial;
      pattern.failChance += pattern.failChanceV * serial;
      pattern.randomMemberDirection += pattern.randomMemberDirectionV * serial;
      pattern.speed += pattern.speedV * serial;
      pattern.speedLast += pattern.speedLastV * serial;
      pattern.randomSpeed += pattern.randomSpeedV * serial;
      pattern.countDown &&
        (pattern.countDown =
          ((pattern.countDown - 60) * initAS) / pattern.AS + 60);
      pattern.directionVV &&
        (pattern.directionV += pattern.directionVV * serial);
    }
    this.bulletsPool.clearBullets();
    if (globalVar.time) {
      if (this.capture) this.cardget.play();
      else this.cardend.play();
    }
  }
  shootBullet(pattern) {
    if (typeof pattern.sound === "number") {
      this.shotSound[pattern.sound].volume = pattern.volume
        ? pattern.volume
        : 0.1;
      this.shotSound[pattern.sound].play();
    }
    let bulletX = 320;
    let bulletY = 120;
    let bulletDirection = 0;
    let bulletSpeed = 60;
    let layer = 0;
    let index = 0;
    let originX, originY;
    if (pattern.objectStick) {
      if (pattern.objectStick == "player") {
        pattern.objectStick = this.player;
      } else if (typeof pattern.objectStick === "number") {
        pattern.objectStick = this.enemy[pattern.objectStick];
      }
      originX = generateNumber(
        objectStick.x + pattern.positionX,
        pattern.randomPositionX
      );
      originY = generateNumber(
        objectStick.y + pattern.positionY,
        pattern.randomPositionY
      );
    } else {
      originX = generateNumber(pattern.positionX, pattern.randomPositionX);
      originY = generateNumber(pattern.positionY, pattern.randomPositionY);
    }
    if (pattern.style == 0) {
      let speed = pattern.speed;
      let direction = pattern.aim
        ? generateNumber(
            57.29578 *
              Math.atan((originX - this.player.x) / (this.player.y - originY)) +
              (this.player.y > originY ? 180 : 0) +
              pattern.direction,
            pattern.randomDirection
          )
        : generateNumber(pattern.direction, pattern.randomDirection);
      for (layer = 0; layer < pattern.layer; layer++) {
        let layerSpeed =
          speed + ((pattern.speedLast - speed) * layer) / pattern.layer;
        let layerDirection = direction + layer * pattern.layerOffset;
        for (index = 0; index < pattern.amount; index++) {
          bulletDirection = layerDirection + (index * 360) / pattern.amount;
          bulletX = originX + Math.cos(bulletDirection * 0.0174533);
          bulletY = originY - Math.sin(bulletDirection * 0.0174533);
          bulletDirection =
            generateNumber(bulletDirection, pattern.randomMemberDirection) +
            pattern.turnDirection;
          bulletSpeed = generateNumber(layerSpeed, pattern.randomSpeed);
          (!pattern.failChance || random() > pattern.failChance) &&
            this.bulletsPool.fire(
              bulletX,
              bulletY,
              bulletDirection,
              bulletSpeed,
              pattern.sprite,
              pattern.danmakuData
            );
        }
      }
    } else if (pattern.style == 1) {
      let speed = pattern.speed;
      let direction = pattern.aim
        ? generateNumber(
            57.29578 *
              Math.atan((originX - this.player.x) / (this.player.y - originY)) +
              (this.player.y > originY ? 180 : 0) +
              pattern.direction,
            pattern.randomDirection
          )
        : generateNumber(pattern.direction, pattern.randomDirection);
      for (layer = 0; layer < pattern.layer; layer++) {
        let layerField = pattern.field + pattern.layerOffset * layer;
        let layerSpeed =
          speed + ((pattern.speedLast - speed) * layer) / pattern.layer;
        let layerDirection = direction;
        for (index = 0; index < pattern.amount; index++) {
          bulletDirection =
            layerDirection +
            (index * layerField) / pattern.amount -
            layerField * 0.5 +
            (layerField / pattern.amount) * 0.5;
          bulletX = originX + Math.cos(bulletDirection * 0.0174533);
          bulletY = originY - Math.sin(bulletDirection * 0.0174533);
          bulletDirection =
            generateNumber(bulletDirection, pattern.randomMemberDirection) +
            pattern.turnDirection;
          bulletSpeed = generateNumber(layerSpeed, pattern.randomSpeed);
          (!pattern.failChance || random() > pattern.failChance) &&
            this.bulletsPool.fire(
              bulletX,
              bulletY,
              bulletDirection,
              bulletSpeed,
              pattern.sprite,
              pattern.danmakuData
            );
        }
      }
    }
  }
  buttonSet() {
    globalVar.up = this.add.image(56, 66, "buttons", "up");
    globalVar.left = this.add.image(20, 102, "buttons", "left");
    globalVar.down = this.add.image(56, 102, "buttons", "down");
    globalVar.right = this.add.image(92, 102, "buttons", "right");
    globalVar.w = this.add.image(56, 154, "buttons", "w");
    globalVar.a = this.add.image(20, 190, "buttons", "a");
    globalVar.s = this.add.image(56, 190, "buttons", "s");
    globalVar.d = this.add.image(92, 190, "buttons", "d");
    globalVar.shift = this.add.image(38, 282, "buttons", "shift");
    globalVar.k = this.add.image(92, 282, "buttons", "k");
  }
  buttonEffect() {
    globalVar.up.setAlpha(this.keys.up2.isDown ? 1 : 0);
    globalVar.left.setAlpha(this.keys.left2.isDown ? 1 : 0);
    globalVar.down.setAlpha(this.keys.down2.isDown ? 1 : 0);
    globalVar.right.setAlpha(this.keys.right2.isDown ? 1 : 0);
    globalVar.w.setAlpha(this.keys.up.isDown ? 1 : 0);
    globalVar.a.setAlpha(this.keys.left.isDown ? 1 : 0);
    globalVar.s.setAlpha(this.keys.down.isDown ? 1 : 0);
    globalVar.d.setAlpha(this.keys.right.isDown ? 1 : 0);
    globalVar.shift.setAlpha(this.keys.aKey2.isDown ? 1 : 0);
    globalVar.k.setAlpha(this.keys.aKey.isDown ? 1 : 0);
  }
  playerHit() {
    if (!this.invulnerable) {
      this.pichuun.play();
      this.bulletsPool.clearSomeBullets();
      this.invulnerable = 120;
      this.capture = false;
      this.life--;
      this.lifeCount.setText("× " + (this.life - 1));
      if (!this.life) {
        this.scene.start("game-over", globalVar);
      }
    }
  }
}
