// Function to load the TradingView chart with the selected symbol
function loadTradingViewChart(symbol) {
    new TradingView.widget({
        "width": "100%",
        "height": 400,
        "symbol": `NASDAQ:${symbol}`, // Use the passed symbol
        "interval": "D",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "3",
        "locale": "en",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "allow_symbol_change": true,
        "container_id": "tradingview-widget"
    });
}

// Event listener for when the DOM content is fully loaded
document.addEventListener("DOMContentLoaded", function() {
    // Load the default stock (Apple - AAPL) when the page first loads
    const defaultSymbol = "AAPL";
    loadTradingViewChart(defaultSymbol);

    // Add event listener to the select button
    document.getElementById("select-stock").addEventListener("click", function() {
        const selectedStock = document.getElementById("stock-dropdown").value; // Get the selected stock symbol

        // Fetch stock data from Flask
        fetch(`/get_stock_data/${selectedStock}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(stockData => {
                // Use stockData to update the UI or log it
                console.log(stockData);
                loadTradingViewChart(selectedStock);  
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    });
});


// Theme toggle functionality
const themeSwitch = document.getElementById('theme-switch');
const body = document.body;

themeSwitch.addEventListener('change', () => {
    if (themeSwitch.checked) {
        body.classList.add('light-theme');
    } else {
        body.classList.remove('light-theme');
    }
});

// Function to fetch market sentiment
function fetchMarketSentiment() {
    fetch('/get_market_sentiment')
        .then(response => response.json())
        .then(data => {
            const sentimentCircles = document.querySelectorAll('.sentiment-circle');
            sentimentCircles.forEach(circle => circle.classList.remove('active'));
            
            const activeCircle = document.querySelector(`.sentiment-circle.${data.sentiment}`);
            if (activeCircle) {
                activeCircle.classList.add('active');
            }
        })
        .catch(error => console.error('Error fetching market sentiment:', error));
}

// Fetch market sentiment every 5 minutes
fetchMarketSentiment();
setInterval(fetchMarketSentiment, 5 * 60 * 1000);

// ... (rest of the JavaScript code remains the same) ...