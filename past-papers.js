// JavaScript for Past Papers Page

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. LOCAL FILTER & SEARCH LOGIC (For the Paper Cards) ---
    const filterSubject = document.getElementById('filterSubject');
    const filterYear = document.getElementById('filterYear');
    const filterType = document.getElementById('filterType');
    const localSearchInput = document.getElementById('localSearchInput');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const papersGrid = document.getElementById('papersGrid');
    const paperCards = document.querySelectorAll('.paper-card');
    const resultsCount = document.getElementById('resultsCount');
    const emptyState = document.getElementById('emptyState');
    const viewAllBtn = document.getElementById('viewAllBtn');

    let showingAll = false; 

    function filterPapers() {
        const subjectVal = filterSubject.value.toLowerCase();
        const yearVal = filterYear.value.toLowerCase();
        const typeVal = filterType.value.toLowerCase();
        const searchVal = localSearchInput.value.toLowerCase();
        
        let visibleCount = 0;
        let totalMatchCount = 0;

        paperCards.forEach(card => {
            const cardSubject = card.getAttribute('data-subject').toLowerCase();
            const cardYear = card.getAttribute('data-year').toLowerCase();
            const cardType = card.getAttribute('data-type').toLowerCase();
            const cardTitle = card.getAttribute('data-title').toLowerCase();

            const matchSubject = (subjectVal === 'all' || cardSubject === subjectVal);
            const matchYear = (yearVal === 'all' || cardYear === yearVal);
            const matchType = (typeVal === 'all' || cardType === typeVal);
            const matchSearch = (searchVal === '' || cardTitle.includes(searchVal));

            if (matchSubject && matchYear && matchType && matchSearch) {
                totalMatchCount++;
                
                if (showingAll || totalMatchCount <= 6) {
                    card.style.display = 'flex';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            } else {
                card.style.display = 'none';
            }
        });

        if (totalMatchCount <= 6) {
            resultsCount.textContent = `${totalMatchCount} paper${totalMatchCount !== 1 ? 's' : ''}`;
            viewAllBtn.style.display = 'none';
        } else {
            if (showingAll) {
                resultsCount.textContent = `Showing all ${totalMatchCount} papers`;
                viewAllBtn.innerHTML = 'Show less <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>';
                viewAllBtn.style.display = 'flex';
            } else {
                resultsCount.textContent = `Showing 6 of ${totalMatchCount} papers`;
                viewAllBtn.innerHTML = 'View all <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
                viewAllBtn.style.display = 'flex';
            }
        }

        if (totalMatchCount === 0) {
            emptyState.style.display = 'flex';
            papersGrid.style.display = 'none';
            resultsCount.textContent = '0 papers';
            viewAllBtn.style.display = 'none';
        } else {
            emptyState.style.display = 'none';
            papersGrid.style.display = 'grid';
        }
    }

    if (filterSubject) filterSubject.addEventListener('change', () => { showingAll = false; filterPapers(); });
    if (filterYear) filterYear.addEventListener('change', () => { showingAll = false; filterPapers(); });
    if (filterType) filterType.addEventListener('change', () => { showingAll = false; filterPapers(); });
    if (localSearchInput) localSearchInput.addEventListener('input', () => { showingAll = false; filterPapers(); });

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            filterSubject.value = 'all';
            filterYear.value = 'all';
            filterType.value = 'all';
            localSearchInput.value = '';
            showingAll = false;
            filterPapers();
        });
    }

    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showingAll = !showingAll; 
            filterPapers();
        });
    }

    filterPapers();


    // --- 2. ALTERNATIVE GLOBAL SEARCH MODAL LOGIC (For the Navbar Button) ---
    const navSearchBar = document.getElementById('navSearchBar');
    const searchModal = document.getElementById('searchModal');
    const globalSearchInput = document.getElementById('globalSearchInput');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    const searchResultItems = document.querySelectorAll('.search-result-item');
    const searchCategories = document.querySelectorAll('.search-category');

    // Open Modal
    if (navSearchBar) {
        navSearchBar.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    }

    // Keyboard shortcut (Ctrl+K or Cmd+K)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openModal();
        }
        if (e.key === 'Escape' && searchModal && searchModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Close Modal
    if (closeSearchBtn) {
        closeSearchBtn.addEventListener('click', closeModal);
    }

    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) closeModal();
        });
    }

    function openModal() {
        if (!searchModal) return;
        searchModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            if (globalSearchInput) {
                globalSearchInput.focus();
                globalSearchInput.value = '';
            }
            resetSearch();
        }, 50);
    }

    function closeModal() {
        if (!searchModal) return;
        searchModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Filter logic inside the modal
    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();

            searchCategories.forEach(category => {
                let hasVisible = false;
                const items = category.querySelectorAll('.search-result-item');

                items.forEach(item => {
                    const text = item.textContent.toLowerCase();
                    const title = item.getAttribute('data-title') || '';

                    if (text.includes(term) || title.includes(term)) {
                        item.style.display = 'flex';
                        hasVisible = true;
                    } else {
                        item.style.display = 'none';
                    }
                });

                if (hasVisible) {
                    category.classList.remove('hidden');
                } else {
                    category.classList.add('hidden');
                }
            });
        });
    }

    function resetSearch() {
        searchResultItems.forEach(item => item.style.display = 'flex');
        searchCategories.forEach(cat => cat.classList.remove('hidden'));
    }


    // --- 3. DOWNLOAD TRACKING LOGIC (NEW) ---
    const userEmail = localStorage.getItem('userEmail');
    
    // Only track if user is logged in
    if (userEmail) {
        document.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', function() {
                // Get the paper details from the card
                const card = this.closest('.paper-card');
                if (!card) return; // Safety check

                const subjectEl = card.querySelector('.paper-info h3');
                const infoEl = card.querySelector('.paper-info p');
                
                if (!subjectEl || !infoEl) return;

                const subject = subjectEl.innerText;
                const info = infoEl.innerText; // e.g., "2023 · Paper 1"
                const type = this.innerText.trim(); // "Paper" or "Memo"
                const fullName = `${subject} - ${info} (${type})`;
                const url = this.getAttribute('href');

                // Send to backend to save in database
                fetch('/api/save-download', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        email: userEmail, 
                        paper_name: fullName, 
                        paper_url: url 
                    })
                })
                .then(res => {
                    if (res.ok) console.log("Download tracked successfully");
                })
                .catch(err => console.error("Error tracking download:", err));
            });
        });
    }
});