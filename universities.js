// JavaScript for University Explorer Page

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Card Click Animation (Your Original Code) ---
    const provinceCards = document.querySelectorAll('.province-card');
    provinceCards.forEach(card => {
        card.addEventListener('click', function(e) {
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });

    // --- 2. SEARCH MODAL LOGIC ---
    const searchBar = document.getElementById('navSearchBar');
    const searchModal = document.getElementById('searchModal');
    const searchInput = document.getElementById('searchInput');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    const allResultItems = document.querySelectorAll('.search-result-item');
    const categories = document.querySelectorAll('.search-category');

    let focusedIndex = -1;

    // Open Modal when clicking the search bar in the navbar
    if (searchBar) {
        searchBar.addEventListener('click', (e) => {
            e.preventDefault();
            openSearch();
        });
    }

    // Keyboard Shortcut (Ctrl + K or Cmd + K)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearch();
        }
        
        // Close on Escape
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            closeSearch();
        }
    });

    // Close modal functions
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

    // Real-time Filtering Logic
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

    // Keyboard Navigation (Up/Down/Enter)
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