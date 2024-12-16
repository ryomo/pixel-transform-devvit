class App {

  constructor() {
    this.targetPixelsArray = [];
    this.goalPixelsArray = [];
    this.searchPixelsArray = [];
    this.replacePixelsArray = [];

    const output = document.querySelector('#messageOutput');
    // const increaseButton = document.querySelector('#btn-increase');
    // const decreaseButton = document.querySelector('#btn-decrease');
    const usernameLabel = document.querySelector('#username');
    const counterLabel = document.querySelector('#counter');
    let counter = 0;

    // When the Devvit app sends a message with `context.ui.webView.postMessage`, this will be triggered
    window.addEventListener('message', (ev) => {
      const { type, data } = ev.data;

      // Reserved type for messages sent via `context.ui.webView.postMessage`
      if (type === 'devvit-message') {
        const { message } = data;

        // Always output full message
        output.replaceChildren(JSON.stringify(message, undefined, 2));

        // Load initial data
        if (message.type === 'initialData') {
          const { username, currentCounter } = message.data;
          usernameLabel.innerText = username;
          counterLabel.innerText = counter = currentCounter;
        }

        // Update counter
        if (message.type === 'updateCounter') {
          const { currentCounter } = message.data;
          counterLabel.innerText = counter = currentCounter;
        }
      }
    });

    // increaseButton.addEventListener('click', () => {
    //   // Sends a message to the Devvit app
    //   window.parent?.postMessage(
    //     { type: 'setCounter', data: { newCounter: Number(counter + 1) } },
    //     '*'
    //   );
    // });

    // decreaseButton.addEventListener('click', () => {
    //   // Sends a message to the Devvit app
    //   window.parent?.postMessage(
    //     { type: 'setCounter', data: { newCounter: Number(counter - 1) } },
    //     '*'
    //   );
    // });
  }

  async loadPixels(sampleNumber) {
    const samples = await fetch('samples.json')
      .then(response => response.json());
    this.targetPixelsArray = samples[sampleNumber].target;
    this.goalPixelsArray = samples[sampleNumber].goal;
    this.searchPixelsArray = samples[sampleNumber].search;
    this.replacePixelsArray = samples[sampleNumber].replace;
    console.log(this.replacePixelsArray)
  }

  renderAllPixels() {
    this.renderPixels('pixels-main', this.targetPixelsArray);
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

  async applyRule() {
    console.log('Applying rule');

    const targetRowLength = this.targetPixelsArray.length;
    const targetColLength = this.targetPixelsArray[0].length;
    const searchRowLength = this.searchPixelsArray.length;
    const searchColLength = this.searchPixelsArray[0].length;

    for (let i = 0; i <= targetRowLength - searchRowLength; i++) {
      for (let j = 0; j <= targetColLength - searchColLength; j++) {
        // Check if search pixels match
        const isMatching = this.checkPixelsMatch(i, j, searchRowLength, searchColLength);

        // Replace if search matches
        if (isMatching) {
          this.addClassToArea(i, j, searchRowLength, searchColLength, 'matched');
          await this.sleep(500);

          // Replace pixels
          this.replacePixels(i, j, searchRowLength, searchColLength);
          this.renderPixels('pixels-main', this.targetPixelsArray);
          this.addClassToArea(i, j, searchRowLength, searchColLength, 'matched');
          await this.sleep(500);

        } else {
          this.addClassToArea(i, j, searchRowLength, searchColLength, 'search');
          // await this.sleep(2000 / (i*j));
          await this.sleep(500);
        }

        // await this.sleep(10000);

        // Remove class from search area
        this.removeClassFromArea(i, j, searchRowLength, searchColLength, 'search');
        this.removeClassFromArea(i, j, searchRowLength, searchColLength, 'matched');
      }
    }

    this.renderPixels('pixels-main', this.targetPixelsArray);
    console.log('Rule applied');
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
  async sleep(ms) {
    return await new Promise(resolve => setTimeout(resolve, ms));
  }
}

const num = 0

const app = new App();
await app.loadPixels(num);
app.renderAllPixels();

const resetButton = document.querySelector('#btn-reset');
resetButton.addEventListener('click', async () => {
  await app.loadPixels(num);
  app.renderAllPixels();
});

const applyButton = document.querySelector('#btn-apply');
applyButton.addEventListener('click', () => app.applyRule());
