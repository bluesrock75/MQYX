export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export enum GameMode {
  CLASSIC = 'CLASSIC',
  SHOOTER = 'SHOOTER',
  MONEY_RAIN = 'MONEY_RAIN'
}

export interface Point {
  x: number;
  y: number;
}

export interface Vector {
  dx: number;
  dy: number;
}

export interface Ball {
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
}

export interface Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Particle {
  x: number;
  y: number;
  dx: number;
  dy: number;
  life: number;
  color: string;
}

export interface Bullet {
  x: number;
  y: number;
  radius: number;
  dy: number;
  active: boolean;
}

export interface Target {
  x: number;
  y: number;
  width: number;
  height: number;
  dy: number;
  type: 'USD' | 'RMB' | 'COIN' | 'BAG' | 'GEM';
  value: number;
  active: boolean;
  symbol: string;
}