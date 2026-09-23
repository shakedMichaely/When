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

        const depScheduledDate = data.flight.departureScheduled ? new Date(data.flight.departureScheduled) : null;
        let depActualDate = data.flight.departureActual ? new Date(data.flight.departureActual) : null;
        const depEstimatedDate = data.flight.departureEstimated ? new Date(data.flight.departureEstimated) : null;
        
        let formattedDepText = 'לא ידוע';
        let isEstimated = false;

        if (depScheduledDate) {
            formattedDepText = depScheduledDate.toLocaleTimeString('he-IL', formatOptions);
            
            // If actual isn't available but there's an estimated time, use estimated
            let displayDate = depActualDate;
            if (!displayDate && depEstimatedDate) {
                displayDate = depEstimatedDate;
                isEstimated = true;
            }

            if (displayDate) {
                const actualTimeStr = displayDate.toLocaleTimeString('he-IL', formatOptions);
                const delayMs = displayDate - depScheduledDate;
                if (delayMs > 0 || actualTimeStr !== formattedDepText) {
                    const label = isEstimated ? 'משוער' : 'בפועל';
                    formattedDepText += ` (${label}: ${actualTimeStr})`;
                }
            }
        }

        // Calculate Duration (if possible)
        let durationStr = '--';
        if (etaDate && data.flight.departureScheduled) {
            const depDate = depActualDate || depEstimatedDate || new Date(data.flight.departureScheduled);
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

        // Translate Status
        const statusMap = {
            'scheduled': 'מתוכננת',
            'active': 'באוויר',
            'landed': 'נחתה',
            'cancelled': 'בוטלה',
            'incident': 'תקרית',
            'diverted': 'הוסטה'
        };
        const rawStatus = (data.flight.status || '').toLowerCase();
        document.getElementById('resStatus').textContent = statusMap[rawStatus] || rawStatus.toUpperCase();
        
        // Calculate True Delays from Timestamps
        let calcDepDelay = 0;
        let calcArrDelay = 0;

        const activeDate = depActualDate || depEstimatedDate;
        if (depScheduledDate && activeDate) {
            calcDepDelay = Math.max(0, Math.round((activeDate - depScheduledDate) / 60000));
        }

        const arrScheduledDate = data.flight.eta ? new Date(data.flight.eta) : null; // Wait, we only passed ETA. We need both.
        // Let's just calculate departure delay based on displayDate, and ignore the buggy raw API delay fields.
        
        let delayText = 'אין עיכוב';
        if (calcDepDelay > 0) {
            delayText = `עיכוב: ${calcDepDelay} דק'`;
        }
        document.getElementById('resDelay').textContent = delayText;
        
        const isLanded = rawStatus === 'landed';
        const isActive = rawStatus === 'active';
        const didTakeoff = !!data.flight.departureActual || isLanded || isActive;
        document.getElementById('resDidTakeoff').textContent = didTakeoff ? 'כן 🛫' : 'לא';
        document.getElementById('resDeparture').textContent = formattedDepText;
        
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
