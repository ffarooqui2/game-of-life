// house utility functions
export const ROWS = 30;
export const COLS = 50;

export const createEmptyGird = () => {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
};

export const DIRECTIONS = [
  [0, 1], // RIGHT
  [1, 1], // BOTTOM RIGHT
  [1, 0], // BOTTOM
  [1, -1], // BOTTOM LEFT
  [0, -1], // LEFT
  [-1, -1], // TOP LEFT
  [-1, 0], // TOP
  [-1, 1], // TOP RIGHT
];
