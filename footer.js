// Inject footer into all pages
document.addEventListener('DOMContentLoaded', () => {
    // Don't inject on admin page
    if (window.location.pathname.includes('admin')) return;

    const year = new Date().getFullYear();

    const footerHTML = `
    <style>
        .site-footer {
            background: #141414;
            border-top: 1px solid #2A2A2A;
            padding: 4rem 2rem 2rem;
            font-family: 'Inter', sans-serif;
        }
        .site-footer-content {
            max-width: 1400px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 3rem;
            margin-bottom: 3rem;
        }
        .site-footer-brand p {
            color: #9CA3AF;
            font-size: 0.9rem;
            line-height: 1.6;
            margin-top: 0.75rem;
            max-width: 260px;
        }
        .site-footer-logo {
            height: 38px;
        }
        .site-footer-col h4 {
            color: #F9FAFB;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 0.85rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            margin-bottom: 1rem;
        }
        .site-footer-links {
            list-style: none;
            padding: 0;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 0.65rem;
        }
        .site-footer-links a {
            color: #9CA3AF;
            text-decoration: none;
            font-size: 0.9rem;
            transition: color 0.2s;
        }
        .site-footer-links a:hover {
            color: #FBBF24;
        }
        .site-footer-socials {
            display: flex;
            gap: 0.75rem;
            margin-top: 1.25rem;
        }
        .site-footer-social-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            border-radius: 8px;
            background: #1C1C1C;
            border: 1px solid #2A2A2A;
            color: #9CA3AF;
            text-decoration: none;
            transition: all 0.2s;
        }
        .site-footer-social-btn:hover {
            background: #FBBF24;
            border-color: #FBBF24;
            color: #000;
        }
        .site-footer-social-btn svg {
            width: 16px;
            height: 16px;
        }
        .site-footer-bottom {
            max-width: 1400px;
            margin: 0 auto;
            padding-top: 2rem;
            border-top: 1px solid #2A2A2A;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 1rem;
            color: #9CA3AF;
            font-size: 0.8rem;
        }
        .site-footer-bottom a {
            color: #9CA3AF;
            text-decoration: none;
            transition: color 0.2s;
        }
        .site-footer-bottom a:hover {
            color: #FBBF24;
        }
        @media (max-width: 768px) {
            .site-footer-content {
                grid-template-columns: 1fr 1fr;
                gap: 2rem;
            }
            .site-footer-brand {
                grid-column: 1 / -1;
            }
            .site-footer-bottom {
                flex-direction: column;
                text-align: center;
            }
        }
        @media (max-width: 480px) {
            .site-footer-content {
                grid-template-columns: 1fr;
            }
        }
    </style>
    <footer class="site-footer">
        <div class="site-footer-content">
            <div class="site-footer-brand">
                <img src="/logo.png" alt="Switch" class="site-footer-logo">
                <p>An independent Roblox studio crafting immersive experiences for millions of players worldwide.</p>
                <div class="site-footer-socials">
                    <a href="https://twitter.com" target="_blank" rel="noopener" class="site-footer-social-btn" title="Twitter / X">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    <a href="https://discord.gg" target="_blank" rel="noopener" class="site-footer-social-btn" title="Discord">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.045.03.06a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
                    </a>
                    <a href="https://roblox.com" target="_blank" rel="noopener" class="site-footer-social-btn" title="Roblox">
                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.782 0 0 13.615 10.217 16.4 14 2.785zm5.34 6.008 5.02 1.35-1.35 5.02-5.02-1.35zM13.783 7.6 24 10.384l-3.782 13.615L10 21.214z"/></svg>
                    </a>
                </div>
            </div>
            <div class="site-footer-col">
                <h4>Games</h4>
                <ul class="site-footer-links">
                    <li><a href="/games">All Games</a></li>
                    <li><a href="/blog">Blog</a></li>
                    <li><a href="/careers">Careers</a></li>
                </ul>
            </div>
            <div class="site-footer-col">
                <h4>Company</h4>
                <ul class="site-footer-links">
                    <li><a href="/#about">About Us</a></li>
                    <li><a href="/#contact">Contact</a></li>
                    <li><a href="/careers">Join the Team</a></li>
                </ul>
            </div>
            <div class="site-footer-col">
                <h4>Legal</h4>
                <ul class="site-footer-links">
                    <li><a href="#">Privacy Policy</a></li>
                    <li><a href="#">Terms of Service</a></li>
                    <li><a href="#">Cookie Policy</a></li>
                </ul>
            </div>
        </div>
        <div class="site-footer-bottom">
            <span>&copy; ${year} Switch. All rights reserved.</span>
            <span>Made with ❤️ for the Roblox community</span>
        </div>
    </footer>`;

    // Remove any existing footer and replace with consistent one
    const existingFooter = document.querySelector('footer');
    if (existingFooter) {
        existingFooter.remove();
    }

    document.body.insertAdjacentHTML('beforeend', footerHTML);
});