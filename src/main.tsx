import './createPost.js';

import { Devvit, useState } from '@devvit/public-api';

// Defines the messages that are exchanged between Devvit and Web View
export type WebViewMessage =
  | {
      type: 'initialData';
      data: { username: string; lastSolvedPuzzleIndex: number };
    }
  | {
      type: 'saveLastSolvedPuzzleIndex';
      data: { lastSolvedPuzzleIndex: number };
    };

Devvit.configure({
  redditAPI: true,
  redis: true,
});

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Pixel Transform',
  height: 'tall',
  render: (context) => {
    const redisKeyLastPlayedPuzzleIndex = `lastPlayedPuzzleIndex_${context.userId}`;

    // Load username with `useState` hook
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      return currUser?.username ?? 'anon';
    });

    // Load last played puzzle index with `useState` hook
    const [lastSolvedPuzzleIndex, updateLastSolvedPuzzleIndex] = useState(async () => {
      const lastSolvedPuzzleIndex = await context.redis.get(`lastPlayedPuzzleIndex_${context.userId}`);
      return Number(lastSolvedPuzzleIndex ?? -1);
    });

    // Create a reactive state for web view visibility
    const [webviewVisible, setWebviewVisible] = useState(false);

    const [isDataBeingDeleted, setDataBeingDeleted] = useState(false);

    // When the web view invokes `window.parent.postMessage` this function is called
    const onMessage = async (msg: WebViewMessage) => {
      switch (msg.type) {
        case 'initialData':
          break;

        case 'saveLastSolvedPuzzleIndex': {
          const value = msg.data.lastSolvedPuzzleIndex.toString()
          await context.redis.set(redisKeyLastPlayedPuzzleIndex, value);
          context.ui.webView.postMessage('myWebView', {
            type: 'savedLastSolvedPuzzleIndex',
            data: {
              savedLastSolvedPuzzleIndex: msg.data.lastSolvedPuzzleIndex,
            },
          });
          console.log('redis.set:', `${redisKeyLastPlayedPuzzleIndex}: ${value}`)
          break;
        }

        default:
          throw new Error(`Unknown message type: ${msg satisfies never}`);
      }
    };

    // When the button is clicked, send initial data to web view and show it
    const onShowWebviewClick = () => {
      setWebviewVisible(true);
      context.ui.webView.postMessage('myWebView', {
        type: 'initialData',
        data: {
          username: username,
          lastSolvedPuzzleIndex: lastSolvedPuzzleIndex,
        },
      });
    };

    const onResetAppDataClick = async () => {
      await context.redis.del(redisKeyLastPlayedPuzzleIndex);
      const value = await context.redis.get(redisKeyLastPlayedPuzzleIndex);
      console.log('redis.del:', `${redisKeyLastPlayedPuzzleIndex}: ${value}`);
      updateLastSolvedPuzzleIndex(-1);
      setDataBeingDeleted(true);
    };

    // Render the custom post type
    return (
      <vstack grow padding="small">

        {/* Blocks */}
        <vstack
          grow={!webviewVisible}
          height={webviewVisible ? '0%' : '100%'}
          alignment="middle center"
        >
          <zstack width="100%" height="100%">

            <image
              url="background.png"
              imageHeight={webviewVisible ? 0 : 662}
              imageWidth={webviewVisible ? 0 : 760}
              height={webviewVisible ? '0%' : '100%'}
              width={webviewVisible ? '0%' : '100%'}
              resizeMode="fit"
            />

            <vstack
              grow={!webviewVisible}
              height={webviewVisible ? '0%' : '100%'}
              width={webviewVisible ? '0%' : '100%'}
              alignment="middle center"
              backgroundColor='rgba(255, 255, 255, 0.5)'
            >
              <text size="xlarge" weight="bold" color='black' outline='thick'>
                Pixel Transform
              </text>
              <spacer />
              <vstack alignment="start middle">
                <hstack>
                  <text size="medium" color='black' outline='thick'>Username:</text>
                  <text size="medium" weight="bold" color='black' outline='thick'>
                    {' '}
                    {username ?? ''}
                  </text>
                </hstack>
                <hstack>
                  <text size="medium" color='black' outline='thick'>Last solved puzzle number:</text>
                  <text size="medium" weight="bold" color='black' outline='thick'>
                    {' '}
                    {(lastSolvedPuzzleIndex === -1) ? 'N/A' : lastSolvedPuzzleIndex + 1}
                  </text>
                </hstack>
              </vstack>
              <spacer />
              <button
                onPress={onShowWebviewClick}
                icon='play'
                appearance='primary'
              >
                Launch App
              </button>
              <spacer size='large' />
              <button
                onPress={onResetAppDataClick}
                size='small'
                icon='delete'
                disabled={isDataBeingDeleted}
              >
                Reset App Data
              </button>
            </vstack>

          </zstack>
        </vstack>

        {/* WebView */}
        <vstack grow={webviewVisible} height={webviewVisible ? '100%' : '0%'}>
          <vstack border="thick" borderColor="black" height={webviewVisible ? '100%' : '0%'}>
            <webview
              id="myWebView"
              url="page.html"
              onMessage={(msg) => onMessage(msg as WebViewMessage)}
              grow
              height={webviewVisible ? '100%' : '0%'}
            />
          </vstack>
        </vstack>

      </vstack>
    );
  },
});

export default Devvit;
