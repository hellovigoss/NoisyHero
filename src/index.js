import Phaser from 'phaser';
import logoImg from './assets/logo.png';
import { startCapture, visualize } from "./audio.js";

class NoisyHeroGame extends Phaser.Scene {
  #stockGroups
  #player
  #analyser

  constructor() {
    super();
  }
  #draw() {
    this.#player = this.physics.add.group()
    let graph = new Phaser.GameObjects.Graphics(this);
    graph.lineStyle(5, 0xFF00FF, 1.0);
    graph.fillStyle(0xFFFFFF, 0.8);
    graph.fillCircle(14, 14, 14);
    this.#player.add(graph, true);
    graph.body.setBounce(0.8);
    graph.body.setGravityY(100);
    graph.body.setVelocityX(Phaser.Math.Between(-30,30));
    console.log(graph.body.x, graph.body.y, graph.body.width, graph.body.height);
    graph.body.setCircle(14, 0, 0);
    graph.body.setCollideWorldBounds(true)
  }
  setStockGroups(group) {
    this.#stockGroups = group;
  }
  #visualize(analyser, scence) {

    let WIDTH = scence.scale.width;
    let HEIGHT = scence.scale.height;

    analyser.fftSize = 256;
    const bufferLengthAlt = analyser.frequencyBinCount;

    // See comment above for Float32Array()
    const dataArrayAlt = new Uint8Array(bufferLengthAlt);

    analyser.getByteFrequencyData(dataArrayAlt);
    const barWidth = (WIDTH / bufferLengthAlt) * 2.5;

    let group = scence.physics.add.group();
    scence.setStockGroups(group)
    for (let i = 0; i < bufferLengthAlt; i++) {
      let rect = new Phaser.GameObjects.Rectangle(
        scence,
        i * barWidth + (barWidth / 2),
        (HEIGHT * 3),
        barWidth - 1,
        HEIGHT * 2,
        0xFF3231,
        1
      );
      group.add(rect, true);
      rect.body.setAllowGravity(false);
    }

  }

  preload() {
    this.load.image('logo', logoImg);
  }

  create() {
    this.#draw();
    startCapture(
      document.getElementById("play"),
      this,
      (scence, analyser) => {
        this.#visualize(analyser, scence);
        scence.#analyser = analyser;
      }
    );
  }

  update(time, delta) {
    if (typeof this.#analyser !== "undefined" && this.#analyser) {
      const bufferLengthAlt = this.#analyser.frequencyBinCount;
      const dataArrayAlt = new Uint8Array(bufferLengthAlt);
      this.#analyser.getByteFrequencyData(dataArrayAlt);
      for (let i = 0; i < dataArrayAlt.length; i++) {
        let entry = this.#stockGroups.children.entries[i];
        entry.setAlpha(dataArrayAlt[i]/128)
        this.physics.moveTo(entry, entry.x, (this.scale.height * 3) - dataArrayAlt[i], 160, 100);
      }
      this.physics.add.collider(this.#player, this.#stockGroups);
      // this.#stockGroups.refresh();
    }
    // console.log(time, delta);


  }
}

const config = {
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 100,
  scene: NoisyHeroGame,
  physics: {
    default: "arcade",
    arcade: {
      gravity: {
        // y: 200
      },
      debug: true
    }
  }
};

const game = new Phaser.Game(config);