/**
 * Maps each device key (room::category::name) to SVG coordinates on the office top-view.
 * SVG viewBox: "0 0 1000 550"
 */
export const DEVICE_POSITIONS = {
  // Living Room
  'Living Room::lights::Light 1': { x: 140, y: 110 },
  'Living Room::lights::Light 2': { x: 280, y: 110 },
  'Living Room::lights::Light 3': { x: 215, y: 360 },
  'Living Room::fans::Fan 1': { x: 215, y: 155 },
  'Living Room::fans::Fan 2': { x: 215, y: 300 },

  // WorkRoom1
  'WorkRoom1::lights::Light 1': { x: 380, y: 110 },
  'WorkRoom1::lights::Light 2': { x: 510, y: 110 },
  'WorkRoom1::lights::Light 3': { x: 440, y: 360 },
  'WorkRoom1::fans::Fan 1': { x: 440, y: 155 },
  'WorkRoom1::fans::Fan 2': { x: 440, y: 275 },

  // WorkRoom2
  'WorkRoom2::lights::Light 1': { x: 680, y: 110 },
  'WorkRoom2::lights::Light 2': { x: 810, y: 110 },
  'WorkRoom2::lights::Light 3': { x: 740, y: 360 },
  'WorkRoom2::fans::Fan 1': { x: 740, y: 155 },
  'WorkRoom2::fans::Fan 2': { x: 740, y: 275 },
};

export const ROOM_LAYOUT = {
  'Living Room': { labelX: 190, labelY: 225, fallbackLabel: 'LIVING ROOM' },
  WorkRoom1: { labelX: 490, labelY: 225, fallbackLabel: 'WORK ROOM 1' },
  WorkRoom2: { labelX: 800, labelY: 225, fallbackLabel: 'WORK ROOM 2' },
};
