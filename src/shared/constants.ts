/** Size of the game grid (50×50 cells) */
export const GRID_SIZE = 50;

/** Maximum number of players allowed in a game (0-7 IDs) */
export const MAX_PLAYERS = 8;

/** Duration of each turn in seconds */
export const TIMER_DURATION = 30;

/** Turns a cell can stay outside territory before becoming wild */
export const WILD_TIMEOUT = 3;

/** Turns a wild cell can stay in a player's territory before being conquered */
export const CONQUEST_TIMEOUT = 3;

/** Cells needed for +1 population bonus point */
export const POPULATION_BONUS_THRESHOLD = 5;
