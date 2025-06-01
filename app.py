from flask import Flask, render_template, redirect, url_for, jsonify
import requests
from bs4 import BeautifulSoup
from textblob import TextBlob
import concurrent.futures

app = Flask(__name__)
app.config["DEBUG"] = True

ALPHA_VANTAGE_API_KEY = "XRFYD53Y0DV2C7K4"

def get_news_sentiment(url):
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        paragraphs = soup.find_all('p')
        text = ' '.join([p.get_text() for p in paragraphs])
        
        blob = TextBlob(text)
        return blob.sentiment.polarity
    except:
        return 0

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/get_stock_data/<symbol>")
def get_stock_data(symbol):
    url = f"https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={ALPHA_VANTAGE_API_KEY}"
    response = requests.get(url)
    data = response.json()

    if "Global Quote" not in data:
        return jsonify({"error": "Unable to fetch stock data"}), 400

    quote = data["Global Quote"]
    
    stock_data = {
        "open": quote.get("02. open", "N/A"),
        "close": quote.get("05. price", "N/A"),
        "high": quote.get("03. high", "N/A"),
        "low": quote.get("04. low", "N/A")
    }

    return jsonify(stock_data)

@app.route("/get_market_sentiment")
def get_market_sentiment():
    news_sites = [
        "https://www.cnbc.com/world-markets/",
        "https://www.reuters.com/markets/",
        "https://www.bloomberg.com/markets",
        "https://www.ft.com/markets",
        "https://www.wsj.com/news/markets"
    ]

    with concurrent.futures.ThreadPoolExecutor() as executor:
        sentiments = list(executor.map(get_news_sentiment, news_sites))

    avg_sentiment = sum(sentiments) / len(sentiments)

    if avg_sentiment > 0.05:
        return jsonify({"sentiment": "bullish"})
    elif avg_sentiment < -0.05:
        return jsonify({"sentiment": "bearish"})
    else:
        return jsonify({"sentiment": "neutral"})

if __name__ == "__main__":
    app.run(debug=True)