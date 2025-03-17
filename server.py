# Kevin Arista Solis (ka2902)

from flask import Flask
from flask import render_template
from flask import Response, request, jsonify
from urllib.parse import unquote
import json

app = Flask(__name__)


@app.route("/")
def home():
    with open("db.json", "r") as file:
        data = json.load(file)
        return render_template(
            "home.html",
            data=sorted(data, key=lambda x: len(x["covers"]), reverse=True)[0:4],
        )


@app.route("/view/<id>")
def view_id(id=None):
    with open("db.json", "r") as file:
        data = json.load(file)
        return render_template(
            "view.html", data=[obj for obj in data if obj["id"] == id]
        )


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

    results = []
    with open("db.json", "r") as file:
        data = json.load(file)
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
    if request.method == "POST":
        data = []
        with open("db.json", "r") as file:
            data = json.load(file)

        if request.form.get("existingSong", "0") != "0":
            print(request.form.get("existingSong", "0"))
            song = modSong = [
                song for song in data if song["id"] == request.form.get("existingSong")
            ][0]
            cover_artist = request.form.get("cover_artist", "")
            cover_genre = (request.form.get("cover_genre", "")).split(",")
            cover_audio = request.form.get("cover_audio", "")
            cover = {
                "id": len(song["covers"]) + 1,
                "artist": cover_artist,
                "genre": cover_genre,
                "audio": cover_audio,
            }
            modSong["covers"].append(cover)
            data[data.index(song)] = modSong
            with open("db.json", "w") as file:
                json.dump(data, file, indent=4)

        else:
            print("new entry!")
            title = request.form.get("title", "")
            album = request.form.get("album", "")
            album_cover = request.form.get("album_cover", "")
            artist = request.form.get("artist", "")
            # list
            genres = (request.form.get("genre", "")).split(",")
            artist_picture = request.form.get("artist_picture", "")
            audio = request.form.get("audio", "")
            song_analysis = request.form.get("song_analysis", "")
            # int
            total_streams = int(request.form.get("total_streams", 0))
            # compile into dictionary
            cover_artist = request.form.get("cover_artist", "")
            cover_genre = (request.form.get("cover_genre", "")).split(",")
            cover_audio = request.form.get("cover_audio", "")
            cover = {
                "id": 1,
                "artist": cover_artist,
                "genre": cover_genre,
                "audio": cover_audio,
            }
            data.append(
                {
                    "id": len(data),
                    "title": title,
                    "album": album,
                    "album_cover": album_cover,
                    "artist": artist,
                    "genre": genres,
                    "artist_picture": artist_picture,
                    "audio": audio,
                    "song_analysis": song_analysis,
                    "total_streams": total_streams,
                    "covers": cover,
                }
            )
            with open("db.json", "w") as file:
                json.dump(data, file, indent=4)

        return render_template("add.html", data=data)

    else:
        with open("db.json", "r") as file:
            data = json.load(file)
            return render_template("add.html", data=data)


if __name__ == "__main__":
    app.run(debug=True, port=5001)
