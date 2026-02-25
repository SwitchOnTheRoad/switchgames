function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M+';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K+';
    }
    return num.toString();
}

async function updateStat(API_URL, elementId, formatter) {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
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
        console.error('Error:', error);
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = '-';
        }
    }
}

function fetchAllStats() {
    updateStat('/api/get-total-visits', 'visit-display', formatNumber);
    updateStat('/api/get-total-ccu', 'ccu-display', formatNumber);
}

fetchAllStats();
setInterval(fetchAllStats, 30000);