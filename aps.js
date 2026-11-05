// JavaScript for APS Calculator Page

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. APS CALCULATOR LOGIC ---
    const subjectsContainer = document.getElementById('subjects-container');
    const addSubjectBtn = document.getElementById('addSubjectBtn');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');
    const apsScoreDisplay = document.getElementById('apsScore');
    const resultMessage = document.getElementById('resultMessage');
    const ignoreLifeOrientation = document.getElementById('ignoreLifeOrientation');

    const defaultSubjects = [
        "Home Language",
        "First Additional Language",
        "Mathematics",
        "Life Orientation",
        "Subject 5"
    ];

    let subjectCount = 0;

    function createSubjectRow(placeholderName = "") {
        subjectCount++;
        const row = document.createElement('div');
        row.className = 'subject-row';
        
        row.innerHTML = `
            <input type="text" placeholder="${placeholderName || 'Subject ' + subjectCount}" value="${placeholderName}" class="subject-name">
            <input type="number" placeholder="0-100" min="0" max="100" class="subject-mark">
            <button class="delete-btn" title="Remove subject">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </button>
        `;

        const deleteBtn = row.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            row.remove();
        });

        subjectsContainer.appendChild(row);
    }

    defaultSubjects.forEach(subject => createSubjectRow(subject));

    addSubjectBtn.addEventListener('click', () => {
        createSubjectRow();
    });

    // --- RESET BUTTON (Clears Form + Deletes from Database) ---
    resetBtn.addEventListener('click', () => {
        subjectsContainer.innerHTML = '';
        subjectCount = 0;
        defaultSubjects.forEach(subject => createSubjectRow(subject));
        apsScoreDisplay.textContent = '--';
        resultMessage.textContent = 'Fill in your subjects and marks, then press "Calculate APS". You can change marks and recalculate anytime.';

        // NEW: Delete the saved APS score from the database
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            fetch('/api/delete-aps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail })
            }).catch(err => console.error("Error deleting APS:", err));
        }
    });

    function getPointsFromMark(mark) {
        if (mark >= 80) return 7;
        if (mark >= 70) return 6;
        if (mark >= 60) return 5;
        if (mark >= 50) return 4;
        if (mark >= 40) return 3;
        if (mark >= 30) return 2;
        return 1;
    }

    // --- CALCULATE BUTTON (Calculates + Saves to Database) ---
    calculateBtn.addEventListener('click', () => {
        const rows = document.querySelectorAll('.subject-row');
        let marksArray = [];
        let isValid = true;
        let errorMessage = '';

        rows.forEach((row, index) => {
            const nameInput = row.querySelector('.subject-name');
            const markInput = row.querySelector('.subject-mark');
            const subjectName = nameInput.value.trim().toLowerCase();
            const markValue = markInput.value.trim();

            if (subjectName === '' && markValue === '') return;

            if (markValue === '' || isNaN(markValue)) {
                isValid = false;
                errorMessage = `Please enter a valid mark for ${nameInput.value || 'Subject ' + (index + 1)}.`;
                return;
            }

            const markNum = parseFloat(markValue);
            if (markNum < 0 || markNum > 100) {
                isValid = false;
                errorMessage = `Mark for ${nameInput.value || 'Subject ' + (index + 1)} must be between 0 and 100.`;
                return;
            }

            const isLifeOrientation = subjectName.includes('life orientation') || subjectName.includes('life ori');
            const shouldIgnore = ignoreLifeOrientation.checked && isLifeOrientation;

            marksArray.push({
                name: nameInput.value || 'Subject ' + (index + 1),
                mark: markNum,
                points: getPointsFromMark(markNum),
                ignore: shouldIgnore
            });
        });

        if (!isValid) {
            resultMessage.textContent = errorMessage;
            apsScoreDisplay.textContent = '--';
            return;
        }

        const validSubjects = marksArray.filter(sub => !sub.ignore);

        if (validSubjects.length === 0) {
            resultMessage.textContent = "Please enter at least one subject mark to calculate your APS.";
            apsScoreDisplay.textContent = '--';
            return;
        }

        validSubjects.sort((a, b) => b.points - a.points);
        const bestSubjects = validSubjects.slice(0, 6);

        let totalAPS = 0;
        bestSubjects.forEach(sub => {
            totalAPS += sub.points;
        });

        apsScoreDisplay.textContent = totalAPS;
        
        if (validSubjects.length < 6) {
            resultMessage.textContent = `Calculated using ${validSubjects.length} subjects. Note: You need at least 6 subjects for a standard APS score.`;
        } else {
            resultMessage.textContent = `Calculated successfully using your best 6 subjects.`;
        }

        // NEW: Save the calculated APS to the database
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            fetch('/api/save-aps', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: userEmail, aps: totalAPS })
            })
            .then(res => res.json())
            .then(data => console.log("APS saved:", data))
            .catch(err => console.error("Error saving APS:", err));
        }
    });

    // --- 2. SEARCH MODAL LOGIC ---
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
        
        if (e.key === 'Escape' && searchModal && searchModal.classList.contains('active')) {
            closeSearch();
        }
    });

    if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeSearch);

    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) {
                closeSearch();
            }
        });
    }

    function openSearch() {
        if (!searchModal) return;
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
        if (!searchModal) return;
        searchModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (searchInput) {
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
    }

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