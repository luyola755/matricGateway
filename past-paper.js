// --- 4. DOWNLOAD TRACKING FUNCTION (GLOBAL) ---
function saveDownload(card, url, btn) {
    const email = localStorage.getItem('userEmail');
    if (!email) {
        console.log("No user logged in. Skipping save.");
        return;
    }

    if (!card) {
        console.log("Could not find the paper card.");
        return;
    }

    // Get the paper details from the card
    const subjectEl = card.querySelector('.paper-info h3');
    const infoEl = card.querySelector('.paper-info p');
    
    if (!subjectEl || !infoEl) return;

    const subject = subjectEl.innerText.trim();
    const info = infoEl.innerText.trim(); // e.g., "2023 · Paper 1"
    const type = btn.innerText.trim();    // "Paper" or "Memo"
    const fullName = `${subject} - ${info} (${type})`;

    console.log("Tracking download:", fullName, "->", url);

    fetch('/api/save-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: email, 
            paper_name: fullName, 
            paper_url: url 
        })
    })
    .then(res => res.json())
    .then(data => console.log("Saved to database:", data))
    .catch(err => console.error("Error saving download:", err));
}