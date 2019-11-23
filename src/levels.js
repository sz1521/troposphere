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

import { random } from "./utils.js";
import { createPlayer } from "./player.js";
import { createDrone } from "./drone.js";
import { createPortal } from "./portal.js";

const createSimpleLevel = level => {
  level.width = 2000;
  level.height = 1500;

  level.createHouseLayer(true);
  const tower = level.createTower(1000, 3);

  let portal = createPortal();
  portal.x = tower.x - portal.width / 2;
  portal.y = tower.top - portal.height;
  level.portals.push(portal);

  level.player = createPlayer(level);
  level.player.x = 100;
  level.player.y = level.height - level.player.height;
};

const createLevelTwoTowers = level => {
  level.width = 4000;
  level.height = 4000;

  level.createCloudLayer(2400, 1);
  level.createCloudLayer(1200, 0.8);

  level.createHouseLayer(false);
  level.backgroundObjects.push(level.createRoof());

  const tower1 = level.createTower(1400, 7);
  const tower2 = level.createTower(2500, 10);

  let portal = createPortal();
  portal.x = tower2.right - tower2.width / 3;
  portal.y = tower2.top - portal.height;
  level.portals.push(portal);

  level.player = createPlayer(level);
  level.player.x = 1100;
  level.player.y = level.height - level.player.height;

  const wayPoints = [
    { x: tower1.left - 200, y: tower1.top + 300 },
    { x: tower1.left - 200, y: tower1.bottom - tower1.height / 2 },
    { x: tower1.x, y: tower1.top - 300 },

    { x: tower2.left - 200, y: tower2.top + 300 },
    { x: tower2.left - 200, y: tower2.bottom - tower2.height / 2 },
    { x: tower2.x, y: tower2.top - 300 },
    { x: tower2.right + 200, y: tower2.bottom - tower2.height / 2 }
  ];

  for (let i = 0; i < 8; i++) {
    let drone = createDrone(level.player, wayPoints);
    drone.x = random(level.width);
    drone.y = random(level.height - 500);
    level.enemies.push(drone);
  }
};

const createLevelHighTower = level => {
  level.width = 5000;
  level.height = 6000;

  level.createCloudLayer(4400, 0.7);
  level.createCloudLayer(2200, 0.5);

  level.backgroundObjects.push(level.createRoof());

  level.createTower(level.width * (1 / 4) + 100, 8);
  const tower2 = level.createTower(level.width * (2 / 4), 15);
  level.createTower(level.width * (3 / 4) - 100, 12);

  let portal = createPortal();
  portal.x = tower2.x;
  portal.y = tower2.top - portal.height;
  level.portals.push(portal);

  level.player = createPlayer(level);
  level.player.x = 1100;
  level.player.y = level.height - level.player.height;

  const wayPoints = [
    { x: tower2.left - 200, y: tower2.top - 500 },
    { x: tower2.left - 200, y: tower2.top + 1000 },
    { x: tower2.left - 200, y: tower2.top + 4000 },

    { x: tower2.right + 200, y: tower2.top - 300 },
    { x: tower2.right + 200, y: tower2.top + 1500 },
    { x: tower2.right + 200, y: tower2.top + 4500 }
  ];

  for (let i = 0; i < 12; i++) {
    let drone = createDrone(level.player, wayPoints);
    drone.x = random(level.width);
    drone.y = random(level.height - 500);
    level.enemies.push(drone);
  }
};

const levelCreations = [
  () => {},
  createSimpleLevel,
  createLevelTwoTowers,
  createLevelHighTower
];

export const maxLevel = levelCreations.length - 1;

export const createLevel = (level, number) => {
  level.clear();

  const createFunction = levelCreations[number];
  createFunction(level);
};
