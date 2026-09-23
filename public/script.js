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

        // Format Dates (Force Israel Timezone)
        const formatOptions = { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit' };
        
        const etaDate = data.flight.eta ? new Date(data.flight.eta) : null;
        const formattedEta = etaDate 
            ? etaDate.toLocaleTimeString('he-IL', formatOptions) + ' (' + etaDate.toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem' }) + ')'
            : 'לא ידוע';

        const depActualDate = data.flight.departureActual ? new Date(data.flight.departureActual) : null;
        const formattedDepActual = depActualDate 
            ? depActualDate.toLocaleTimeString('he-IL', formatOptions)
            : 'טרם המריאה';

        // Calculate Duration (if possible)
        let durationStr = '--';
        if (etaDate && data.flight.departureScheduled) {
            const depDate = depActualDate || new Date(data.flight.departureScheduled);
            const diffMs = etaDate - depDate;
            if (diffMs > 0) {
                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                durationStr = `${hours}h ${minutes}m`;
            }
        }

        // Update UI
        document.getElementById('resOriginIata').textContent = data.flight.originIata || 'N/A';
        document.getElementById('resOrigin').textContent = data.flight.origin || 'N/A';
        document.getElementById('resDestIata').textContent = data.flight.destinationIata || 'N/A';
        document.getElementById('resDest').textContent = data.flight.destination || 'N/A';
        document.getElementById('resDuration').textContent = durationStr;

        document.getElementById('resStatus').textContent = (data.flight.status || 'לא ידוע').toUpperCase();
        
        const didTakeoff = !!data.flight.departureActual;
        document.getElementById('resDidTakeoff').textContent = didTakeoff ? 'כן 🛫' : 'לא';
        document.getElementById('resDeparture').textContent = formattedDepActual;
        
        document.getElementById('resEta').textContent = formattedEta;
        document.getElementById('resAirline').textContent = `${data.flight.airline || 'לא ידוע'} (${data.flight.flightNumber || flightNumber})`;
        
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
