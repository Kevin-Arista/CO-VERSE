// Kevin Arista Solis (ka2902)
// import songCard from "./songCard.component.js";

$(document).ready(function () {
	function display_covers(data) {
		data.map((song, index) => {
			$(`<div class="card text-center main-card">
    <div class="card-header">
        <h3>
            ${song.title} 
        </h3>
        <h6>
            ${song.album} 
        </h6>
        <hr/>
        <iframe class="main-iframe-sp" src="${spotifyEmbed(song.audio)}"
            frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
        </iframe>
        <p>${song.genre.map((genre, idnex) => {
					return `<span> [${genre}] </span>`;
				})}</p>

    </div>
    <div class="card-body">
        <img class="card-image" src="${song.artist_picture}">
        <h4 class="card-title">${song.artist}</h4>
        <p class="card-text">${song.song_analysis}</p>
        <hr/>
        <h5>CO-VERSES</h5>
        ${song.covers.map((cover, index) => {
					return `
                                        <br/>
                                        <p>----------${
																					cover.artist
																				}-----------</p>
                                        <iframe class="main-frame-yt" src="${youtubeEmbed(
																					cover.audio
																				)}" 
                                            title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen>
                                        </iframe>
                                        <p>${cover.genre.map((genre, index) => {
																					return `
                                            <span> [${genre}] </span>
                                        `;
																				})}</p>
                                        `;
				})}
    <div class="card-footer text-muted">
        ${song.total_streams.toLocaleString()} streams on Spotify!
    </div>
</div>
`).appendTo($("#featured-list"));
		});
	}

	function display_results(data, count) {
		if (data.length === 0) {
			$(`<h2> No Results Found</h2>`).appendTo("#results-list");
		} else {
			data.map((song, index) => {
				if (index == 0) {
					count == 1
						? $(`<h2>${count} Result Found</h2>`).appendTo("#results-list")
						: $(`<h2>${count} Results Found</h2>`).appendTo("#results-list");
				}
				$(`
                <a href="/view/${song.id}"><p>${song.title}</p><a>
            `).appendTo("#results-list");
			});
		}
	}

	function display_featured(data) {
		if (data.length === 0) {
			$(`<h2>No Songs</h2>`).appendTo("#featured-list");
		} else {
			data.map((song, index) => {
				$(`
                <div id="${song.id}" class="album-sleeve ${
					parseInt(song.id) % 2 ? "skew-left" : "skew-right"
				} col-4">
					<img
						src="${song.album_cover}"
						alt="Album Cover" />
				</div>
            	`).appendTo(".album-shelf");
				if (index == 0) {
					setVinyl(song.id);
				}
			});
		}
	}
	function changeAlbumCover(song) {
		$("#vinyl-label").css({
			"background-image": `url('${song.album_cover}')`,
			"background-size": "cover",
			"background-position": "center",
			"background-repeat": "no-repeat",
			width: "60px",
			height: "60px",
			"border-radius": "50%",
		});
	}
	function spotifyEmbed(link) {
		return (
			link.substring(0, 24) +
			"/embed" +
			link.slice(24) +
			"/utm_source=generator"
		);
	}
	function youtubeEmbed(link) {
		return (
			link.substring(0, 8) +
			"www." +
			link.replace(".", "").substring(8, 15) +
			".com/embed" +
			link.slice(16)
		);
	}

	function search_request(user_input) {
		window.location.href = "/search/" + encodeURIComponent(user_input);
	}

	function valid(input) {
		if (input.length > 0 && input.trim().length == 0) {
			return -1;
		} else if (input == "") {
			return 0;
		} else {
			return 1;
		}
	}

	$("#target").on("submit", function (event) {
		event.preventDefault();
		input = $("#form-input").val();
		if (!valid(input)) {
			return;
		}
		search_request(input);
	});

	$("#form-input").keypress(function (event) {
		if (event.which === 13) {
			event.preventDefault();
			input = $("#form-input").val();
			if (!valid(input)) {
				return;
			} else if (valid(input) < 0) {
				$("#form-input").val("");
			} else {
				search_request(input);
			}
		}
	});

	page_id = $("body").attr("id");
	if (page_id == "view-page") {
		display_covers(data);
	} else if (page_id == "home-page") {
		display_featured(data);
	} else {
		display_results(data, count);
	}

	// Play Button
	$("#play").on("click", function () {
		let iframe = $("#spotifyPlayer")[0];
		let vinyl = $("#vinyl");
		iframe.contentWindow.focus();

		iframe.contentWindow.postMessage({ command: "play" }, "*");
		vinyl.css("animation", "spin 3s linear 10");
		$(this).addClass("active");
	});

	// Stop Button
	$("#stop").on("click", function () {
		let iframe = $("#spotifyPlayer")[0];
		let vinyl = $("#vinyl");

		iframe.contentWindow.postMessage({ command: "pause" }, "*");
		vinyl.css("animation", "none");
		$(this).removeClass("active");
	});
	$(".album-sleeve").on("click", function () {
		setVinyl($(this).attr("id"));
	});
	$(".album-sleeve").on("dblclick", function () {
		let albumId = $(this).attr("id");
		if (albumId) {
			window.location.href = `view/${albumId}`;
		} else {
			console.warn("Element does not have an ID!");
		}
	});

	function setVinyl(id) {
		song = data.filter((song) => song.id == id)[0];
		$("#lcd-title").html(song.title);
		$("#lcd-artist").html(song.artist);
		changeAlbumCover(song);
		$("#spotifyPlayer").attr("src", spotifyEmbed(song.audio));
		$("#info").attr("href", `/view/${song.id}`);
	}
});
