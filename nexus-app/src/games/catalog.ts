/**
 * Optional low-memory 2D extras for desktop / USB Companion.
 * Implemented in-app (pure JS) so we do not ship heavy engines.
 * Credits point at the open-source inspiration lists.
 */

export type GameId =
  | "chess"
  | "snake"
  | "pong"
  | "breakout"
  | "tetris"
  | "g2048";

export type GameDef = {
  id: GameId;
  label: string;
  blurb: string;
  /** Rough RAM / weight hint for the picker */
  weight: "tiny" | "light";
  credit: string;
  creditUrl: string;
};

export const GAME_CATALOG: GameDef[] = [
  {
    id: "chess",
    label: "Chess",
    blurb: "Local board — play a friend or a tiny random-move CPU. Priority game.",
    weight: "light",
    credit: "Inspired by minimal open chess (che55 / LOVEchess style)",
    creditUrl: "https://github.com/Blugil/che55",
  },
  {
    id: "snake",
    label: "Snake",
    blurb: "Classic grid snake — arrow keys / on-screen pads.",
    weight: "tiny",
    credit: "Classic snake — see riley-basic-games & friends",
    creditUrl: "https://github.com/ryantherileyman/riley-basic-games",
  },
  {
    id: "pong",
    label: "Pong",
    blurb: "Two paddles, one ball. Tiny loop.",
    weight: "tiny",
    credit: "Classic Pong — GameCraft-style minis",
    creditUrl: "https://github.com/arthev/GameCraft",
  },
  {
    id: "breakout",
    label: "Breakout",
    blurb: "Bounce the ball; clear the bricks.",
    weight: "tiny",
    credit: "Breakout-style — GameCraft / LittleJS spirit",
    creditUrl: "https://github.com/arthev/GameCraft",
  },
  {
    id: "tetris",
    label: "Tetris",
    blurb: "Falling blocks. Keep the stack low.",
    weight: "tiny",
    credit: "Classic Tetris-style — tinyc.games / Py-Games spirit",
    creditUrl: "https://github.com/superjer/tinyc.games",
  },
  {
    id: "g2048",
    label: "2048",
    blurb: "Slide tiles; merge to 2048.",
    weight: "tiny",
    credit: "2048 — many tiny open versions",
    creditUrl: "https://github.com/gabrielecirulli/2048",
  },
];
