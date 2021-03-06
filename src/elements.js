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
import { imageFromSvg } from "./utils.js";
import houseSvg from "./images/house.svg";

const houseImage = imageFromSvg(houseSvg);

const ladderWidth = 30;
const ladderHeight = 300;

export const createCloud = (level, y, z, opacity) => {
  return Sprite({
    x: Math.random() * level.width * (5 / 4) - level.width / 4,
    y:
      z === 0
        ? y + (Math.random() * 200 - 102120)
        : y + (Math.random() * 200 - 100),
    color: "white",
    opacity: z === 0 ? 0.95 * opacity : 0.7 * opacity,
    dx: z === 0 ? 0.07 + Math.random() * 0.1 : 0.05 + Math.random() * 0.1,
    radius: 20 + Math.random() * Math.random() * 70,

    update: function() {
      this.advance();
      if (this.x - 300 > level.width) {
        this.x = -600;
      }
    },

    render: function() {
      let cx = this.context;
      cx.save();
      cx.fillStyle = this.color;
      cx.globalAlpha = this.opacity;
      cx.beginPath();
      let startX = this.x;
      let startY = this.y;
      cx.moveTo(startX, startY);
      cx.bezierCurveTo(
        startX - 40,
        startY + 20,
        startX - 40,
        startY + 70,
        startX + 60,
        startY + 70
      );
      if (this.radius < 45) {
        cx.bezierCurveTo(
          startX + 80,
          startY + 100,
          startX + 150,
          startY + 100,
          startX + 170,
          startY + 70
        );
      }
      cx.bezierCurveTo(
        startX + 250,
        startY + 70,
        startX + 250,
        startY + 40,
        startX + 220,
        startY + 20
      );
      cx.bezierCurveTo(
        startX + 260,
        startY - 40,
        startX + 200,
        startY - 50,
        startX + 170,
        startY - 40
      );
      cx.bezierCurveTo(
        startX + 150,
        startY - 75,
        startX + 80,
        startY - 60,
        startX + 80,
        startY - 40
      );
      cx.bezierCurveTo(
        startX + 30,
        startY - 75,
        startX - 20,
        startY - 60,
        startX,
        startY
      );

      cx.closePath();
      cx.fill();
      cx.restore();
    }
  });
};

const drawLadder = () => {
  const stepGap = 15;
  const stepCount = ladderHeight / stepGap;
  const color = "rgb(100,60,60)";
  const color2 = "rgb(80,20,20)";

  const canvas = document.createElement("canvas");
  canvas.width = ladderWidth;
  canvas.height = ladderHeight;

  let cx = canvas.getContext("2d");
  cx.save();

  for (let i = 0; i < stepCount; i++) {
    cx.fillStyle = color2;
    cx.fillRect(8, i * stepGap, ladderWidth - 16, stepGap / 2);
    cx.fillStyle = color;
    cx.fillRect(0, i * stepGap + stepGap / 2, ladderWidth, stepGap / 2);
  }

  cx.restore();

  return canvas;
};

const ladderImage = drawLadder();

export const createLadder = () => {
  return Sprite({
    color: "rgb(100,60,60)",
    color2: "rgb(80,20,20)",
    width: ladderWidth,
    height: ladderHeight,

    render: function() {
      let cx = this.context;
      cx.drawImage(ladderImage, this.x, this.y);
    }
  });
};

export const createPlatform = isBackground => {
  return Sprite({
    color: "darkgray",
    color2: "rgb(80,80,80)",
    color3: "rgb(55,55,75)",
    width: 200,
    height: !isBackground ? 20 : 400,
    opacity: 0.1,

    render: function() {
      const stepGap = 20;
      const stepCount = this.height / stepGap;
      let cx = this.context;
      cx.save();
      if (!isBackground) {
        for (let i = 0; i < stepCount; i++) {
          cx.fillStyle = this.color2;
          cx.fillRect(this.x + 2, this.y + i * stepGap, this.width - 4, 10);
          cx.fillStyle = this.color;
          cx.fillRect(this.x, this.y + i * stepGap + 15, this.width, 10);
        }
      } else {
        cx.globalAlpha = this.opacity;
        cx.fillStyle = this.color3;
        cx.fillRect(this.x, this.y, this.width, this.height);
        cx.strokeStyle = this.color3;
        cx.lineWidth = 1;
        cx.strokeRect(this.x, this.y, this.width, this.height);
      }

      cx.restore();
    }
  });
};

export const createRoof = level => {
  return Sprite({
    color: "darkgray",
    width: level.width,
    height: 30,
    x: 0,
    y: level.height - 30,

    render: function() {
      let cx = this.context;
      cx.save();
      cx.fillStyle = this.color;
      cx.fillRect(this.x, this.y, this.width, this.height);
      cx.restore();
    }
  });
};

const createHouseBackgroundImage = (width, isDouble) => {
  const height = 300;

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  let cx = canvas.getContext("2d");
  cx.save();

  for (let i = 0; i < width / 10; i++) {
    const houseHeight = 150 - Math.random() * 100;
    const x = i * Math.random() * 100;
    const y = height - houseHeight;

    cx.drawImage(houseImage, x, y);

    if (isDouble) {
      cx.drawImage(houseImage, x, height - houseHeight * 2);
    }
  }

  cx.restore();

  return canvas;
};

export const createHouseBackground = (width, isDouble) => {
  const image = createHouseBackgroundImage(width, isDouble);

  return Sprite({
    width: width,
    height: image.height,

    render: function() {
      this.context.drawImage(image, this.x, this.y);
    }
  });
};
