/*
 * Copyright (c) 2019 Sami H, Tero Jäntti
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies
 * of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
 * BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { Sprite } from "kontra";
import { playTune } from "./music.js";
import { imageFromSvg, random } from "./utils.js";
import { createEnemy } from "./enemy.js";
import { createCloud, createLadder, createPlatform } from "./elements.js";
import houseSvg from "./images/house.svg";

const houseImage = imageFromSvg(houseSvg);

const FRAMES_PER_SECOND = 60;
const TIME_BACK_MAX_SECONDS = 2;
const TIME_BACK_MAX_FRAMES = TIME_BACK_MAX_SECONDS * FRAMES_PER_SECOND;

const ENEMY_HIT_ENERGY_CONSUMPTION = 1000;
const TIME_BACK_ENERGY_CONSUMPTION = 70;

const consumeTimeTravelEnergy = player => {
  if (
    player.energy >= TIME_BACK_ENERGY_CONSUMPTION &&
    player.timeTravelFrames < TIME_BACK_MAX_FRAMES
  ) {
    player.energy -= TIME_BACK_ENERGY_CONSUMPTION;
    player.timeTravelFrames += 1;
    return true;
  }
};

const timeTravelUpdate = (entity, back) => {
  if (!entity.positions) {
    entity.positions = [];
  }

  if (back) {
    if (entity.positions.length > 0) {
      let position = entity.positions.pop();
      entity.position = position;
    }
  } else {
    entity.positions.push(entity.position);
    if (entity.positions.length > TIME_BACK_MAX_FRAMES) {
      entity.positions.shift();
    }

    entity.update();
  }
};

export class Level {
  constructor() {
    this.left = 0;
    this.top = 0;
    this.width = 4000;
    this.height = 4000;
    this.clear();
  }

  clear() {
    this.isFinished = false;
    this.clouds0 = [];
    this.clouds1 = [];
    this.ladders = [];
    this.platforms = [];
    this.platformBgs = [];
    this.backgroundObjects = [];
    this.enemies = [];
    this.portals = [];
    this.player = null;
  }

  render(context, camera) {
    this.renderBackground(context);

    for (let i = 0; i < this.clouds0.length; i++) {
      let cloud0 = this.clouds0[i];
      cloud0.render();
    }

    for (let i = 0; i < this.backgroundObjects.length; i++) {
      let object = this.backgroundObjects[i];
      object.render();
    }

    for (let i = 0; i < this.platformBgs.length; i++) {
      this.platformBgs[i].render();
    }

    for (let i = 0; i < this.platforms.length; i++) {
      this.platforms[i].render();
    }

    for (let i = 0; i < this.ladders.length; i++) {
      let ladder = this.ladders[i];
      ladder.render();
    }

    for (let i = 0; i < this.portals.length; i++) {
      this.portals[i].render();
    }

    for (let i = 0; i < this.enemies.length; i++) {
      this.enemies[i].render();
    }

    this.player.render();

    for (let i = 0; i < this.clouds1.length; i++) {
      let cloud1 = this.clouds1[i];
      cloud1.render();
    }

    // Draw level borders for debugging
    if (!camera.target) {
      context.save();
      context.strokeStyle = "red";
      context.lineWidth = 5;
      context.beginPath();
      context.lineTo(0, 0);
      context.lineTo(this.width, 0);
      context.lineTo(this.width, this.height);
      context.lineTo(0, this.height);
      context.closePath();
      context.stroke();
      context.restore();
    }
  }

  renderBackground(context) {
    let gradient = context.createLinearGradient(0, 0, 0, this.height);

    switch (this.number) {
      case 1: {
        gradient.addColorStop(0, "rgb(80,80,200)");
        gradient.addColorStop(1, "rgb(100,100,255)");
        break;
      }
      case 2: {
        gradient.addColorStop(0, "rgb(255,200,0)");
        gradient.addColorStop(1, "rgb(80,80,200)");
        break;
      }
      case 3: {
        gradient.addColorStop(0, "rgb(0,0,25");
        gradient.addColorStop(0.5, "rgb(255,0,0)");
        gradient.addColorStop(1, "rgb(255,200,0)");
        break;
      }
    }

    context.fillStyle = gradient;
    context.fillRect(0, 0, this.width, this.height);
  }

  createCloudLayer(y, opacity) {
    for (let i = 0; i < 20; i++) {
      let cloud0 = createCloud(this, y, 0, opacity);
      this.clouds0.push(cloud0);
    }

    for (let i = 0; i < 20; i++) {
      let cloud1 = createCloud(this, y, 1, opacity);
      this.clouds1.push(cloud1);
    }
  }

  createHouseLayer(isDouble) {
    for (let i = 0; i < this.width / 10; i++) {
      let house = Sprite({
        width: 80,
        height: 150 - Math.random() * 100,

        render: function() {
          this.context.drawImage(houseImage, this.x, this.y);
        }
      });
      house.x = i * Math.random() * 100;
      house.y = this.height - house.height;
      this.backgroundObjects.push(house);
      if (isDouble) {
        let house2 = Sprite({
          width: 80,
          height: 150 - Math.random() * 100,

          render: function() {
            this.context.drawImage(houseImage, this.x, this.y);
          }
        });
        house2.x = house.x;
        house2.y = house.y - house.height;
        this.backgroundObjects.push(house2);
      }
    }
  }

  addLadder(platform) {
    let ladder = createLadder();
    ladder.x = platform.x + 20;
    ladder.y = platform.y;
    this.ladders.push(ladder);
  }

  createTower(x, floorCount) {
    const floorWidth = 800;
    const floorHeight = 300;

    let isHoleOnPreviousLayer = false;

    for (let i = 0; i < floorCount; i++) {
      const floorTop = this.height - (i + 1) * floorHeight;
      const floorLeft = x - floorWidth / 2;
      const floorRight = floorLeft + floorWidth;

      // No two consecutive platforms with holes in them.
      if (isHoleOnPreviousLayer || random() < 0.8) {
        // One solid platform
        let platform = createPlatform(false);
        platform.width = floorWidth;
        platform.x = floorLeft;
        platform.y = floorTop;
        this.platforms.push(platform);

        this.addLadder(platform);

        if (random() < 0.7) {
          let enemy = createEnemy(platform);
          enemy.x = floorLeft + random(floorWidth - enemy.width);
          enemy.y = floorTop - enemy.height;
          this.enemies.push(enemy);
        }

        isHoleOnPreviousLayer = false;
      } else {
        // Two platforms and a hole between them.
        const lessWidth = floorWidth / 3;

        let p1 = createPlatform(false);
        p1.width = lessWidth;
        p1.x = floorLeft;
        p1.y = floorTop;
        this.platforms.push(p1);
        this.addLadder(p1);

        let p2 = createPlatform(false);
        p2.width = lessWidth;
        p2.x = floorRight - lessWidth;
        p2.y = floorTop;
        this.platforms.push(p2);

        isHoleOnPreviousLayer = true;
      }

      let platformBg = createPlatform(true);
      platformBg.width = floorWidth;
      platformBg.x = floorLeft;
      platformBg.y = floorTop;
      this.platformBgs.push(platformBg);
    }

    return {
      x,
      width: floorWidth,
      height: floorCount * floorHeight,
      top: this.height - floorCount * floorHeight,
      bottom: this.height,
      left: x - floorWidth / 2,
      right: x + floorWidth / 2
    };
  }

  hitPlayer(enemy) {
    if (this.isFinished) {
      return;
    }

    enemy.hit();
    playTune("hit");

    if (this.player.energy >= ENEMY_HIT_ENERGY_CONSUMPTION) {
      this.player.energy -= ENEMY_HIT_ENERGY_CONSUMPTION;
    }

    const enemyCenter = enemy.x + enemy.width / 2;
    const playerCenter = this.player.x + this.player.width / 2;
    const direction = Math.sign(playerCenter - enemyCenter);
    this.player.hit(direction * 20);
  }

  update(timeTravelPressed, antiGravityPressed, camera) {
    let canTimeTravel = false;

    if (timeTravelPressed) {
      canTimeTravel = consumeTimeTravelEnergy(this.player);
      if (canTimeTravel) {
        this.player.isTimeTravelling = true;
      }
    } else {
      if (this.player.timeTravelFrames > 0) {
        this.player.timeTravelFrames -= 1;
      }
      this.player.isTimeTravelling = false;
    }

    // Don't update when reaching time travel limit.
    if (!timeTravelPressed || canTimeTravel) {
      this.updateEntities(timeTravelPressed, antiGravityPressed, camera);
    }
  }

  updateEntities(timeTravelPressed, antiGravityPressed, camera) {
    for (let i = 0; i < this.clouds0.length; i++) {
      timeTravelUpdate(this.clouds0[i], timeTravelPressed);
      timeTravelUpdate(this.clouds1[i], timeTravelPressed);
    }

    for (let i = 0; i < this.enemies.length; i++) {
      let enemy = this.enemies[i];

      timeTravelUpdate(enemy, timeTravelPressed);

      if (enemy.collidesWith(this.player)) {
        this.hitPlayer(enemy);
      }
    }

    // The player stays put when moving back in time.
    if (!timeTravelPressed) {
      this.player.update(
        this.ladders,
        this.platforms,
        camera,
        antiGravityPressed
      );
    }

    for (let i = 0; i < this.portals.length; i++) {
      if (this.portals[i].collidesWith(this.player)) {
        this.isFinished = true;
      }
    }
  }

  playFinishAnimation() {
    this.player.swirl();
  }

  isFailed() {
    return this.player && this.player.isDead();
  }
}
