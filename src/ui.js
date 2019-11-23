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

import { MAX_ENERGY } from "./player.js";

const ENERGY_THRESHOLD_LOW = 4000;
const ENERGY_THRESHOLD_VERY_LOW = 2000;

export const renderTexts = (context, ...texts) => {
  const canvas = context.canvas;

  context.fillStyle = "white";
  context.font = "22px Sans-serif";

  for (let i = 0; i < texts.length; i++) {
    const text = texts[i];
    let textWidth = text.length * 14;
    const x = canvas.width / 2 - textWidth / 2;
    let y = canvas.height * 0.25 + i * 40;
    context.fillText(text, x, y);
  }
};

const renderEnergyBar = (context, level) => {
  const canvas = context.canvas;

  context.fillStyle = "white";
  context.font = "20px Sans-serif";
  context.fillText("ENERGY", 50, 35);

  const x = 50,
    y = 50,
    margin = 5,
    outlineWidth = canvas.width / 4,
    outlineHeight = 50,
    fullWidth = outlineWidth - 2 * margin,
    heigth = outlineHeight - 2 * margin,
    width = (level.player.energy / MAX_ENERGY) * fullWidth;

  context.lineWidth = 2;
  context.strokeStyle = "white";
  context.strokeRect(x, y, outlineWidth, outlineHeight);

  let color = "green";
  if (level.player.energy < ENERGY_THRESHOLD_VERY_LOW) {
    color = "red";
  } else if (level.player.energy < ENERGY_THRESHOLD_LOW) {
    color = "orange";
  }

  context.fillStyle = color;
  context.fillRect(x + margin, y + margin, width, heigth);
};

const renderStatusTexts = (context, level) => {
  context.font = "1em Sans-serif";
  context.fillStyle = "black";
  context.globalAlpha = 0.1;
  context.fillRect(0, 0, context.canvas.width / 4 + 100, 290);
  context.globalAlpha = 0.9;
  if (level.player.ag) {
    context.fillStyle = "white";
    context.fillText("ANTI-GRAVITY ACTIVATED", 50, 150);
  } else {
    context.fillStyle = "lightgray";
    context.fillText("ANTI-GRAVITY OFF", 50, 150);
  }
  context.fillText("[space] or [G]", 50, 170);

  if (level.player.isTimeTravelling) {
    context.fillStyle = "white";
    context.fillText("TIME TRAVELING ACTIVATED", 50, 220);
  } else {
    context.fillStyle = "lightgray";
    context.fillText("TIME TRAVELING OFF", 50, 220);
  }
  context.fillText("[T]", 50, 240);
  context.globalAlpha = 1;
};

const renderLevelNumber = (context, level) => {
  const canvas = context.canvas;

  context.fillStyle = "white";
  context.font = "20px Sans-serif";

  context.fillText("LEVEL", canvas.width - 120, 35);
  context.fillText(level.number, canvas.width - 40, 35);
};

export const renderUi = (context, level) => {
  renderEnergyBar(context, level);
  renderLevelNumber(context, level);
  renderStatusTexts(context, level);
};
