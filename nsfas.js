// JavaScript for NSFAS Support Page

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. ORIGINAL LOGIC: Smooth Scrolling & Active State for Side Navigation ---
    const sideNavLinks = document.querySelectorAll('.side-nav a');
    const sections = document.querySelectorAll('.content-section');

    sideNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        sideNavLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });

    // --- 2. NEW LOGIC: SEARCH MODAL ---
    const searchBar = document.getElementById('navSearchBar');
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    const allResultItems = document.querySelectorAll('.search-result-item');
    const categories = document.querySelectorAll('.search-category');

    let focusedIndex = -1;

    if (searchBar) {
        searchBar.addEventListener('click', (e) => {
            e.preventDefault();
            openSearch();
        });
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
        
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            closeSearch();
        }
    });

    closeSearchBtn.addEventListener('click', closeSearch);

    searchModal.addEventListener('click', (e) => {
        if (e.target === searchModal) {
            closeSearch();
        }
    });

    function openSearch() {
        searchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            searchInput.focus();
            searchInput.value = '';
            resetFilter();
            focusedIndex = -1;
        }, 50);
    }

    function closeSearch() {
        searchModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        
        categories.forEach(category => {
            let hasVisibleItems = false;
            const items = category.querySelectorAll('.search-result-item');
            
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                const dataTitle = item.getAttribute('data-title') || '';
                
                if (text.includes(searchTerm) || dataTitle.includes(searchTerm)) {
                    item.style.display = 'flex';
                    hasVisibleItems = true;
                } else {
                    item.style.display = 'none';
                }
            });

            if (hasVisibleItems) {
                category.classList.remove('hidden');
            } else {
                category.classList.add('hidden');
            }
        });
        
        focusedIndex = -1;
    });

    searchInput.addEventListener('keydown', (e) => {
        const visibleItems = Array.from(allResultItems).filter(item => item.style.display !== 'none');
        
        if (visibleItems.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusedIndex++;
            if (focusedIndex >= visibleItems.length) focusedIndex = 0;
            updateFocus(visibleItems);
        } 
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusedIndex--;
            if (focusedIndex < 0) focusedIndex = visibleItems.length - 1;
            updateFocus(visibleItems);
        } 
        else if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedIndex > -1 && visibleItems[focusedIndex]) {
                visibleItems[focusedIndex].click();
            }
        }
    });

    function updateFocus(items) {
        allResultItems.forEach(item => item.classList.remove('focused'));
        if (items[focusedIndex]) {
            items[focusedIndex].classList.add('focused');
            items[focusedIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    function resetFilter() {
        allResultItems.forEach(item => item.style.display = 'flex');
        categories.forEach(cat => cat.classList.remove('hidden'));
        allResultItems.forEach(item => item.classList.remove('focused'));
    }
});