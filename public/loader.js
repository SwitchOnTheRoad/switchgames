/**
 * Switch — Page Loader
 * Drop <script src="loader.js"></script> into any page's <head> to activate.
 * The loader fades in with the logo, glows, then fades out once the page is ready.
 */

(function () {
    // ── inject styles ──────────────────────────────────────────────────────
    const style = document.createElement('style');
    style.textContent = `
        #sw-loader {
            position: fixed;
            inset: 0;
            z-index: 99999;
            background: #0A0A0A;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 2rem;
            pointer-events: all;
            transition: opacity 0.55s ease;
        }

        #sw-loader.fade-out {
            opacity: 0;
            pointer-events: none;
        }

        #sw-loader-logo {
            width: min(52vw, 280px);
            height: auto;
            opacity: 0;
            filter: brightness(0.6);
            transform: scale(0.94);
            animation: sw-logo-in 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.1s forwards,
                       sw-glow     1.4s ease-in-out 0.8s forwards;
        }

        @keyframes sw-logo-in {
            to {
                opacity: 1;
                transform: scale(1);
            }
        }

        @keyframes sw-glow {
            0%   { filter: brightness(0.6); }
            50%  { filter: brightness(1.35) drop-shadow(0 0 28px rgba(251, 191, 36, 0.75))
                                             drop-shadow(0 0 60px rgba(251, 191, 36, 0.35)); }
            100% { filter: brightness(1); }
        }

        #sw-loader-bar-wrap {
            width: min(52vw, 280px);
            height: 1px;
            background: #1e1e1e;
            overflow: hidden;
            opacity: 0;
            animation: sw-bar-appear 0.4s ease 0.5s forwards;
        }

        @keyframes sw-bar-appear {
            to { opacity: 1; }
        }

        #sw-loader-bar {
            height: 100%;
            width: 0%;
            background: #FBBF24;
            transition: width 0.35s ease;
        }
    `;
    document.head.appendChild(style);

    // ── inject HTML ────────────────────────────────────────────────────────
    const loader = document.createElement('div');
    loader.id = 'sw-loader';
    loader.innerHTML = `
        <img id="sw-loader-logo" src="/logo.png" alt="Switch">
        <div id="sw-loader-bar-wrap">
            <div id="sw-loader-bar"></div>
        </div>
    `;

    // Insert before anything else so it's on top immediately
    if (document.body) {
        document.body.prepend(loader);
    } else {
        document.addEventListener('DOMContentLoaded', () => document.body.prepend(loader));
    }

    // ── progress bar animation ─────────────────────────────────────────────
    const bar = document.getElementById('sw-loader-bar');
    let progress = 0;

    // Simulate progress until page is actually ready
    const tick = setInterval(() => {
        // Ease towards 85% while waiting, never quite reaching it
        progress += (85 - progress) * 0.06;
        if (bar) bar.style.width = progress + '%';
    }, 60);

    // ── dismiss ────────────────────────────────────────────────────────────
    function dismiss() {
        clearInterval(tick);

        // Jump bar to 100%
        if (bar) bar.style.width = '100%';

        // Short pause so the 100% is visible, then fade out
        setTimeout(() => {
            loader.classList.add('fade-out');
            // Remove from DOM after transition
            setTimeout(() => loader.remove(), 600);
        }, 320);
    }

    // Trigger dismiss when page is fully loaded (images, fonts, etc.)
    if (document.readyState === 'complete') {
        // Already loaded (e.g. cached page)
        setTimeout(dismiss, 900);
    } else {
        window.addEventListener('load', () => setTimeout(dismiss, 400));
    }

    // Safety net — never get stuck longer than 4 seconds
    setTimeout(dismiss, 4000);
})();