document.addEventListener('DOMContentLoaded', () => {
    const navHTML = `
    <style>
        :root { --sw-banner-height: 0px; }
        .navbar {
            position: fixed; top: var(--sw-banner-height); left: 0; right: 0;
            z-index: 1000;
            background: rgba(4,11,24,0.92);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid #112035;
            transform: translateY(-100%);
            transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .navbar.visible { transform: translateY(0); }
        .nav-container { max-width: 1400px; margin: 0 auto; padding: 0 3rem; height: 64px; display: flex; justify-content: space-between; align-items: center; }
        .nav-logo img { height: 30px; display: block; filter: brightness(0) invert(1); }
        .nav-menu { display: flex; list-style: none; gap: 0; align-items: center; }
        .nav-link {
            display: block; padding: 0 1.1rem; height: 64px; line-height: 64px;
            color: #4a6890; font-family: 'JetBrains Mono', monospace;
            font-size: 0.62rem; text-decoration: none; letter-spacing: 0.14em;
            text-transform: uppercase; transition: color 0.15s; position: relative;
        }
        .nav-link:hover { color: #e4edff; }
        .nav-link.active { color: #3b82f6; }
        .nav-link.active::after { content: ''; position: absolute; bottom: 0; left: 1.1rem; right: 1.1rem; height: 1px; background: #3b82f6; }
        .nav-cta {
            display: inline-flex; align-items: center; padding: 0.55rem 1.25rem;
            background: #3b82f6; color: #e4edff; font-family: 'JetBrains Mono', monospace;
            font-size: 0.6rem; font-weight: 600; text-decoration: none; letter-spacing: 0.14em;
            text-transform: uppercase; margin-left: 1rem;
            transition: background 0.15s, box-shadow 0.15s;
            border-radius: 4px;
        }
        .nav-cta:hover { background: #2563eb; box-shadow: 0 0 18px rgba(59,130,246,0.35); }
        .hamburger { display: none; flex-direction: column; gap: 5px; cursor: pointer; background: none; border: none; padding: 4px; }
        .hamburger span { width: 22px; height: 1px; background: #e4edff; transition: all 0.2s ease; display: block; }
        .hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(4px, 4px); }
        .hamburger.active span:nth-child(2) { opacity: 0; }
        .hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(4px, -4px); }
        @media (max-width: 768px) {
            .nav-container { padding: 0 1.5rem; }
            .nav-menu { display: none; position: fixed; top: calc(64px + var(--sw-banner-height)); left: 0; right: 0; flex-direction: column; gap: 0; background: #040b18; border-bottom: 1px solid #112035; z-index: 999; }
            .nav-menu.active { display: flex; }
            .nav-menu li { width: 100%; border-bottom: 1px solid #112035; }
            .nav-link { height: auto; line-height: 1; padding: 1rem 1.5rem; font-size: 0.7rem; }
            .nav-link.active::after { display: none; }
            .nav-cta { margin: 1rem 1.5rem; border-radius: 4px; }
            .hamburger { display: flex; }
        }
    </style>
    <div id="site-announcement" style="display:none;position:fixed;top:0;left:0;right:0;z-index:1100;padding:0.55rem 1rem;text-align:center;font-size:0.75rem;font-weight:600;font-family:'JetBrains Mono',monospace;letter-spacing:0.1em;text-transform:uppercase;"></div>
    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <a href="/" class="nav-logo"><img src="/logoextended.png" alt="Switch"></a>
            <button class="hamburger" id="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
            <ul class="nav-menu" id="nav-menu">
                <li><a href="/" class="nav-link">Home</a></li>
                <li><a href="/games" class="nav-link">Games</a></li>
                <li><a href="/about" class="nav-link">About</a></li>
                <li><a href="/blog" class="nav-link">Blog</a></li>
                <li><a href="/careers" class="nav-link">Careers</a></li>
                <li><a href="/#contact" class="nav-cta">Contact</a></li>
            </ul>
        </div>
    </nav>`;

    if (!document.querySelector('.navbar')) document.body.insertAdjacentHTML('afterbegin', navHTML);

    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    hamburger?.addEventListener('click', () => { hamburger.classList.toggle('active'); navMenu.classList.toggle('active'); });
    document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => { hamburger?.classList.remove('active'); navMenu?.classList.remove('active'); }));

    async function loadBanner() {
        try {
            const res = await fetch('/api/site-settings');
            if (!res.ok) return;
            const data = await res.json();
            const a = data.settings?.announcement;
            const el = document.getElementById('site-announcement');
            if (!el || !a?.enabled || !a?.text) return;
            const text = String(a.text);
            const safeLink = a.link && /^https?:\/\//.test(a.link) ? a.link : '';
            el.style.display = 'block';
            el.style.background = a.background || '#3b82f6';
            el.style.color = a.textColor || '#e4edff';
            el.innerHTML = safeLink ? `<a href="${safeLink}" target="_blank" rel="noopener noreferrer" style="color:inherit;text-decoration:underline;">${text}</a>` : text;
            const h = Math.round(el.getBoundingClientRect().height || 36);
            document.documentElement.style.setProperty('--sw-banner-height', `${h}px`);
        } catch { }
    }
    loadBanner();

    const path = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '/#contact') return;
        if (href === '/' && (path === '/' || path === '/index.html')) link.classList.add('active');
        else if (href !== '/' && path.startsWith(href)) link.classList.add('active');
    });

    const navbar = document.getElementById('navbar');
    const isHome = path === '/' || path === '/index.html';
    if (!isHome) { navbar.classList.add('visible'); }
    else {
        window.addEventListener('scroll', () => navbar.classList.toggle('visible', window.scrollY > 80));
    }
});
