import './createPost.js';

import { Devvit, useState } from '@devvit/public-api';

// Defines the messages that are exchanged between Devvit and Web View
type WebViewMessage =
  | {
      type: 'initialData';
      data: { username: string; currentCounter: number };
    }
  | {
      type: 'setCounter';
      data: { newCounter: number };
    }
  | {
      type: 'updateCounter';
      data: { currentCounter: number };
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
    // Load username with `useState` hook
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      return currUser?.username ?? 'anon';
    });

    // Load latest counter from redis with `useState` hook
    const [counter, setCounter] = useState(async () => {
      const redisCount = await context.redis.get(`counter_${context.postId}`);
      return Number(redisCount ?? 0);
    });

    // Create a reactive state for web view visibility
    const [webviewVisible, setWebviewVisible] = useState(false);

    // When the web view invokes `window.parent.postMessage` this function is called
    const onMessage = async (msg: WebViewMessage) => {
      switch (msg.type) {
        case 'setCounter':
          await context.redis.set(`counter_${context.postId}`, msg.data.newCounter.toString());
          context.ui.webView.postMessage('myWebView', {
            type: 'updateCounter',
            data: {
              currentCounter: msg.data.newCounter,
            },
          });
          setCounter(msg.data.newCounter);
          break;
        case 'initialData':
        case 'updateCounter':
          break;

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
          currentCounter: counter,
        },
      });
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
              <text size="xlarge" weight="bold" outline='thick'>
                Pixel Transform
              </text>
              <spacer />
              <vstack alignment="start middle">
                <hstack>
                  <text size="medium" outline='thick'>Username:</text>
                  <text size="medium" weight="bold" outline='thick'>
                    {' '}
                    {username ?? ''}
                  </text>
                </hstack>
                <hstack>
                  <text size="medium" outline='thick'>Current counter:</text>
                  <text size="medium" weight="bold" outline='thick'>
                    {' '}
                    {counter ?? ''}
                  </text>
                </hstack>
              </vstack>
              <spacer />
              <button onPress={onShowWebviewClick}>Launch App</button>
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
