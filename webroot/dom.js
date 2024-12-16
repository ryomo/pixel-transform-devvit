import { Puzzle } from "./puzzle.js";

export class Dom {

  /**
   * @param {Puzzle} puzzle
   */
  initEventListeners(puzzle) {
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
        console.log('Solved!');

        this.showSolvedPage();
        this.renderPixels('pixels-solved', puzzle.goalPixelsArray);
      }
    });

    // #btn-next-puzzle
    const nextPuzzleButton = document.getElementById('btn-next-puzzle');
    nextPuzzleButton.addEventListener('click', async () => {
      this.showSolvedPage(false);

      puzzle.puzzleIndex += 1;
      await puzzle.init();
    });
  }

  /**
   * Show "Solved" page
   * @param {boolean} solvedPage - If set to false, show the main page.
   */
  showSolvedPage(solvedPage = true) {
    const main = document.getElementById('main');
    const solved = document.getElementById('solved');

    main.style.display = (solvedPage) ? 'none' : 'grid';
    solved.style.display = (solvedPage) ? 'grid' : 'none';
  }

  /**
   * Render all pixel matrices
   * @param {Array} targetPixelsArray
   * @param {Array} goalPixelsArray
   * @param {Array} searchPixelsArray
   * @param {Array} replacePixelsArray
   */
  renderAllPixels(targetPixelsArray, goalPixelsArray, searchPixelsArray, replacePixelsArray) {
    this.renderPixels('pixels-target', targetPixelsArray, true);
    this.renderPixels('pixels-goal', goalPixelsArray);
    this.renderPixels('pixels-search', searchPixelsArray, false, true);
    this.renderPixels('pixels-replace', replacePixelsArray, false, true);
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
   * @param {number} counter
   * @param {number} counterMax
   */
  updateCounter(counter, counterMax) {
    const counterElm = document.getElementById('counter');
    counterElm.innerText = counter + ' / ' + counterMax;
  }

  /**
   * Show metadata on the page
   * @param {number} puzzleNum
   * @param {string} hint
   */
  showMetadata(puzzleNum, hint) {
    const puzzleNumElm = document.getElementById('puzzle-num');
    puzzleNumElm.innerText = puzzleNum

    const hintElm = document.getElementById('hint');
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
