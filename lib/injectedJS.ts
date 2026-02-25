/**
 * JavaScript injected into the WebView before content loads.
 * Sets a flag so the page knows it's inside the mobile app.
 */
export const INJECTED_JS_BEFORE_LOAD = `
  window.__CLAUDE_REMOTE_APP = true;
  true;
`;

/**
 * JavaScript injected after the page loads.
 * Detects auth state, observes session state changes,
 * and parses the session list.
 */
export const INJECTED_JS_AFTER_LOAD = `
(function() {
  // Utility to send messages back to React Native
  function postMsg(data) {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify(data));
    } catch(e) {}
  }

  // 1. Detect auth state
  function checkAuth() {
    var isLoginPage = !!(
      document.querySelector('form[action*="login"]') ||
      document.querySelector('[data-testid="login-form"]') ||
      document.querySelector('input[type="password"]')
    );
    var hasContent = !!(
      document.querySelector('main') ||
      document.querySelector('[data-testid="conversation"]') ||
      document.querySelector('textarea')
    );
    postMsg({
      type: 'AUTH_STATE',
      authenticated: !isLoginPage && hasContent,
      isLoginPage: isLoginPage
    });
  }

  // 2. Observe DOM for session state changes
  function observeSession() {
    var lastState = null;
    function check() {
      var textarea = document.querySelector('textarea');
      var waitingForInput = !!(textarea && !textarea.disabled);
      var stateKey = waitingForInput ? 'waiting' : 'busy';
      if (stateKey !== lastState) {
        lastState = stateKey;
        postMsg({
          type: 'SESSION_STATE',
          waitingForInput: waitingForInput,
          timestamp: Date.now()
        });
      }
    }

    var observer = new MutationObserver(function() {
      check();
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
    // Initial check
    setTimeout(check, 500);
  }

  // 3. Parse session list from the page
  function parseSessionList() {
    var links = document.querySelectorAll('a[href*="/code/"]');
    var sessions = [];
    for (var i = 0; i < links.length; i++) {
      var el = links[i];
      var href = el.href || el.getAttribute('href');
      if (href && href.includes('/code/')) {
        sessions.push({
          url: href.startsWith('http') ? href : 'https://claude.ai' + href,
          label: (el.textContent || '').trim().substring(0, 100)
        });
      }
    }
    if (sessions.length > 0) {
      postMsg({ type: 'SESSION_LIST', sessions: sessions });
    }
  }

  // Run
  setTimeout(checkAuth, 500);
  setTimeout(parseSessionList, 1500);
  setTimeout(observeSession, 2000);

  true;
})();
`;

/**
 * CSS to force dark mode in the WebView
 */
export const DARK_MODE_CSS_INJECTION = `
(function() {
  var style = document.createElement('style');
  style.id = '__claude_remote_dark';
  style.textContent = ':root { color-scheme: dark; }';
  document.head.appendChild(style);
  true;
})();
`;
