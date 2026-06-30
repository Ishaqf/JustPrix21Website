import { useEffect, useRef } from 'react';

// google.accounts.id.initialize() must only be called once per page load.
// <GoogleLogin> from @react-oauth/google calls it inside a useEffect, which
// React 18's StrictMode intentionally fires twice in development — causing
// the "called multiple times" warning and the button failing to render on
// the first mount. A module-level flag survives component unmount/remount
// cycles (StrictMode or SPA navigation) so initialize() is guaranteed once.
let gsiInitialized = false;

const GoogleSignInButton = ({ onCredential, onError }) => {
  const divRef = useRef(null);

  // Refs keep the callbacks current without re-running the effect (and
  // without re-calling initialize() when the parent re-renders).
  const onCredentialRef = useRef(onCredential);
  onCredentialRef.current = onCredential;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!divRef.current) return;

    const render = () => {
      if (!window.google?.accounts?.id) return false;

      if (!gsiInitialized) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          // Stable closure — reads the ref so it always calls the
          // latest callback even though initialize() only fires once.
          callback: (response) => onCredentialRef.current?.(response),
          auto_select: false,
          cancel_on_tap_outside: true,
        });
        gsiInitialized = true;
      }

      window.google.accounts.id.renderButton(divRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        locale: 'fr_FR',
      });
      return true;
    };

    // The GSI script may still be loading when this effect fires (e.g. on a
    // slow connection). Poll until window.google is available or 3 s pass.
    if (!render()) {
      let attempts = 0;
      const id = setInterval(() => {
        if (render() || ++attempts > 30) clearInterval(id);
      }, 100);
      return () => clearInterval(id);
    }
    // Empty deps — the refs keep callbacks current without needing the effect
    // to re-run, and initialize() must not be retriggered.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={divRef} />;
};

export default GoogleSignInButton;
