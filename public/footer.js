document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin')) return;
    const year = new Date().getFullYear();
    const footerHTML = `
    <style>
        .site-footer { background: #040404; border-top: 1px solid #1C1C1C; padding: 4rem 3rem 2.5rem; font-family: 'Manrope', sans-serif; }
        .sf-grid { max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem; margin-bottom: 3.5rem; }
        .sf-brand img { height: 26px; display: block; margin-bottom: 1rem; filter: brightness(0) invert(1); }
        .sf-brand p { color: #444; font-size: 0.82rem; line-height: 1.7; max-width: 240px; }
        .sf-col h5 { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.2em; color: #333; margin-bottom: 1.25rem; }
        .sf-col ul { list-style: none; display: flex; flex-direction: column; gap: 0.75rem; }
        .sf-col a { color: #444; text-decoration: none; font-size: 0.82rem; transition: color 0.15s; }
        .sf-col a:hover { color: #FAFAF8; }
        .sf-bottom { max-width: 1400px; margin: 0 auto; padding-top: 2rem; border-top: 1px solid #1C1C1C; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
        .sf-copy { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; letter-spacing: 0.14em; text-transform: uppercase; color: #282828; }
        .sf-links { display: flex; gap: 1.5rem; font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; letter-spacing: 0.14em; text-transform: uppercase; }
        .sf-links a { color: #282828; text-decoration: none; transition: color 0.15s; }
        .sf-links a:hover { color: #5A5A5A; }
        @media (max-width: 900px) { .sf-grid { grid-template-columns: 1fr 1fr; gap: 2rem; } .sf-brand { grid-column: 1 / -1; } }
        @media (max-width: 500px) { .sf-grid { grid-template-columns: 1fr; } .site-footer { padding: 3rem 1.5rem 2rem; } .sf-bottom { flex-direction: column; align-items: flex-start; } }
    </style>
    <footer class="site-footer">
        <div class="sf-grid">
            <div class="sf-brand"><img src="/logo.png" alt="Switch"><p>An independent Roblox game studio building games for millions of players. Est. 2025.</p></div>
            <div class="sf-col"><h5>Games</h5><ul><li><a href="/games">All Games</a></li><li><a href="/blog">Blog</a></li></ul></div>
            <div class="sf-col"><h5>Company</h5><ul><li><a href="/about">About</a></li><li><a href="/careers">Careers</a></li><li><a href="/#contact">Contact</a></li></ul></div>
            <div class="sf-col"><h5>Legal</h5><ul><li><a href="/privacy-policy">Privacy Policy</a></li><li><a href="/terms">Terms of Service</a></li></ul></div>
        </div>
        <div class="sf-bottom">
            <span class="sf-copy">© ${year} Switch. All rights reserved.</span>
            <div class="sf-links"><a href="https://discord.gg" target="_blank">Discord</a><a href="https://twitter.com" target="_blank">Twitter</a><a href="https://roblox.com" target="_blank">Roblox</a></div>
        </div>
    </footer>`;
    const existing = document.querySelector('footer');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', footerHTML);
});