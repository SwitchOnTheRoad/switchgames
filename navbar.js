// Inject navbar into all pages
document.addEventListener('DOMContentLoaded', () => {
    const navbarHTML = `
    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <a href="/"><img src="heroextended.png" alt="Switch" class="logo-img"></a>
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
        window.addEventListener('scroll', () => { 
            window.pageYOffset > 100 ? navbar.classList.add('visible') : navbar.classList.remove('visible'); 
        });
    }
});