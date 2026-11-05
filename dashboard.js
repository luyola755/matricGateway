document.addEventListener('DOMContentLoaded', () => {
    const userEmail = localStorage.getItem('userEmail');
    const userName = localStorage.getItem('userName');
    
    if (!userEmail) {
        window.location.href = '/';
        return;
    }

    if (userName) {
        document.getElementById('userNameDisplay').innerText = userName.split(' ')[0];
    }

    // Fetch APS
    fetch(`/api/get-aps/${userEmail}`)
        .then(res => res.json())
        .then(data => {
            const apsDisplay = document.getElementById('dashboardAps');
            apsDisplay.innerText = (data.aps > 0) ? data.aps : '--';
        })
        .catch(err => console.error("Error loading APS:", err));

    // Fetch Downloads
    fetch(`/api/get-downloads/${userEmail}`)
        .then(res => res.json())
        .then(downloads => {
            const listContainer = document.getElementById('downloadsList');
            if (downloads.length === 0) {
                listContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">You haven\'t downloaded any papers yet.</p>';
                return;
            }

            listContainer.innerHTML = '';
            downloads.forEach(item => {
                const row = document.createElement('div');
                row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 10px; border: 1px solid var(--border-color); border-radius: 8px; background-color: var(--bg-light);';
                row.innerHTML = `
                    <a href="${item.url}" target="_blank" style="font-weight: 600; color: var(--primary-blue); text-decoration: none; flex-grow: 1;">${item.name}</a>
                    <button onclick="deleteDownload(${item.id}, this)" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 4px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>
                `;
                listContainer.appendChild(row);
            });
        })
        .catch(err => console.error("Error loading downloads:", err));

    window.deleteDownload = (id, btn) => {
        if (confirm("Remove this from your recent downloads?")) {
            fetch(`/api/delete-download/${id}`, { method: 'DELETE' })
                .then(res => { if (res.ok) btn.parentElement.remove(); });
        }
    };
});