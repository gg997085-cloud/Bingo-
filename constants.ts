
import { BingoColumn } from './types';

export const BINGO_RANGES: Record<BingoColumn, { min: number; max: number }> = {
  B: { min: 1, max: 15 },
  I: { min: 16, max: 30 },
  N: { min: 31, max: 45 },
  G: { min: 46, max: 60 },
  O: { min: 61, max: 75 },
};

export const SPEED_MS = {
  Slow: 8000,
  Normal: 5000,
  Fast: 3000,
};

export const RIVAL_NAMES = [
  "Bingo Betty", "Lucky Larry", "Dabber Dan", "Winning Wanda", "Grandma Gertrude", 
  "Salty Sam", "Turbo Todd", "Mellow Mary", "Magic Mike", "Bingo Bandit"
];

export const LOCAL_BINGO_CALLS: Record<number, string> = {
  1: "Kelly's Eye!", 2: "One little duck!", 3: "Cup of tea!", 4: "Knock at the door!", 5: "Man alive!",
  6: "Tom Mix!", 7: "Lucky seven!", 8: "Garden gate!", 9: "Doctor's orders!", 10: "Uncle Ben!",
  11: "Legs eleven!", 12: "One dozen!", 13: "Unlucky for some!", 14: "Valentine's Day!", 15: "Young and keen!",
  16: "Sweet sixteen!", 17: "Dancing queen!", 18: "Coming of age!", 19: "Goodbye-teens!", 20: "One score!",
  21: "Key of the door!", 22: "Two little ducks!", 23: "Thee and me!", 24: "Two dozen!", 25: "Duck and dive!",
  26: "Pick and mix!", 27: "Gateway to heaven!", 28: "Over weight!", 29: "Rise and shine!", 30: "Dirty Gertie!",
  31: "Get up and run!", 32: "Buckle my shoe!", 33: "Dirty knee!", 34: "Ask for more!", 35: "Jump and jive!",
  36: "Three dozen!", 37: "More than eleven!", 38: "Christmas cake!", 39: "Steps!", 40: "Life begins!",
  41: "Time for fun!", 42: "Winnie the Pooh!", 43: "Down on your knee!", 44: "Droopy drawers!", 45: "Halfway there!",
  46: "Up to tricks!", 47: "Four and seven!", 48: "Four dozen!", 49: "PC!", 50: "Bullseye!",
  51: "Tweak of the thumb!", 52: "Danny La Rue!", 53: "Stuck in the tree!", 54: "Clean the floor!", 55: "Snakes alive!",
  56: "Was she worth it?", 57: "Heinz varieties!", 58: "Make them wait!", 59: "Brighton Line!", 60: "Five dozen!",
  61: "Baker's bun!", 62: "Tickety-boo!", 63: "Tickle me 63!", 64: "Red raw!", 65: "Old age pension!",
  66: "Clickety click!", 67: "Stairway to heaven!", 68: "Saving Grace!", 69: "Favorite of mine!", 70: "Three score and ten!",
  71: "Bang on the drum!", 72: "Six dozen!", 73: "Queen B!", 74: "Candy store!", 75: "Strive and thrive!"
};
