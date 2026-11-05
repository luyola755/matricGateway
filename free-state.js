// JavaScript for University Explorer Pages (Eastern Cape, Free State, etc.)

document.addEventListener('DOMContentLoaded', () => {
    // 1. Keyboard Shortcut for Search (Ctrl + K or Cmd + K)
    const searchInput = document.querySelector('.search-bar input');
    
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            if (searchInput) {
                searchInput.focus();
            }
        }
    });

    // 2. Filter Pills Logic
    const pills = document.querySelectorAll('.pill');
    
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            // Remove active class from all pills
            pills.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked pill
            pill.classList.add('active');
        });
    });

    // 3. Real-time search filtering
    const searchFilterInput = document.querySelector('.search-input-wrapper input');
    const uniCards = document.querySelectorAll('.uni-card');

    if (searchFilterInput) {
        searchFilterInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();

            uniCards.forEach(card => {
                const uniName = card.querySelector('h3').textContent.toLowerCase();
                const uniLocation = card.querySelector('.uni-location').textContent.toLowerCase();

                if (uniName.includes(searchTerm) || uniLocation.includes(searchTerm)) {
                    card.style.display = 'flex'; // Show card
                } else {
                    card.style.display = 'none'; // Hide card
                }
            });
        });
    }
});