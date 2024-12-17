import { DevvitMessenger } from './devvitMessenger.js';
import { Dom } from './dom.js';
import { Puzzle } from './puzzle.js'

const dom = new Dom();
const puzzle = new Puzzle(dom);
const devvitMessenger = new DevvitMessenger(puzzle);

await puzzle.init();
dom.init(puzzle, devvitMessenger);
