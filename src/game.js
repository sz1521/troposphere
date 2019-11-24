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

import { GameLoop, bindKeys, keyPressed, initKeys } from "kontra";
import { playTune } from "./music.js";
import { renderTexts, renderUi } from "./ui.js";
import { Level } from "./level.js";
import { createLevel, maxLevel } from "./levels.js";
import { createCamera } from "./camera.js";
import { imageFromSvg } from "./utils.js";
import playerSvg from "./images/player.svg";

const playerImage = imageFromSvg(playerSvg);

const GAME_STATE_LOADING = 0;
const GAME_STATE_RUNNING = 1;
const GAME_STATE_LEVEL_FINISHED = 2;

let canvas;
let context;

let levelNumber = 0;
let gameFinished = false;
let state = GAME_STATE_LOADING;

let gameLoop;
let level;
let camera;

const createStartScreenLoop = () => {
  return GameLoop({
    update() {},

    render() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      let gradient = context.createLinearGradient(
        0,
        canvas.height / 2,
        0,
        canvas.height
      );
      gradient.addColorStop(0, "rgb(0,0,25");
      gradient.addColorStop(0.2, "rgb(255,0,0)");
      gradient.addColorStop(0.3, "rgb(255,200,0)");
      gradient.addColorStop(0.8, "rgb(80,80,200)");
      gradient.addColorStop(1, "rgb(100,100,255)");

      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);

      context.drawImage(playerImage, canvas.width * 0.8, canvas.height / 3);

      if (state === GAME_STATE_LOADING) {
        renderStartScreen("Loading.............          ");
      } else {
        renderStartScreen("Press enter to start          ");
      }
    }
  });
};

const createGameLoop = () => {
  return GameLoop({
    update() {
      let timeTravelPressed = keyPressed("t");
      let antiGravityPressed = keyPressed("space") || keyPressed("g");

      level.update(timeTravelPressed, antiGravityPressed, camera);
      camera.update();

      if (level.isFinished && state === GAME_STATE_RUNNING) {
        state = GAME_STATE_LEVEL_FINISHED;
        level.playFinishAnimation();
        setTimeout(() => {
          levelNumber++;
          startLevel(levelNumber);
        }, 1500);
      }
    },

    render() {
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.scale(camera.zoom, camera.zoom);
      context.translate(-camera.x, -camera.y);

      level.render(context, camera);

      context.restore();

      renderUi(context, level);
      renderHelpTexts(context);
    }
  });
};

const renderHelpTexts = context => {
  if (level.isFailed()) {
    renderTexts(context, "Press ENTER to try again");
  } else if (gameFinished) {
    renderTexts(
      context,
      "CONGRATULATIONS!       ",
      "YOU ARE ON YOUR WAY TO BACK HOME!      ",
      "(Press ESC to continue)"
    );
    levelNumber = 1;
  }
};

const listenKeys = () => {
  bindKeys(["esc"], () => {
    levelNumber = 0;
    startLevel(levelNumber);
  });

  // Keys for debugging
  bindKeys(["1"], () => {
    camera.follow(level.player);
  });
  bindKeys(["2"], () => {
    camera.zoomToLevel();
  });
  bindKeys(["n"], () => {
    if (levelNumber < 4) levelNumber++;
    else levelNumber = 1;
    startLevel(levelNumber);
  });
};

const startLevel = number => {
  if (number > maxLevel) {
    gameFinished = true;
    return;
  }

  gameLoop.stop();
  gameFinished = false;

  createLevel(level, number);
  listenKeys();

  if (number === 0) {
    gameLoop = createStartScreenLoop();
  } else {
    camera.follow(level.player);
    gameLoop = createGameLoop();
  }

  if (number === 1) {
    // Music starts at the first actual level
    // and continues from level to level.
    playTune("main");
  }

  state = GAME_STATE_RUNNING;
  gameLoop.start();
};

const renderStartScreen = lastText => {
  renderTexts(
    context,
    "TROPOSPHERE                        ",
    "",
    "You are lost in a metropolis in a foreign planet.         ",
    "You need to find your way to back home by                 ",
    "using portals and climbing higher into Troposphere.       ",
    "",
    "Controls                                                   ",
    "Use ARROWS or W/A/S/D to move. Jump with UP or W.          ",
    "Press SPACE or G for anti-gravity jump (longer!/higher!)   ",
    "Hold T for time travel (uses lots of energy!)              ",
    "",
    "(c) 2019 by Sami H & Tero J          ",
    "",
    lastText
  );
};

export const initializeGame = (canvasReference, contextReference) => {
  canvas = canvasReference;
  context = contextReference;
  state = GAME_STATE_LOADING;

  initKeys();
  level = new Level();
  camera = createCamera(level, canvas);

  levelNumber = 0;
  gameLoop = createStartScreenLoop();
  gameLoop.start();
};

export const startGame = () => {
  state = GAME_STATE_RUNNING;

  bindKeys(["enter"], () => {
    if (levelNumber === 0) {
      levelNumber = 1;
      startLevel(levelNumber);
    } else if (level.isFailed()) {
      playTune("main");
      startLevel(levelNumber);
    }
  });
};
