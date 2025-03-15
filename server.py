# Kevin Arista Solis (ka2902)

from flask import Flask
from flask import render_template
from flask import Response, request, jsonify
from urllib.parse import unquote
from db import data

app = Flask(__name__)


@app.route("/")
def home():
    return render_template(
        "home.html",
        data=sorted(data, key=lambda x: len(x["covers"]), reverse=True)[0:4],
    )


@app.route("/view/<id>")
def view_id(id=None):
    return render_template("view.html", data=[obj for obj in data if obj["id"] == id])


@app.route("/search", methods=["GET"])
def search_query():
    query = request.args.get("query-input", "")

    def appearsIn(sub, list):
        found = False
        if isinstance(list[0], str):
            for s in list:
                if sub in s.lower():
                    found = True
        elif isinstance(list[0], dict):
            for d in list:
                if sub in d["artist"].lower():
                    found = True
        return found

    results = [
        song
        for song in data
        if (
            ((query).lower()) in (song["title"].lower())
            or ((query).lower()) in (song["artist"].lower())
            or ((query).lower()) in (song["album"].lower())
            or appearsIn((query).lower(), song["genre"])
            or appearsIn((query).lower(), song["covers"])
        )
    ]
    return render_template(
        "results.html", query=query, results=results, count=len(results)
    )


@app.route("/add", methods=["GET", "POST"])
def create_cover():
    return render_template("add.html")


if __name__ == "__main__":
    app.run(debug=True, port=5001)
