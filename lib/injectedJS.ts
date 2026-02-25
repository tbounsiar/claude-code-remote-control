/**
 * JavaScript injected into the WebView before content loads.
 * Sets a flag so the page knows it's inside the mobile app.
 */
export const INJECTED_JS_BEFORE_LOAD = `
  window.__CLAUDE_REMOTE_APP = true;

  // Prevent Google from detecting WebView environment
  Object.defineProperty(navigator, 'webdriver', { get: () => false });
  delete navigator.__proto__.webdriver;

  // Remove WebView-specific properties that Google checks
  if (window.__gCrWeb) delete window.__gCrWeb;
  if (window.__crWeb) delete window.__crWeb;

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

  // 2. Observe DOM for session state changes and session list
  function observeSession() {
    var lastState = null;
    var debounceTimer = null;

    function checkState() {
      var textarea = document.querySelector('textarea');
      var contentEditable = document.querySelector('[contenteditable="true"]');
      var input = textarea || contentEditable;
      var waitingForInput = !!(input && !input.disabled && input.getAttribute('aria-disabled') !== 'true');
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

    function debouncedCheck() {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function() {
        checkState();
        parseSessionList();
      }, 300);
    }

    var observer = new MutationObserver(debouncedCheck);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });
    // Initial check
    setTimeout(checkState, 500);
  }

  // 3. Parse session list from the page
  var lastSessionCount = 0;
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
    if (sessions.length > 0 && sessions.length !== lastSessionCount) {
      lastSessionCount = sessions.length;
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
