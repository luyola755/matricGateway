document.addEventListener('DOMContentLoaded', function() {
    highlightActivePage();
    createBackToTop();
    setupAnnouncementRotator();
    setupFormValidation();
    setupSmoothScroll();
    setupMobileMenu();
    loadUserPreferences();
    setupUniversityFilter();
    setupAPSCalculator();
    setupNSFASCountdown();
    setupPaperSearch();
});

function highlightActivePage() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.main-nav a').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}

function createBackToTop() {
    if (document.getElementById('backToTop')) return;
    
    const btn = document.createElement('button');
    btn.id = 'backToTop';
    btn.innerHTML = '↑';
    btn.setAttribute('aria-label', 'Back to top');
    btn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        padding: 14px 18px;
        background: #ffb347;
        color: #002b5e;
        border: none;
        border-radius: 50%;
        font-size: 1.4rem;
        font-weight: bold;
        cursor: pointer;
        display: none;
        box-shadow: 0 4px 15px rgba(255, 179, 71, 0.4);
        transition: all 0.3s ease;
        z-index: 1000;
        line-height: 1;
    `;
    
    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.15)';
        btn.style.boxShadow = '0 6px 25px rgba(255, 179, 71, 0.6)';
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1)';
        btn.style.boxShadow = '0 4px 15px rgba(255, 179, 71, 0.4)';
    });
    
    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    document.body.appendChild(btn);
    
    window.addEventListener('scroll', () => {
        btn.style.display = window.scrollY > 400 ? 'block' : 'none';
    });
}

function setupAnnouncementRotator() {
    const element = document.getElementById('announcement');
    if (!element) return;
    
    const announcements = [
        '🎓 NSFAS applications closing 31 January 2027',
        '📚 New past papers added for 2025',
        '🏛️ University applications now open',
        '💡 Tip: Practice past papers regularly',
        '📧 Need help? Contact support@matricgateway.co.za'
    ];
    
    let index = 0;
    element.textContent = announcements[0];
    
    setInterval(() => {
        index = (index + 1) % announcements.length;
        element.style.opacity = '0';
        setTimeout(() => {
            element.textContent = announcements[index];
            element.style.opacity = '1';
        }, 300);
    }, 5000);
}

function setupFormValidation() {
    document.querySelectorAll('form').forEach(form => {
        form.querySelectorAll('input[required], textarea[required], select[required]').forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            input.addEventListener('input', function() {
                if (this.value.trim()) {
                    this.style.borderColor = '#4CAF50';
                }
            });
        });
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            let isValid = true;
            const requiredFields = this.querySelectorAll('input[required], textarea[required], select[required]');
            
            requiredFields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });
            
            if (isValid) {
                const successMsg = document.createElement('div');
                successMsg.style.cssText = `
                    background: #4CAF50;
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 15px;
                    text-align: center;
                    font-weight: bold;
                `;
                successMsg.textContent = '✅ Form submitted successfully! We\'ll get back to you soon.';
                
                const oldMsg = this.querySelector('.form-success-msg');
                if (oldMsg) oldMsg.remove();
                
                successMsg.classList.add('form-success-msg');
                this.appendChild(successMsg);
                
                setTimeout(() => {
                    this.reset();
                    if (successMsg) successMsg.remove();
                }, 5000);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMsg = '';
    
    if (!value) {
        isValid = false;
        errorMsg = 'This field is required';
    } else if (field.type === 'email' && !isValidEmail(value)) {
        isValid = false;
        errorMsg = 'Please enter a valid email address';
    } else if (field.type === 'tel' && !isValidPhone(value)) {
        isValid = false;
        errorMsg = 'Please enter a valid phone number';
    }
    
    if (!isValid) {
        field.style.borderColor = '#f44336';
        field.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.1)';
        showFieldError(field, errorMsg);
    } else {
        field.style.borderColor = '#4CAF50';
        field.style.boxShadow = 'none';
        hideFieldError(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    let error = field.parentElement.querySelector('.field-error');
    if (!error) {
        error = document.createElement('span');
        error.className = 'field-error';
        error.style.cssText = `
            color: #f44336;
            font-size: 0.85rem;
            margin-top: 4px;
            display: block;
        `;
        field.parentElement.appendChild(error);
    }
    error.textContent = message;
}

function hideFieldError(field) {
    const error = field.parentElement.querySelector('.field-error');
    if (error) error.remove();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    return /^[0-9+\-\s()]{10,}$/.test(phone);
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function setupMobileMenu() {
    const headerContainer = document.querySelector('.header-container');
    if (!headerContainer) return;
    
    if (document.querySelector('.hamburger-menu')) return;
    
    const hamburger = document.createElement('button');
    hamburger.className = 'hamburger-menu';
    hamburger.setAttribute('aria-label', 'Toggle navigation menu');
    hamburger.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    hamburger.style.cssText = `
        display: none;
        background: none;
        border: none;
        cursor: pointer;
        padding: 8px;
        flex-direction: column;
        gap: 5px;
    `;
    
    hamburger.querySelectorAll('span').forEach(span => {
        span.style.cssText = `
            display: block;
            width: 28px;
            height: 3px;
            background: white;
            border-radius: 3px;
            transition: all 0.3s ease;
        `;
    });
    
    const nav = document.querySelector('.main-nav');
    headerContainer.appendChild(hamburger);
    
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    function handleMobileMenu(e) {
        if (e.matches) {
            hamburger.style.display = 'flex';
            nav.style.display = 'none';
            nav.style.flexDirection = 'column';
            nav.style.width = '100%';
            nav.style.padding = '20px 0';
            nav.style.gap = '15px';
        } else {
            hamburger.style.display = 'none';
            nav.style.display = 'flex';
            nav.style.flexDirection = 'row';
            nav.style.padding = '0';
            nav.style.gap = '28px';
        }
    }
    
    mediaQuery.addListener(handleMobileMenu);
    handleMobileMenu(mediaQuery);
    
    hamburger.addEventListener('click', function() {
        const isOpen = nav.style.display === 'flex';
        nav.style.display = isOpen ? 'none' : 'flex';
        
        const spans = this.querySelectorAll('span');
        if (!isOpen) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
    
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                nav.style.display = 'none';
                const spans = hamburger.querySelectorAll('span');
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    });
}

function loadUserPreferences() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

function addDarkModeToggle() {
    const toggle = document.createElement('button');
    toggle.className = 'dark-mode-toggle';
    toggle.innerHTML = '🌓';
    toggle.style.cssText = `
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 5px 10px;
        color: white;
        transition: transform 0.3s;
    `;
    
    toggle.addEventListener('mouseenter', () => {
        toggle.style.transform = 'scale(1.2)';
    });
    
    toggle.addEventListener('mouseleave', () => {
        toggle.style.transform = 'scale(1)';
    });
    
    toggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    });
    
    const headerContainer = document.querySelector('.header-container');
    if (headerContainer) {
        headerContainer.appendChild(toggle);
    }
}

function setupUniversityFilter() {
    const provinceSelect = document.getElementById('provinceSelect');
    if (!provinceSelect) return;
    
    const universities = {
        'western-cape': [
            'University of Cape Town',
            'Stellenbosch University',
            'Cape Peninsula University of Technology',
            'University of the Western Cape'
        ],
        'gauteng': [
            'University of the Witwatersrand',
            'University of Pretoria',
            'University of Johannesburg',
            'Tshwane University of Technology',
            'University of South Africa (UNISA)'
        ],
        'kwazulu-natal': [
            'University of KwaZulu-Natal',
            'Durban University of Technology',
            'Mangosuthu University of Technology'
        ],
        'eastern-cape': [
            'Rhodes University',
            'Nelson Mandela University',
            'Walter Sisulu University',
            'University of Fort Hare'
        ],
        'free-state': [
            'University of the Free State',
            'Central University of Technology'
        ],
        'mpumalanga': [
            'University of Mpumalanga'
        ],
        'limpopo': [
            'University of Limpopo',
            'University of Venda'
        ],
        'north-west': [
            'North-West University'
        ],
        'northern-cape': [
            'Sol Plaatje University'
        ]
    };
    
    const universityList = document.querySelector('.university-list ul') || 
                          document.querySelector('.university-list');
    
    provinceSelect.addEventListener('change', function() {
        const province = this.value;
        const list = document.querySelector('.university-list ul');
        
        if (province && universities[province]) {
            list.innerHTML = universities[province]
                .map(uni => `<li>${uni}</li>`)
                .join('');
            list.style.opacity = '0';
            setTimeout(() => {
                list.style.opacity = '1';
                list.style.transition = 'opacity 0.3s';
            }, 50);
        } else if (!province) {
            const allUniversities = [
                'University of Cape Town',
                'University of the Witwatersrand',
                'University of Pretoria',
                'Cape Peninsula University of Technology',
                'Tshwane University of Technology',
                'University of the Free State',
                'North-West University',
                'University of Johannesburg',
                'Stellenbosch University',
                'University of KwaZulu-Natal'
            ];
            list.innerHTML = allUniversities.map(uni => `<li>${uni}</li>`).join('');
        }
    });
}

function setupAPSCalculator() {
    const calcBtn = document.querySelector('.calc-btn');
    if (!calcBtn) return;
    
    calcBtn.addEventListener('click', function() {
        const input = this.closest('.aps-calculator').querySelector('input');
        const score = parseInt(input.value);
        const resultDiv = document.querySelector('.aps-result') || createAPSResult(this);
        
        if (isNaN(score) || score < 0 || score > 42) {
            resultDiv.textContent = '⚠️ Please enter a valid APS score (0-42)';
            resultDiv.style.color = '#f44336';
            return;
        }
        
        let message = '';
        let color = '';
        
        if (score >= 35) {
            message = `🎉 Excellent! ${score} APS - You qualify for most programmes`;
            color = '#4CAF50';
        } else if (score >= 28) {
            message = `✅ Good! ${score} APS - You qualify for many degree programmes`;
            color = '#4CAF50';
        } else if (score >= 22) {
            message = `📚 ${score} APS - You may qualify for diploma programmes`;
            color = '#ff9800';
        } else if (score >= 18) {
            message = `📖 ${score} APS - Consider higher certificate programmes`;
            color = '#ff9800';
        } else {
            message = `💪 ${score} APS - Explore TVET colleges or bridging courses`;
            color = '#f44336';
        }
        
        resultDiv.textContent = message;
        resultDiv.style.color = color;
        resultDiv.style.fontWeight = 'bold';
        resultDiv.style.marginTop = '10px';
        resultDiv.style.padding = '10px';
        resultDiv.style.borderRadius = '8px';
        resultDiv.style.background = color + '20';
    });
}

function createAPSResult(button) {
    const div = document.createElement('div');
    div.className = 'aps-result';
    button.closest('.aps-calculator').appendChild(div);
    return div;
}

function setupNSFASCountdown() {
    const countdownElement = document.getElementById('nsfasCountdown');
    if (!countdownElement) return;
    
    const closingDate = new Date('2027-01-31T23:59:59');
    
    function updateCountdown() {
        const now = new Date();
        const diff = closingDate - now;
        
        if (diff <= 0) {
            countdownElement.textContent = '⏰ Applications are now closed';
            return;
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        countdownElement.textContent = `⏰ ${days}d ${hours}h ${minutes}m ${seconds}s`;
        
        if (days < 30) {
            countdownElement.style.color = '#ff6b6b';
        }
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function setupPaperSearch() {
    const searchInput = document.getElementById('searchPapers');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        const cards = document.querySelectorAll('.paper-card');
        let visibleCount = 0;
        
        cards.forEach(card => {
            const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
            const meta = card.querySelector('.paper-meta')?.textContent.toLowerCase() || '';
            const year = card.querySelector('.year-badge')?.textContent.toLowerCase() || '';
            
            const matches = title.includes(query) || meta.includes(query) || year.includes(query);
            
            if (matches) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        const noResults = document.getElementById('noResults');
        if (noResults) {
            noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    });
}

console.log('%c🎓 Matric Gateway', 'font-size: 24px; font-weight: bold; color: #002b5e;');
console.log('%cBuilt for Students, by Students', 'font-size: 14px; color: #ffb347;');
console.log('%c📧 support@matricgateway.co.za', 'font-size: 12px; color: #666;');