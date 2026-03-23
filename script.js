// --- Custom Cursor ---
const cursorDot = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');
let mouseX = 0;
let mouseY = 0;
let outlineX = 0;
let outlineY = 0;

// Track mouse movement
window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Dot follows precisely, directly
    if(cursorDot) {
        cursorDot.style.left = `${mouseX}px`;
        cursorDot.style.top = `${mouseY}px`;
    }
});

// Smooth animation for the outline using requestAnimationFrame
function animateCursor() {
    // Ease factor for smoothed delay
    let ease = 0.15;
    outlineX += (mouseX - outlineX) * ease;
    outlineY += (mouseY - outlineY) * ease;
    
    if(cursorOutline) {
        cursorOutline.style.left = `${outlineX}px`;
        cursorOutline.style.top = `${outlineY}px`;
    }
    
    requestAnimationFrame(animateCursor);
}
// Start animating if desktop (prevent error on mobile where it's hidden anyway)
if(cursorOutline) animateCursor();

// Add hover effects on interactable elements
const interactables = document.querySelectorAll('a, button, input, textarea, .project-card, .cert-card, .interest-tag, .timeline-item, .exp-card, .custom-vol-card');
interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
    });
});

// --- Navigation Menu Toggle ---
const menuIcon = document.querySelector('.menu-icon');
const navLinks = document.querySelector('.nav-links');

if (menuIcon) {
    menuIcon.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = menuIcon.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = menuIcon.querySelector('i');
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        });
    });
}

// --- Sticky Navbar Background ---
window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(3, 5, 10, 0.95)';
            navbar.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
            navbar.style.padding = '10px 0';
        } else {
            navbar.style.background = 'rgba(3, 5, 10, 0.8)';
            navbar.style.boxShadow = 'none';
            navbar.style.padding = '0';
        }
    }
});

// --- Scroll Animation (Fade In & Slide Up) ---
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1 // Triggers slightly earlier for smoother experience
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target); // Stop observing once it's visible
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in-section').forEach(section => {
    observer.observe(section);
});

// --- Advanced Space Particle Background ---
const canvas = document.getElementById('particle-canvas');
const ctx = canvas ? canvas.getContext('2d') : null;

let particlesArray = [];
let shootingStars = [];
let w, h;

if(canvas && ctx) {
    function initCanvas() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', () => {
        initCanvas();
        initParticles();
    });

    class Particle {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.size = Math.random() * 1.5 + 0.5;
            this.baseX = this.x;
            this.baseY = this.y;
            this.density = (Math.random() * 30) + 1;
            this.speedX = (Math.random() - 0.5) * 0.2;
            this.speedY = (Math.random() - 0.5) * 0.2;
            this.baseAlpha = Math.random() * 0.5 + 0.1;
            
            // Randomly assign some particles to glow in accent color, others white
            this.color = Math.random() < 0.2 ? '0, 191, 255' : '255, 255, 255';
        }
        
        update() {
            // Natural drift
            this.x += this.speedX;
            this.y += this.speedY;
            this.baseX += this.speedX;
            this.baseY += this.speedY;

            // Mouse interaction
            let dx = mouseX - this.x;
            let dy = mouseY - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;
            let maxDistance = 150;
            let force = (maxDistance - distance) / maxDistance;
            let directionX = forceDirectionX * force * this.density;
            let directionY = forceDirectionY * force * this.density;

            if (distance < maxDistance) {
                // Push particles away
                this.x -= directionX;
                this.y -= directionY;
            } else {
                // Return to base position
                if (this.x !== this.baseX) {
                    let dxBase = this.x - this.baseX;
                    this.x -= dxBase / 10;
                }
                if (this.y !== this.baseY) {
                    let dyBase = this.y - this.baseY;
                    this.y -= dyBase / 10;
                }
            }
            
            // Wrap around screen seamlessly
            if (this.baseX > w) { this.baseX = 0; this.x = 0; }
            else if (this.baseX < 0) { this.baseX = w; this.x = w; }
            if (this.baseY > h) { this.baseY = 0; this.y = 0; }
            else if (this.baseY < 0) { this.baseY = h; this.y = h; }
        }
        
        draw() {
            ctx.fillStyle = `rgba(${this.color}, ${this.baseAlpha})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
    }

    class ShootingStar {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * w * 1.5;
            this.y = 0;
            this.len = Math.random() * 80 + 20;
            this.speedX = -(Math.random() * 4 + 4);
            this.speedY = Math.random() * 4 + 4;
            this.opacity = 0;
            this.active = false;
            this.wait = Math.random() * 300 + 100; // longer wait for rarity
        }
        update() {
            if (!this.active) {
                this.wait--;
                if (this.wait <= 0) {
                    this.active = true;
                    this.opacity = 1;
                }
                return;
            }
            this.x += this.speedX;
            this.y += this.speedY;
            this.opacity -= 0.01;
            
            if (this.opacity <= 0 || this.x < -100 || this.y > h + 100) {
                this.reset();
            }
        }
        draw() {
            if (!this.active) return;
            ctx.beginPath();
            let gradient = ctx.createLinearGradient(this.x, this.y, this.x - this.speedX * this.len * 0.1, this.y - this.speedY * this.len * 0.1);
            gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
            gradient.addColorStop(1, 'transparent');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x - this.speedX * (this.len * 0.1), this.y - this.speedY * (this.len * 0.1));
            ctx.stroke();
        }
    }

    function initParticles() {
        particlesArray = [];
        shootingStars = [];
        let numberOfParticles = Math.min((w * h) / 8000, 150); // Balanced density
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
        for (let i = 0; i < 2; i++) { // Max 2 shooting stars active/waiting at a time
            shootingStars.push(new ShootingStar());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, w, h);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        for (let i = 0; i < shootingStars.length; i++) {
            shootingStars[i].update();
            shootingStars[i].draw();
        }
        requestAnimationFrame(animateParticles);
    }

    initCanvas();
    initParticles();
    animateParticles();
}

// --- Form Submission Prevention (Mock) ---
const contactForm = document.getElementById('contactForm');
if(contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const btn = this.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Message Sent! <i class="fas fa-rocket"></i>';
        btn.style.background = '#00bfff';
        btn.style.color = '#03050a';
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.color = '';
            this.reset();
        }, 4000);
    });
}
