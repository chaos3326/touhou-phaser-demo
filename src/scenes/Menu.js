var globalVar = {time: 0};
var keyConfig = {
    up:     Phaser.Input.Keyboard.KeyCodes.W,
    up2:    Phaser.Input.Keyboard.KeyCodes.UP,
    down:   Phaser.Input.Keyboard.KeyCodes.S,
    down2:  Phaser.Input.Keyboard.KeyCodes.DOWN,
    left:   Phaser.Input.Keyboard.KeyCodes.A,
    left2:  Phaser.Input.Keyboard.KeyCodes.LEFT,
    right:  Phaser.Input.Keyboard.KeyCodes.D,
    right2: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    aKey:   Phaser.Input.Keyboard.KeyCodes.K,
    aKey2:  Phaser.Input.Keyboard.KeyCodes.SHIFT,
    bKey:   Phaser.Input.Keyboard.KeyCodes.O,
    bKey2:  Phaser.Input.Keyboard.KeyCodes.Z,
    space:  Phaser.Input.Keyboard.KeyCodes.SPACE,
    enter:  Phaser.Input.Keyboard.KeyCodes.ENTER
}
var gameData = {
    choice: {
        x: 120960,
        y: 120960,
        choice: 0,
    }
}

export default class Menu extends Phaser.Scene {
    init(data) {
        gameData.danmaku && (gameData.danmaku.danmaku[gameData.choice.choice].hiScore = data.best);
    }
    constructor() {
        super('menu');
    }
    preload() {
        this.load.image('menu'    , 'assets/images/menu.png');
        this.load.image('pointer' , 'assets/images/pointer.png');
        this.load.atlas('buttons' , 'assets/images/buttons.png' , 'assets/images/buttons.json');
        this.load.atlas('previews', 'assets/images/previews.png', 'assets/images/previews.json')
        this.load.json('danmakuData', 'assets/danmakuData.json');
    }
    create() {
        gameData.danmaku = this.cache.json.get('danmakuData');
        this.add.image(320, 240, 'menu');
        this.pointer = this.add.image(gameData.danmaku.danmaku[gameData.choice.choice].menuPosition.x,
            gameData.danmaku.danmaku[gameData.choice.choice].menuPosition.y, 'pointer');
        this.spellcardInfo = [0, 1, 2, 3, 4];
        this.buttonSet();
        this.keys = this.input.keyboard.addKeys(keyConfig);
        this.createSpellcardInfo();
        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('game', gameData.danmaku.danmaku[gameData.choice.choice]);
        })
        this.input.keyboard.once('keydown-ENTER', () => {
            this.scene.start('game', gameData.danmaku.danmaku[gameData.choice.choice]);
        })
    }
    update() {
        globalVar.time++;
        this.buttonEffect();
        this.pointerEffect();
        this.choiceUpdate();
    }
    numPadding(number, length) {
        let s = number + "";
        while (s.length < length) s = "0" + s;
        return s;
    }
    createSpellcardInfo() {
        this.preview = this.add.sprite(168, 408, 'previews', gameData.danmaku.danmaku[gameData.choice.choice].name);
        this.spellcardInfo[0] = this.add.text(230, 360, gameData.danmaku.danmaku[gameData.choice.choice].name, 
                {font: "16px Arial", fill: "#FFFFFF", align: "right"});
        for (let i = 0; i < 4; i++)
            this.spellcardInfo[i+1] = this.add.text(230, 388 + i*18, gameData.danmaku.danmaku[gameData.choice.choice].description[i], 
                    {font: "12px Arial", fill: "#FFFFFF", align: "right"});
        for (let i = 0; i < 14; i++) {
            let xcor, ycor;
            if (i % 2 == 0) {
                xcor = 244;
                ycor = 44 + i * 24;
            }
            else {
                xcor = 494;
                ycor = 20 + i * 24;
            }
            this.add.text(xcor, ycor, gameData.danmaku.danmaku[i].hiScore, {font: "14px Arial", fill: "#FFFFFF", align: "right"});
        }
    }
    updateSpellcardInfo() {
        this.preview.setTexture('previews', gameData.danmaku.danmaku[gameData.choice.choice].name)
        this.spellcardInfo[0].setText(gameData.danmaku.danmaku[gameData.choice.choice].name);
        for (let i = 0; i < 4; i++)
            this.spellcardInfo[i+1].setText(gameData.danmaku.danmaku[gameData.choice.choice].description[i]);
    }
    buttonSet() {
        globalVar.up    = this.add.image(56, 66, 'buttons', 'up');
        globalVar.left  = this.add.image(20, 102, 'buttons', 'left');
        globalVar.down  = this.add.image(56, 102, 'buttons', 'down');
        globalVar.right = this.add.image(92, 102, 'buttons', 'right');
        globalVar.w     = this.add.image(56, 154, 'buttons', 'w');
        globalVar.a     = this.add.image(20, 190, 'buttons', 'a');
        globalVar.s     = this.add.image(56, 190, 'buttons', 's');
        globalVar.d     = this.add.image(92, 190, 'buttons', 'd');
        globalVar.shift = this.add.image(38, 282, 'buttons', 'shift');
        globalVar.k     = this.add.image(92, 282, 'buttons', 'k');
        globalVar.space = this.add.image(38, 374, 'buttons', 'space')
        globalVar.enter = this.add.image(92, 374, 'buttons', 'enter')
    }
    buttonEffect() {
        globalVar.up   .setAlpha(this.keys.up2.isDown ? 1 : 0);
        globalVar.left .setAlpha(this.keys.left2.isDown ? 1 : 0);
        globalVar.down .setAlpha(this.keys.down2.isDown ? 1 : 0);
        globalVar.right.setAlpha(this.keys.right2.isDown ? 1 : 0);
        globalVar.w    .setAlpha(this.keys.up.isDown ? 1 : 0);
        globalVar.a    .setAlpha(this.keys.left.isDown ? 1 : 0);
        globalVar.s    .setAlpha(this.keys.down.isDown ? 1 : 0);
        globalVar.d    .setAlpha(this.keys.right.isDown ? 1 : 0);
        globalVar.shift.setAlpha(this.keys.aKey2.isDown ? 1 : 0);
        globalVar.k    .setAlpha(this.keys.aKey.isDown ? 1 : 0);
        globalVar.space.setAlpha(this.keys.space.isDown ? 1 : 0);
        globalVar.enter.setAlpha(this.keys.enter.isDown ? 1 : 0);
    }
    pointerEffect() {
        this.pointer.setAlpha(globalVar.time % 60 / 59);
        
    }
    choiceUpdate() {
        let up = Phaser.Input.Keyboard.JustDown(this.keys.up) 
            || Phaser.Input.Keyboard.JustDown(this.keys.up2);
        let down = Phaser.Input.Keyboard.JustDown(this.keys.down) 
            || Phaser.Input.Keyboard.JustDown(this.keys.down2);
        let left = Phaser.Input.Keyboard.JustDown(this.keys.left) 
            || Phaser.Input.Keyboard.JustDown(this.keys.left2);
        let right = Phaser.Input.Keyboard.JustDown(this.keys.right) 
            || Phaser.Input.Keyboard.JustDown(this.keys.right2);
        if (up || down || left || right) {
            up && gameData.choice.y--;
            down && gameData.choice.y++;
            left && gameData.choice.x--;
            right && gameData.choice.x++;
            gameData.choice.choice = (gameData.choice.x % 2) + (gameData.choice.y % 7) * 2;
            this.pointer.setPosition(gameData.danmaku.danmaku[gameData.choice.choice].menuPosition.x,
                gameData.danmaku.danmaku[gameData.choice.choice].menuPosition.y);
        }
        this.updateSpellcardInfo();
    }
}