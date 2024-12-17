import { Dom } from "./dom.js";

export class Puzzle {

  /**
   * @param {Dom} dom
   */
  constructor(dom) {
    this.dom = dom

    this.puzzleIndex = 0;
    this.puzzles = [];

    this.targetPixelsArray = [];
    this.goalPixelsArray = [];
    this.searchPixelsArray = [];
    this.replacePixelsArray = [];

    this.counter = 0;
    this.counterMax = 0;
  }

  async init() {
    this.puzzles = await this.loadPuzzleData();
    this.initPuzzle();
  }

  /**
   * Initialize the single puzzle
   */
  initPuzzle() {
    this.setPuzzleData(this.puzzleIndex);

    this.counter = 0;

    this.dom.renderAllMainPixels(
      this.targetPixelsArray,
      this.goalPixelsArray,
      this.searchPixelsArray,
      this.replacePixelsArray
    );
    this.dom.updateCounter('main', this.counter, this.counterMax);
    this.dom.showMetadata('main', this.puzzleIndex, this.hint);
  }

  async loadPuzzleData() {
    return await fetch('puzzles.json')
      .then(response => response.json());
  }

  setPuzzleData(puzzleIndex) {
    this.counterMax = this.puzzles[puzzleIndex].count;
    this.hint = this.puzzles[puzzleIndex].hint;

    this.targetPixelsArray = deepCopyArray(this.puzzles[puzzleIndex].target);
    this.goalPixelsArray = deepCopyArray(this.puzzles[puzzleIndex].goal);
    this.searchPixelsArray = deepCopyArray(this.puzzles[puzzleIndex].search);
    this.replacePixelsArray = deepCopyArray(this.puzzles[puzzleIndex].replace);

    function deepCopyArray(arr) {
      return JSON.parse(JSON.stringify(arr));
    }
  }

  /**
   * Apply the rule to the target pixels
   * 1. Check if the search pixels match the target pixels
   * 2. Replace the target pixels with the replace pixels
   * 3. Render the updated target pixels
   * @returns Promise<void>
   */
  applyRule() {
    if (this.isApplyingRule) {
      console.log('Rule is already being applied');
      return;
    }

    console.log('Applying rule');

    this.applyRulePromise = null;

    const _applyRuleFunc = async () => {
      this.isApplyingRule = true;

      this.counter += 1;
      this.dom.updateCounter('main', this.counter, this.counterMax);

      const targetRowLength = this.targetPixelsArray.length;
      const targetColLength = this.targetPixelsArray[0].length;
      const searchRowLength = this.searchPixelsArray.length;
      const searchColLength = this.searchPixelsArray[0].length;

      for (let i = 0; i <= targetRowLength - searchRowLength; i++) {
        for (let j = 0; j <= targetColLength - searchColLength; j++) {
          if (!this.isApplyingRule) {
            return;
          }

          // Check if search pixels match
          const isMatching = this.checkPixelsMatch(i, j, searchRowLength, searchColLength);

          // Replace if search matches
          if (isMatching) {
            this.dom.addClassToArea(i, j, searchRowLength, searchColLength, 'matched');
            await this.sleep();

            // Replace pixels
            this.replacePixels(i, j, searchRowLength, searchColLength);
            this.dom.renderPixels('main-pixels-target', this.targetPixelsArray, true);
            this.dom.addClassToArea(i, j, searchRowLength, searchColLength, 'matched');
            await this.sleep();

          } else {
            this.dom.addClassToArea(i, j, searchRowLength, searchColLength, 'search');
            await this.sleep();
          }

          // Remove class from search area
          this.dom.removeClassFromArea(i, j, searchRowLength, searchColLength, 'search');
          this.dom.removeClassFromArea(i, j, searchRowLength, searchColLength, 'matched');
        }
      }

      this.dom.renderPixels('main-pixels-target', this.targetPixelsArray, true);
      console.log('Rule applied');
      this.isApplyingRule = false;
    };

    this.applyRulePromise = _applyRuleFunc();
    return this.applyRulePromise;
  }

  checkStatusAfterApplyingRule() {
    if (this._checkSolved()) {
      if (this._checkCleared()) {
        return 'cleared';
      }
      return 'solved';
    } else if (this._checkGameOver()) {
      return 'gameover';
    }
  }

  _checkSolved() {
    const targetRowLength = this.targetPixelsArray.length;
    const targetColLength = this.targetPixelsArray[0].length;

    for (let i = 0; i < targetRowLength; i++) {
      for (let j = 0; j < targetColLength; j++) {
        if (this.targetPixelsArray[i][j] !== this.goalPixelsArray[i][j]) {
          return false;
        }
      }
    }
    return true;
  }

  _checkCleared() {
    console.log('Puzzle index:', this.puzzleIndex);
    console.log('Puzzles length:', this.puzzles.length);
    return this.puzzleIndex === this.puzzles.length - 1;
  }

  _checkGameOver() {
    return this.counter >= this.counterMax;
  }

  /**
   * Abort `applyRule()`
   * @returns Promise<void>
   */
  async abortApplyingRule() {
    if (!this.isApplyingRule) {
      return;
    }
    console.log('Aborting');

    this.isApplyingRule = false;
    if (this.applyRulePromise) {
      await this.applyRulePromise.then(console.log('Aborted'))
    }
  }

  /**
   * Check if the search pixels match the target pixels
   * @param {number} i - target row index
   * @param {number} j - target column index
   * @param {number} searchRowLength
   * @param {number} searchColLength
   * @returns boolean
   */
  checkPixelsMatch(i, j, searchRowLength, searchColLength) {
    for (let si = 0; si < searchRowLength; si++) {
      for (let sj = 0; sj < searchColLength; sj++) {
        if (this.targetPixelsArray[i + si][j + sj] !== this.searchPixelsArray[si][sj]) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Replace the target pixels with the replace pixels
   * @param {number} i - target row index
   * @param {number} j - target column index
   * @param {number} searchRowLength
   * @param {number} searchColLength
   */
  replacePixels(i, j, searchRowLength, searchColLength) {
    for (let si = 0; si < searchRowLength; si++) {
      for (let sj = 0; sj < searchColLength; sj++) {
        this.targetPixelsArray[i + si][j + sj] = this.replacePixelsArray[si][sj];
      }
    }
  }

  /**
   * Sleep for a given time in milliseconds
   * @param {number} ms - milliseconds
   * @returns
   */
  async sleep(ms = 500) {
    return await new Promise(resolve => setTimeout(resolve, ms));
  }
}
