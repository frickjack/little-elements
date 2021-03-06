/**
 * Loading shell - the main app should invoke: littleShell.clear()
 */
(() => {
  const startTime = Date.now();
  const template = `
    <div class="lw-shell">
    <style>
        :root {
          background-color: #eeeeee;
        }
        .lw-shell {
            margin: 50px;
            color: #222222;
            font-family: sans-serif;
            box-sizing: border-box;
        }
        .lw-content-root {
            display: none;
        }
        #lw-loading {
            margin-bottom: 50px;
        }
        .lw-shell__spinner {
            margin: auto;
            width: 150px;height: 150px;
            animation: sweep 1s infinite linear;
            border-radius:75px;
            border-bottom:5px solid blue;
        }
        @keyframes sweep { to { transform: rotate(360deg); } }
    </style>
    <div class="lw-shell__spinner"></div>

    <h2 id="lw-loading"></h2>
</div>
    `;
  let intervalId = null;
  let count = 0;
  let clearPromise = null;

  /**
   * Shell to help with asynchronously loading pages.
   * Shows `Loading ...` animation after half a second.
   * Throttles page load by minimum of 250ms.
   * TODO: transition animation, service worker setup
   */
  // eslint-disable-next-line
  const littleShell = globalThis.littleShell = {
    /**
     * Clear the shell
     *
     * @return promise that resolves when the shell clears
     */
    clear: () => {
      if (intervalId) {
        const now = Date.now();
        clearInterval(intervalId);
        intervalId = null;

        clearPromise = new Promise(
          (resolve) => {
            setTimeout(
              () => {
                const shell = document.body.querySelector('div.lw-shell');
                if (shell) {
                  document.body.removeChild(shell);
                }
                resolve('ok');
              }, Math.max(250 - (now - startTime), 20),
            );
          },
        );
      }
      return clearPromise;
    },
  };

  const shellParent = document.createElement('DIV');
  shellParent.innerHTML = template;
  document.body.appendChild(shellParent.children[0]);

  intervalId = setInterval(() => {
    const str = 'Loading ....................';
    count = (count + 1) % 15;
    const heading = document.body.querySelector('#lw-loading');
    if (heading) {
      heading.textContent = str.substring(0, 10 + count);
    } else {
      littleShell.clear();
    }
  }, 500);
})();
