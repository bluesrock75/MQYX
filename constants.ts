// Logo Colors based on the image provided
export const COLORS = {
  GREEN_SHAPE: '#7CB342', // The green hill/leaf
  BLUE_SHAPE: '#1565C0',  // The blue wave/M
  RED_DOT: '#D32F2F',     // The red circle
  BACKGROUND: '#FFFFFF',
  TEXT: '#1E293B',
  GOLD: '#FFD700'
};

export const GAME_CONFIG = {
  CANVAS_WIDTH: 800,
  CANVAS_HEIGHT: 600,
  PADDLE_WIDTH: 160,
  PADDLE_HEIGHT: 40,
  BALL_RADIUS: 16,
  GRAVITY: 0.4,
  BOUNCE_DAMPING: 0.9, // Energy retained after bounce
  PADDLE_SPEED: 12,
  INITIAL_VELOCITY_Y: -8
};

export const SHOOTER_CONFIG = {
  BULLET_SPEED: -15,
  BULLET_RADIUS: 6,
  FIRE_RATE: 10, // Frames between shots
  TARGET_SPEED_MIN: 1,
  TARGET_SPEED_MAX: 3,
  SPAWN_RATE: 40, // Frames between target spawns
  TARGET_SIZE: 40
};

export const MONEY_RAIN_CONFIG = {
  GAME_DURATION: 60, // Seconds
  SPAWN_RATE: 15, // Frames between spawns (faster than shooter)
  FALL_SPEED_MIN: 2,
  FALL_SPEED_MAX: 6,
  ITEM_SIZE: 35,
  VALUES: {
    COIN: { val: 1, symbol: '🪙', weight: 0.6 },
    CASH: { val: 10, symbol: '💵', weight: 0.3 },
    BAG: { val: 50, symbol: '💰', weight: 0.08 },
    GEM: { val: 100, symbol: '💎', weight: 0.02 }
  }
};