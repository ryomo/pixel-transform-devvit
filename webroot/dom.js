import { Puzzle } from "./puzzle.js";

export class Dom {

  /**
   * @param {Puzzle} puzzle
   */
  init(puzzle) {
    this.puzzle = puzzle;

    // #btn-reset
    const resetButton = document.getElementById('btn-reset');
    resetButton.addEventListener('click', async () => {
      await puzzle.abortApplyingRule();
      await puzzle.init();
    });

    // #btn-apply
    const applyButton = document.getElementById('btn-apply');
    applyButton.addEventListener('click', async () => {
      await puzzle.applyRule();

      if (puzzle.checkSolved()) {
        // Solved
        console.log('Solved!');
        this.showPage('solved');
        this.renderPixels('solved-pixels-goal', puzzle.goalPixelsArray);

      } else if (puzzle.checkGameOver()) {
        // Game over
        console.log('Game over!');
        this.showPage('gameover');
        this.renderPixels('gameover-pixels-target', puzzle.targetPixelsArray);
        this.renderPixels('gameover-pixels-goal', puzzle.goalPixelsArray);

        const puzzleNumElm = document.getElementById('gameover-puzzle-num');
        puzzleNumElm.innerText = puzzle.puzzleNum

        this.updateCounter('gameover', puzzle.counter, puzzle.counterMax);
      }
    });

    // #btn-next-puzzle
    const nextPuzzleButton = document.getElementById('btn-next-puzzle');
    nextPuzzleButton.addEventListener('click', async () => {
      this.showPage('main');

      puzzle.puzzleIndex += 1;
      await puzzle.init();
    });

    // #btn-retry
    const retryButton = document.getElementById('btn-retry');
    retryButton.addEventListener('click', async () => {
      this.showPage('main');
      await puzzle.init();
    });
  }

  /**
   * Show the specified page
   * @param {string} pageName
   */
  showPage(pageName = 'main') {
    const pageNames = ['main', 'solved', 'congratulations', 'gameover'];
    if (!pageNames.includes(pageName)) {
      console.error('Invalid page name');
      return;
    }

    pageNames.forEach(_pageName => {
      const page = document.getElementById(_pageName);
      page.style.display = (_pageName === pageName) ? 'grid' : 'none';
    });
  }

  /**
   * Render all pixel matrices
   * @param {Array} targetPixelsArray
   * @param {Array} goalPixelsArray
   * @param {Array} searchPixelsArray
   * @param {Array} replacePixelsArray
   */
  renderAllMainPixels(targetPixelsArray, goalPixelsArray, searchPixelsArray, replacePixelsArray) {
    this.renderPixels('main-pixels-target', targetPixelsArray, true);
    this.renderPixels('main-pixels-goal', goalPixelsArray);
    this.renderPixels('main-pixels-search', searchPixelsArray, false, true);
    this.renderPixels('main-pixels-replace', replacePixelsArray, false, true);
  }

  /**
   * Render pixels
   * @param {number} id
   * @param {Array} pixels
   * @param {boolean} addId
   * @param {boolean} isClickable
   */
  renderPixels(id, pixels, addId = false, isClickable = false) {
    const pixelElement = document.getElementById(id);

    // Clear previous pixels
    pixelElement.innerHTML = '';

    // Set CSS style: grid-template-columns: repeat(x, 1fr);
    pixelElement.style.gridTemplateColumns = `repeat(${pixels[0].length}, 1fr)`;

    pixels.forEach((row, i) => {
      row.forEach((cell, j) => {
        const div = document.createElement('div');
        if (addId) {
          div.id = `cell-${i}-${j}`;
        }
        div.className = `cell ${cell === 1 ? 'black' : 'white'}`;

        if (isClickable) {
          div.addEventListener('click', () => {
            if (this.puzzle?.isApplyingRule) {
              return;
            }

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

  /**
   * Update the counter on the page
   * @param {string} idPrefix
   * @param {number} counter
   * @param {number} counterMax
   */
  updateCounter(idPrefix, counter, counterMax) {
    const counterElm = document.getElementById(`${idPrefix}-counter`);
    counterElm.innerText = counter + ' / ' + counterMax;
  }

  /**
   * Show metadata on the page
   * @param {string} idPrefix
   * @param {number} puzzleNum
   * @param {string} hint
   */
  showMetadata(idPrefix, puzzleNum, hint) {
    const puzzleNumElm = document.getElementById(`${idPrefix}-puzzle-num`);
    puzzleNumElm.innerText = puzzleNum

    const hintElm = document.getElementById(`${idPrefix}-hint`);
    hintElm.innerText = hint;
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
}
