// Inject navbar into all pages
document.addEventListener('DOMContentLoaded', () => {
    const navbarHTML = `
    <style>
        .navbar {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            background: rgba(10, 10, 10, 0.95);
            backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--border);
            transform: translateY(-100%);
            transition: transform 0.3s ease;
        }
        .navbar.visible {
            transform: translateY(0);
        }
        .nav-container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo-img {
            height: 40px;
            transition: transform 0.3s ease;
        }
        .logo-img:hover {
            transform: scale(1.05);
        }
        .nav-menu {
            display: flex;
            list-style: none;
            gap: 2.5rem;
            align-items: center;
        }
        .nav-link {
            color: var(--text-muted);
            font-weight: 500;
            font-size: 0.9rem;
            text-decoration: none;
            transition: color 0.3s ease;
            position: relative;
        }
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 2px;
            background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);
            transition: width 0.3s ease;
        }
        .nav-link:hover, .nav-link.active {
            color: var(--text);
        }
        .nav-link:hover::after, .nav-link.active::after {
            width: 100%;
        }
        .hamburger {
            display: none;
            flex-direction: column;
            gap: 0.4rem;
            cursor: pointer;
            background: none;
            border: none;
        }
        .hamburger span {
            width: 25px;
            height: 3px;
            background: var(--text);
            border-radius: 2px;
            transition: all 0.3s ease;
        }
        .hamburger.active span:nth-child(1) {
            transform: rotate(45deg) translate(10px, 10px);
        }
        .hamburger.active span:nth-child(2) {
            opacity: 0;
        }
        .hamburger.active span:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -7px);
        }
        @media (max-width: 768px) {
            .nav-container {
                padding: 1rem 1.5rem;
                z-index: 1001;
                position: relative;
            }
            .nav-menu {
                position: fixed;
                top: 60px;
                left: 0;
                height: calc(100vh - 60px);
                width: 280px;
                flex-direction: column;
                gap: 0;
                background: var(--surface);
                border-right: 1px solid var(--border);
                padding: 2rem 0;
                transform: translateX(-100%);
                transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
                overflow-y: auto;
                z-index: 999;
            }
            .nav-menu.active {
                transform: translateX(0);
            }
            .nav-menu li {
                width: 100%;
                border-bottom: 1px solid var(--border);
            }
            .nav-link {
                display: block;
                padding: 1rem 1.5rem;
                font-size: 1rem;
            }
            .hamburger {
                display: flex;
                z-index: 1001;
            }
            .logo-img {
                height: 35px;
            }
        }
    </style>
    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <a href="/"><img src="logo.png" alt="Switch" class="logo-img"></a>
            <button class="hamburger" id="hamburger">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav-menu" id="nav-menu">
                <li><a href="/" class="nav-link">Home</a></li>
                <li><a href="/games" class="nav-link">Games</a></li>
                <li><a href="/blog" class="nav-link">Blog</a></li>
                <li><a href="/careers" class="nav-link">Careers</a></li>
                <li><a href="#contact" class="nav-link">Contact</a></li>
            </ul>
        </div>
    </nav>`;

    // Insert navbar at the beginning of body if it doesn't exist
    if (!document.querySelector('.navbar')) {
        document.body.insertAdjacentHTML('afterbegin', navbarHTML);
    }

    // Initialize hamburger menu
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when link is clicked
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Navbar scroll visibility
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const isHomePage = window.location.pathname === '/' || window.location.pathname === '/index.html';
        if (!isHomePage) {
            // On subpages, always show the navbar immediately
            navbar.classList.add('visible');
        } else {
            // On homepage, show after scrolling
            window.addEventListener('scroll', () => { 
                window.pageYOffset > 100 ? navbar.classList.add('visible') : navbar.classList.remove('visible'); 
            });
        }
    }

    // Set active nav link based on current page
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '/' && currentPath.startsWith(href)) {
            link.classList.add('active');
        } else if (href === '/' && currentPath === '/') {
            link.classList.add('active');
        }
    });
});