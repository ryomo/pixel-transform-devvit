class App {

  constructor() {
    this.puzzleIndex = 0;

    this.targetPixelsArray = [];
    this.goalPixelsArray = [];
    this.searchPixelsArray = [];
    this.replacePixelsArray = [];

    this.counter = 0;
    this.counterMax = 0;
  }

  async init() {
    await this.loadPuzzleData(this.puzzleIndex);
    this.renderAllPixels();
    this.counter = 0;
    this.updateCounter();
    this.showMetadata();
  }

  async loadPuzzleData(puzzleIndex) {
    const puzzles = await fetch('puzzles.json')
      .then(response => response.json());

    this.puzzleNum = puzzles[puzzleIndex].no;
    this.counterMax = puzzles[puzzleIndex].count;
    this.hint = puzzles[puzzleIndex].hint;

    this.targetPixelsArray = puzzles[puzzleIndex].target;
    this.goalPixelsArray = puzzles[puzzleIndex].goal;
    this.searchPixelsArray = puzzles[puzzleIndex].search;
    this.replacePixelsArray = puzzles[puzzleIndex].replace;
  }

  renderAllPixels() {
    this.renderPixels('pixels-target', this.targetPixelsArray);
    this.renderPixels('pixels-goal', this.goalPixelsArray);
    this.renderPixels('pixels-search', this.searchPixelsArray, true);
    this.renderPixels('pixels-replace', this.replacePixelsArray, true);
  }

  renderPixels(id, pixels, isClickable = false) {
    const pixelElement = document.getElementById(id);

    // Clear previous pixels
    pixelElement.innerHTML = '';

    // Set CSS style: grid-template-columns: repeat(x, 1fr);
    pixelElement.style.gridTemplateColumns = `repeat(${pixels[0].length}, 1fr)`;

    pixels.forEach((row, i) => {
      row.forEach((cell, j) => {
        const div = document.createElement('div');
        div.id = `cell-${i}-${j}`;
        div.className = `cell ${cell === 1 ? 'black' : 'white'}`;

        if (isClickable) {
          div.addEventListener('click', () => {
            cell = (cell === 1) ? 0 : 1;
            div.className = `cell ${cell === 1 ? 'black' : 'white'}`;
            // Update pixels array
            pixels[i][j] = cell;
          });
        }

        pixelElement.appendChild(div);
      });
    });
  }

  updateCounter() {
    const counterElm = document.getElementById('counter');
    counterElm.innerText = this.counter + ' / ' + this.counterMax;
  }

  showMetadata() {
    const puzzleNumElm = document.getElementById('puzzle-num');
    puzzleNumElm.innerText = this.puzzleNum

    const hintElm = document.getElementById('hint');
    hintElm.innerText = this.hint;
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
      this.updateCounter();

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
            this.addClassToArea(i, j, searchRowLength, searchColLength, 'matched');
            await this.sleep();

            // Replace pixels
            this.replacePixels(i, j, searchRowLength, searchColLength);
            this.renderPixels('pixels-target', this.targetPixelsArray);
            this.addClassToArea(i, j, searchRowLength, searchColLength, 'matched');
            await this.sleep();

          } else {
            this.addClassToArea(i, j, searchRowLength, searchColLength, 'search');
            await this.sleep();
          }

          // Remove class from search area
          this.removeClassFromArea(i, j, searchRowLength, searchColLength, 'search');
          this.removeClassFromArea(i, j, searchRowLength, searchColLength, 'matched');
        }
      }

      this.renderPixels('pixels-target', this.targetPixelsArray);
      console.log('Rule applied');
      this.isApplyingRule = false;
    };

    this.applyRulePromise = _applyRuleFunc();
    return this.applyRulePromise;
  }

  checkSolved() {
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
   * Add class to all cells in the area
   * @param {number} i
   * @param {number} j
   * @param {number} searchRowLength
   * @param {number} searchColLength
   * @param {string} className
   */
  addClassToArea(i, j, searchRowLength, searchColLength, className) {
    for (let si = 0; si < searchRowLength; si++) {
      for (let sj = 0; sj < searchColLength; sj++) {
        const div = document.getElementById(`cell-${i + si}-${j + sj}`);
        div.classList.add(className);
      }
    }
  }

  /**
   * Remove class from all cells in the area
   * @param {number} i
   * @param {number} j
   * @param {number} searchRowLength
   * @param {number} searchColLength
   * @param {string} className
   */
  removeClassFromArea(i, j, searchRowLength, searchColLength, className) {
    for (let si = 0; si < searchRowLength; si++) {
      for (let sj = 0; sj < searchColLength; sj++) {
        const div = document.getElementById(`cell-${i + si}-${j + sj}`);
        div.classList.remove(className);
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

const app = new App();
await app.init();

const resetButton = document.getElementById('btn-reset');
resetButton.addEventListener('click', async () => {
  await app.abortApplyingRule();
  await app.init();
});

const applyButton = document.getElementById('btn-apply');
applyButton.addEventListener('click', async () => {
  await app.applyRule();

  if (app.checkSolved()) {
    console.log('Solved!');

    showSolvedPage();
    app.renderPixels('pixels-solved', app.goalPixelsArray);
  }
});

const nextPuzzleButton = document.getElementById('btn-next-puzzle');
nextPuzzleButton.addEventListener('click', async () => {
  showSolvedPage(false);

  app.puzzleIndex += 1;
  await app.init();
});

/**
 * Show solved page.
 * @param {boolean} solvedPage - If set to false, show the main page.
 */
function showSolvedPage(solvedPage = true) {
  const main = document.getElementById('main');
  const solved = document.getElementById('solved');

  main.style.display = (solvedPage) ? 'none' : 'grid';
  solved.style.display = (solvedPage) ? 'grid' : 'none';
}
