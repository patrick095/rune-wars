export interface AcademyTarget {
  x: number;
  y: number;
  width: number;
  height: number;
  hp: number;
  moving: boolean;
  moveSpeed?: number;
  moveRange?: number;
}

export const FIXED_TARGETS: AcademyTarget[] = [
  { x: 300, y: 300, width: 40, height: 60, hp: 1, moving: false },
  { x: 450, y: 250, width: 40, height: 60, hp: 1, moving: false },
  { x: 600, y: 300, width: 40, height: 60, hp: 1, moving: false },
  { x: 700, y: 200, width: 40, height: 60, hp: 1, moving: false },
  { x: 550, y: 350, width: 40, height: 60, hp: 1, moving: false },
];

export const MOVING_TARGETS: AcademyTarget[] = [
  { x: 300, y: 280, width: 40, height: 60, hp: 1, moving: true, moveSpeed: 80, moveRange: 150 },
  { x: 500, y: 230, width: 40, height: 60, hp: 1, moving: true, moveSpeed: 120, moveRange: 200 },
  { x: 700, y: 260, width: 40, height: 60, hp: 1, moving: true, moveSpeed: 60, moveRange: 100 },
];
