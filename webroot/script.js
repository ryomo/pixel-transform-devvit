import { Dom } from './dom.js';
import { Puzzle } from './puzzle.js'

const dom = new Dom();
const puzzle = new Puzzle(dom);
await puzzle.init();
dom.initEventListeners(puzzle);
