import { DevvitMessenger } from './devvitMessenger.js';
import { Dom } from './dom.js';
import { Puzzle } from './puzzle.js'

/**
 * The default puzzle number to start with.
 * This will be overridden by `DevvitMessenger._receiveMessage()` .
 */
const defaultPuzzleNum = 5;

const dom = new Dom();
const puzzle = new Puzzle(dom);
puzzle.puzzleIndex = defaultPuzzleNum - 1;
const devvitMessenger = new DevvitMessenger(puzzle);

await puzzle.init();
dom.init(puzzle, devvitMessenger);
