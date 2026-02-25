// Format numbers with abbreviations (1000+ -> 1K+, 1000000+ -> 1M+)
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace('.0', '') + 'M+';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1).replace('.0', '') + 'K+';
    }
    return num.toString();
}

async function updateStat(API_URL, elementId, formatter) {
    try {
        const response = await fetch(API_URL, {
            method: 'GET'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const serverData = await response.json(); 
        let formattedValue = serverData.value;

        if (formatter) {
            formattedValue = formatter(serverData.value);
        }

        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = formattedValue;
        }
    } catch (error) {
        console.error('There was an error communicating with the server:', error);
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '-';
        }
    }
}

function fetchAllStats() {
    updateStat('http://localhost:5500/api/get-total-visits', 'visit-display', formatNumber);
    updateStat('http://localhost:5500/api/get-total-ccu', 'ccu-display', formatNumber);
}

// Fetch stats on initial page load
fetchAllStats();

// Fetch stats every 30 seconds
setInterval(fetchAllStats, 30000);