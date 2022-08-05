import Menu from "./scenes/Menu.js";
import Game from "./scenes/Game.js";
import Gameover from "./scenes/Gameover.js";

const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 480,
    scene: [Menu, Game, Gameover],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {x: 0, y: 0}
        }
    }
}
export default new Phaser.Game(config);


