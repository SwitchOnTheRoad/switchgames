document.addEventListener('DOMContentLoaded', () => {
    const navHTML = `
    <style>
        .navbar {
            position: fixed;
            top: 0; left: 0; right: 0;
            z-index: 1000;
            background: rgba(10,10,10,0.92);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid #1e1e1e;
            transform: translateY(-100%);
            transition: transform 0.25s ease;
        }
        .navbar.visible { transform: translateY(0); }

        .nav-container {
            max-width: 1300px;
            margin: 0 auto;
            padding: 0 2rem;
            height: 64px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .nav-logo img {
            height: 34px;
            display: block;
        }

        .nav-menu {
            display: flex;
            list-style: none;
            gap: 0;
            align-items: center;
        }

        .nav-link {
            display: block;
            padding: 0 1.25rem;
            height: 64px;
            line-height: 64px;
            color: #808080;
            font-family: 'Inter', sans-serif;
            font-weight: 500;
            font-size: 0.85rem;
            text-decoration: none;
            letter-spacing: 0.02em;
            transition: color 0.15s;
            position: relative;
        }

        .nav-link:hover { color: #F5F5F5; }

        .nav-link.active {
            color: #FBBF24;
        }

        .nav-link.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 1.25rem;
            right: 1.25rem;
            height: 2px;
            background: #FBBF24;
        }

        .nav-cta {
            display: inline-flex;
            align-items: center;
            padding: 0.5rem 1.25rem;
            background: #FBBF24;
            color: #000;
            font-family: 'Inter', sans-serif;
            font-size: 0.8rem;
            font-weight: 700;
            text-decoration: none;
            letter-spacing: 0.04em;
            border-radius: 3px;
            margin-left: 1rem;
            transition: background 0.15s;
        }

        .nav-cta:hover { background: #E5A800; }

        .hamburger {
            display: none;
            flex-direction: column;
            gap: 5px;
            cursor: pointer;
            background: none;
            border: none;
            padding: 4px;
        }

        .hamburger span {
            width: 22px;
            height: 2px;
            background: #F5F5F5;
            border-radius: 1px;
            transition: all 0.2s ease;
            display: block;
        }

        .hamburger.active span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .hamburger.active span:nth-child(2) { opacity: 0; }
        .hamburger.active span:nth-child(3) { transform: rotate(-45deg) translate(4px, -5px); }

        @media (max-width: 768px) {
            .nav-container { padding: 0 1.25rem; }

            .nav-menu {
                display: none;
                position: fixed;
                top: 64px; left: 0; right: 0;
                flex-direction: column;
                gap: 0;
                background: #0f0f0f;
                border-bottom: 1px solid #1e1e1e;
            }

            .nav-menu.active { display: flex; }

            .nav-menu li { width: 100%; border-bottom: 1px solid #1e1e1e; }

            .nav-link {
                height: auto;
                line-height: 1;
                padding: 1rem 1.5rem;
                font-size: 0.9rem;
            }

            .nav-link.active::after { display: none; }

            .nav-cta { margin: 1rem 1.5rem; }

            .hamburger { display: flex; }
        }
    </style>
    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <a href="/" class="nav-logo"><img src="/logo.png" alt="Switch"></a>
            <button class="hamburger" id="hamburger" aria-label="Menu">
                <span></span><span></span><span></span>
            </button>
            <ul class="nav-menu" id="nav-menu">
                <li><a href="/" class="nav-link">Home</a></li>
                <li><a href="/games" class="nav-link">Games</a></li>
                <li><a href="/blog" class="nav-link">Blog</a></li>
                <li><a href="/careers" class="nav-link">Careers</a></li>
                <li><a href="/#contact" class="nav-cta">Contact</a></li>
            </ul>
        </div>
    </nav>`;

    if (!document.querySelector('.navbar')) {
        document.body.insertAdjacentHTML('afterbegin', navHTML);
    }

    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');

    hamburger?.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Set active link
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (!href || href === '/#contact') return;
        if (href === '/' && (path === '/' || path === '/index.html')) link.classList.add('active');
        else if (href !== '/' && path.startsWith(href)) link.classList.add('active');
    });

    // Navbar visibility
    const navbar = document.getElementById('navbar');
    const isHome = path === '/' || path === '/index.html';

    if (!isHome) {
        navbar.classList.add('visible');
    } else {
        window.addEventListener('scroll', () => {
            window.scrollY > 80 ? navbar.classList.add('visible') : navbar.classList.remove('visible');
        });
    }
});