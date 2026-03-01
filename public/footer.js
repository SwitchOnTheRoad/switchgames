document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin')) return;

    const year = new Date().getFullYear();

    const footerHTML = `
    <style>
        .site-footer {
            background: #0e0e0e;
            border-top: 1px solid #1e1e1e;
            padding: 4rem 2rem 2.5rem;
            font-family: 'Inter', sans-serif;
        }
        .site-footer-grid {
            max-width: 1300px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 3rem;
            margin-bottom: 3.5rem;
        }
        .site-footer-brand img {
            height: 32px;
            display: block;
            margin-bottom: 1rem;
        }
        .site-footer-brand p {
            color: #606060;
            font-size: 0.85rem;
            line-height: 1.7;
            max-width: 260px;
        }
        .site-footer-col h5 {
            font-family: 'Inter', sans-serif;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.14em;
            color: #808080;
            margin-bottom: 1.25rem;
        }
        .site-footer-col ul {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        .site-footer-col a {
            color: #606060;
            text-decoration: none;
            font-size: 0.875rem;
            transition: color 0.15s;
        }
        .site-footer-col a:hover { color: #F5F5F5; }
        .site-footer-bottom {
            max-width: 1300px;
            margin: 0 auto;
            padding-top: 2rem;
            border-top: 1px solid #1e1e1e;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
            color: #404040;
            font-size: 0.78rem;
        }
        .site-footer-bottom a {
            color: #404040;
            text-decoration: none;
            transition: color 0.15s;
        }
        .site-footer-bottom a:hover { color: #808080; }
        @media (max-width: 900px) {
            .site-footer-grid { grid-template-columns: 1fr 1fr; gap: 2rem; }
            .site-footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 500px) {
            .site-footer-grid { grid-template-columns: 1fr; }
            .site-footer-bottom { flex-direction: column; align-items: flex-start; }
        }
    </style>
    <footer class="site-footer">
        <div class="site-footer-grid">
            <div class="site-footer-brand">
                <img src="/logo.png" alt="Switch">
                <p>An independent Roblox game studio building immersive experiences for millions of players worldwide.</p>
            </div>
            <div class="site-footer-col">
                <h5>Games</h5>
                <ul>
                    <li><a href="/games">All Games</a></li>
                    <li><a href="/blog">Blog</a></li>
                </ul>
            </div>
            <div class="site-footer-col">
                <h5>Company</h5>
                <ul>
                    <li><a href="/careers">Careers</a></li>
                    <li><a href="/#contact">Contact</a></li>
                </ul>
            </div>
            <div class="site-footer-col">
                <h5>Legal</h5>
                <ul>
                    <li><a href="/privacy-policy">Privacy Policy</a></li>
                    <li><a href="/terms">Terms of Service</a></li>
                </ul>
            </div>
        </div>
        <div class="site-footer-bottom">
            <span>&copy; ${year} Switch. All rights reserved.</span>
            <span><a href="https://discord.gg" target="_blank">Discord</a> &nbsp;·&nbsp; <a href="https://twitter.com" target="_blank">Twitter</a> &nbsp;·&nbsp; <a href="https://roblox.com" target="_blank">Roblox</a></span>
        </div>
    </footer>`;

    const existing = document.querySelector('footer');
    if (existing) existing.remove();
    document.body.insertAdjacentHTML('beforeend', footerHTML);
});