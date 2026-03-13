import requests
import os
from flask import Flask, jsonify
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("TMDB_API_KEY")

@app.route("/popular")
def popular_movies():
    url = f"https://api.themoviedb.org/3/movie/popular?api_key={API_KEY}"
    data = requests.get(url).json()
    return jsonify(data["results"])

if __name__ == "__main__":
    app.run(debug=True)