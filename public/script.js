document.getElementById('flightForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const flightNumber = document.getElementById('flightNumber').value.trim();
    if (!flightNumber) return;

    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const errorMessage = document.getElementById('errorMessage');
    const errorText = document.getElementById('errorText');

    // UI Reset
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-70');
    results.classList.add('hidden');
    errorMessage.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        const response = await fetch('/api/flights/calculate-departure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flightNumber })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'שגיאה בשליפת הנתונים');
        }

        // Format Date
        const etaDate = data.flight.eta ? new Date(data.flight.eta) : null;
        const formattedEta = etaDate 
            ? etaDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' }) + ' (' + etaDate.toLocaleDateString('he-IL') + ')'
            : 'לא ידוע';

        // Update UI
        document.getElementById('resAirline').textContent = data.flight.airline || 'לא ידוע';
        document.getElementById('resFlightNum').textContent = data.flight.flightNumber || flightNumber;
        document.getElementById('resStatus').textContent = (data.flight.status || 'לא ידוע').toUpperCase();
        document.getElementById('resEta').textContent = formattedEta;
        
        const terminal = data.flight.arrivalTerminal || '?';
        const gate = data.flight.arrivalGate || '?';
        document.getElementById('resGate').textContent = `טרמינל ${terminal} | שער ${gate}`;

        // Show results
        loading.classList.add('hidden');
        results.classList.remove('hidden');

    } catch (error) {
        loading.classList.add('hidden');
        errorText.textContent = error.message;
        errorMessage.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('opacity-70');
    }
});
