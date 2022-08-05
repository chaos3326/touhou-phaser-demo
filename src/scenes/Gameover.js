var globalVar = {};
var keyConfig = {
    up:     Phaser.Input.Keyboard.KeyCodes.W,
    up2:    Phaser.Input.Keyboard.KeyCodes.UP,
    down:   Phaser.Input.Keyboard.KeyCodes.S,
    down2:   Phaser.Input.Keyboard.KeyCodes.DOWN,
    left:   Phaser.Input.Keyboard.KeyCodes.A,
    left2:   Phaser.Input.Keyboard.KeyCodes.LEFT,
    right:  Phaser.Input.Keyboard.KeyCodes.D,
    right2:  Phaser.Input.Keyboard.KeyCodes.RIGHT,
    aKey:   Phaser.Input.Keyboard.KeyCodes.K,
    aKey2:   Phaser.Input.Keyboard.KeyCodes.SHIFT,
    bKey:   Phaser.Input.Keyboard.KeyCodes.O,
    bKey2:   Phaser.Input.Keyboard.KeyCodes.Z,
    enter:  Phaser.Input.Keyboard.KeyCodes.ENTER
}
export default class Gameover extends Phaser.Scene {
    init(data) {
        this.best = data.best;
        this.score = data.time;
    }
    constructor() {
        super('game-over');
    }
    preload() {
        this.load.image('gameover', 'assets/images/gameover.png');
    }
    create() {
        this.add.image(320, 240, 'gameover');
        this.add.text(536, 48, this.numPadding(this.best, 8), {font: "22px Arial", fill: "#FFFFFF", align: "right"})    
        this.add.text(536, 108, this.numPadding(this.score, 8), {font: "22px Arial", fill: "#FFFFFF", align: "right"})
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('game', {});
        })
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('game', {});
        })
        this.input.keyboard.once('keydown-ESC', () => {
            globalVar.data = {"best": this.numPadding(this.best, 8)}
            this.scene.start('menu', globalVar.data);
        })
        this.buttonSet();
        this.keys = this.input.keyboard.addKeys(keyConfig);
    }
    update() {
        this.buttonEffect();
    }
    numPadding(number, length) {
        let s = number + "";
        while (s.length < length) s = "0" + s;
        return s;
    }
    buttonSet() {
        globalVar.up = this.add.image(56, 66, 'buttons', 'up');
        globalVar.left = this.add.image(20, 102, 'buttons', 'left');
        globalVar.down = this.add.image(56, 102, 'buttons', 'down');
        globalVar.right = this.add.image(92, 102, 'buttons', 'right');
        globalVar.w = this.add.image(56, 154, 'buttons', 'w');
        globalVar.a = this.add.image(20, 190, 'buttons', 'a');
        globalVar.s = this.add.image(56, 190, 'buttons', 's');
        globalVar.d = this.add.image(92, 190, 'buttons', 'd');
        globalVar.shift = this.add.image(38, 282, 'buttons', 'shift');
        globalVar.k = this.add.image(92, 282, 'buttons', 'k');
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
}