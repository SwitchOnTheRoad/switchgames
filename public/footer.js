document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin')) return;
    const year = new Date().getFullYear();
    const footerHTML = `
    <style>
        .site-footer {
            background: #02070f;
            border-top: 1px solid #112035;
            padding: 5rem 3rem 2.5rem;
            font-family: 'DM Sans', sans-serif;
        }
        .sf-grid {
            max-width: 1400px; margin: 0 auto;
            display: grid; grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 3rem; margin-bottom: 4rem;
        }
        .sf-brand img { height: 28px; display: block; margin-bottom: 1.25rem; filter: brightness(0) invert(1); }
        .sf-brand p { color: #2d4a68; font-size: 0.85rem; line-height: 1.75; max-width: 240px; }
        .sf-social { display: flex; gap: 1rem; margin-top: 1.75rem; }
        .sf-social a {
            width: 36px; height: 36px;
            border: 1px solid #112035;
            display: flex; align-items: center; justify-content: center;
            color: #2d4a68; border-radius: 4px;
            transition: border-color 0.15s, color 0.15s;
            text-decoration: none;
        }
        .sf-social a:hover { border-color: #3b82f6; color: #3b82f6; }
        .sf-col h5 {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.55rem; font-weight: 600;
            text-transform: uppercase; letter-spacing: 0.2em;
            color: #4a6890; margin-bottom: 1.5rem;
        }
        .sf-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.85rem; }
        .sf-col a { color: #2d4a68; text-decoration: none; font-size: 0.875rem; transition: color 0.15s; }
        .sf-col a:hover { color: #e4edff; }
        .sf-divider { max-width: 1400px; margin: 0 auto; border: none; border-top: 1px solid #112035; }
        .sf-bottom {
            max-width: 1400px; margin: 0 auto;
            padding-top: 2rem;
            display: flex; justify-content: space-between; align-items: center;
            flex-wrap: wrap; gap: 1rem;
        }
        .sf-copy {
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.55rem; letter-spacing: 0.14em;
            text-transform: uppercase; color: #1a3050;
        }
        .sf-links {
            display: flex; gap: 1.5rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.55rem; letter-spacing: 0.14em; text-transform: uppercase;
        }
        .sf-links a { color: #1a3050; text-decoration: none; transition: color 0.15s; }
        .sf-links a:hover { color: #4a6890; }
        @media (max-width: 900px) {
            .sf-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
            .sf-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 500px) {
            .sf-grid { grid-template-columns: 1fr; }
            .site-footer { padding: 3rem 1.5rem 2rem; }
            .sf-bottom { flex-direction: column; align-items: flex-start; }
        }
    </style>
    <footer class="site-footer">
        <div class="sf-grid">
            <div class="sf-brand">
                <img src="/logo.png" alt="Switch">
                <p>An independent Roblox game studio building worlds for millions of players. Est. 2025.</p>
                <div class="sf-social">
                    <a href="https://discord.gg" target="_blank" rel="noopener noreferrer" aria-label="Discord">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.12 18.12a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href="https://roblox.com" target="_blank" rel="noopener noreferrer" aria-label="Roblox">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4.686 0L0 19.314 19.314 24 24 4.686zm9.886 13.314l-3.2-.8.8-3.2 3.2.8z"/></svg>
                    </a>
                </div>
            </div>
            <div class="sf-col">
                <h5>Games</h5>
                <ul>
                    <li><a href="/games">All Games</a></li>
                    <li><a href="/blog">Blog</a></li>
                </ul>
            </div>
            <div class="sf-col">
                <h5>Company</h5>
                <ul>
                    <li><a href="/about">About</a></li>
                    <li><a href="/careers">Careers</a></li>
                    <li><a href="/#contact">Contact</a></li>
                </ul>
            </div>
            <div class="sf-col">
                <h5>Legal</h5>
                <ul>
                    <li><a href="/privacy-policy">Privacy Policy</a></li>
                    <li><a href="/terms">Terms of Service</a></li>
                </ul>
            </div>
        </div>
        <hr class="sf-divider">
        <div class="sf-bottom">
            <span class="sf-copy">© ${year} Switch. All rights reserved.</span>
            <div class="sf-links">
                <a href="https://discord.gg" target="_blank">Discord</a>
                <a href="https://twitter.com" target="_blank">Twitter</a>
                <a href="https://roblox.com" target="_blank">Roblox</a>
            </div>
        </div>
    </footer>`;
    const existing = document.querySelector('footer');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', footerHTML);
});
