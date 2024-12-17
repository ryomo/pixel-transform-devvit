import { Puzzle } from './puzzle.js';

/**
 * @typedef {import('../src/main').WebViewMessage} WebViewMessage
 */

export class DevvitMessenger {

  /**
   * @param {Puzzle} puzzle
   */
  constructor(puzzle) {
    this.puzzle = puzzle;

    // When the Devvit app sends a message with `context.ui.webView.postMessage`, this will be triggered
    window.addEventListener('message', (ev) => {
      const { type, data } = ev.data;

      // Reserved type for messages sent via `context.ui.webView.postMessage`
      if (type === 'devvit-message') {
        const { message } = data;
        this._receiveMessage(message);
      }
    });
  }

  /**
   * @param {WebViewMessage} message
   */
  _receiveMessage(message) {
    console.log(JSON.stringify(message, undefined, 2));
    console.log(message);

    switch (message.type) {
      case 'initialData': {
        const { username, lastSolvedPuzzleIndex } = message.data;
        console.log('username:', username);
        console.log('lastSolvedPuzzleIndex', lastSolvedPuzzleIndex);

        const newPuzzleIndex = lastSolvedPuzzleIndex + 1;
        if (this.puzzle.puzzleIndex !== newPuzzleIndex) {
          this.puzzle.initPuzzle(newPuzzleIndex);
        }
        break;
      }

      case 'savedLastSolvedPuzzleIndex':
        console.log('savedLastSolvedPuzzleIndex:', message.data?.savedLastSolvedPuzzleIndex);
        break;

      default:
        console.warn('Unknown message.type');
        break;
    }
  }

  /**
   * @param {WebViewMessage} message
   */
  _sendMessage(message) {
    window.parent?.postMessage(
      message,
      '*'
    )
  }

  /**
   * @param {number} puzzleIndex
   */
  saveLastSolvedPuzzleIndex(puzzleIndex) {
    this._sendMessage({
      type: 'saveLastSolvedPuzzleIndex',
      data: { lastSolvedPuzzleIndex: puzzleIndex }
    });
  }
}
