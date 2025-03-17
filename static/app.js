// Kevin Arista Solis (ka2902)
// import songCard from "./songCard.component.js";

$(document).ready(function () {
	function display_covers(data) {
		data.map((song) => {
			$(`<div class="card text-center main-card">
				<div class="card-header">
					<h3>${song.title}</h3>
					<h6>${song.album}</h6>
					<hr/>
					<iframe class="main-iframe-sp" src="${spotifyEmbed(song.audio)}"
						frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
					</iframe>
					<p>${song.genre.map((genre) => `<span> [${genre}] </span>`).join("")}</p>
				</div>
				<div class="card-body">
					<img class="card-image" src="${song.artist_picture}" alt="artist_picture">
					<h4 class="card-title">${song.artist}</h4>
					<p class="card-text">${song.song_analysis}</p>
					<hr/>
					<h5>CO-VERSES</h5>
					${song.covers
						.map(
							(cover) => `
						<br/>
						<p class="cover-artist">--- ${cover.artist} ---</p>
						<a href="${
							cover.audio
						}" class="cover-link" target="_blank">🎧 Listen to Cover</a>
						<p>${cover.genre.map((genre) => `<span> [${genre}] </span>`).join("")}</p>
					`
						)
						.join("")}
					<div class="card-footer text-muted">
						${song.total_streams.toLocaleString()} streams on Spotify!
					</div>
				</div>
			</div>`).appendTo($("#featured-list"));
		});
	}

	function display_results(data, count) {
		if (data.length === 0) {
			$(`<h2> No Results Found</h2>`).appendTo("#results-list");
		} else {
			data.map((song, index) => {
				if (index == 0) {
					count == 1
						? $(`<h2 class="align-left">${count} Result Found</h2>`).appendTo(
								"#results-list"
						  )
						: $(`<h2 class="align-left">${count} Results Found</h2>`).appendTo(
								"#results-list"
						  );
				}
				let coverList =
					song.covers.length > 0
						? song.covers
								.map(
									(cover, index) =>
										`<p><span class="cover-artist">${
											cover.artist
										}</span> - ${cover.genre.join(", ")}</p>`
								)
								.join("")
						: "<p>No covers available</p>";

				$(`
				<div class="result-item">
				<a href="/view/${song.id}">
				<div class="larger-vinyl-disc">
                                <div class="vinyl-label" style="background-image: url('${
																	song.album_cover
																}')"></div>
                            </div></a>
                            
                            <div class="song-details">
                                <h3>${song.title}</h3>
                                <p><b>Artist:</b> ${song.artist}</p>
                                <p><b>Genre:</b> ${song.genre.join(", ")}</p>
                                <div class="cover-section">
                                    <h4>Cover Versions:</h4>
                                    ${coverList}
                                </div>
                            </div>
                        </div>
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

	function load_dropdown(data) {
		$(` <label for="existingSong">Choose a Song:</label>
    			<select name="existingSong" id="existingSong">
				<option value="0">--Select Song--</option>
				${data
					.map((song, index) => {
						return `<option value="${song.id}">${song.title}[${song.album}] by ${song.artist}</option>`;
					})
					.join("")}
    			</select>`).prependTo("#addForm");
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

	function valid(input) {
		let trimmedInput = input.trim();
		if (trimmedInput.length === 0) {
			return false; // Invalid: Empty or only spaces
		}
		return true; // Valid: Has meaningful content
	}

	$("#searchForm").submit(function (event) {
		let query = $("#query-input").val();
		if (valid(query)) {
			$("#error-message").hide();
		} else {
			event.preventDefault(); // Stop form submission
			$("#error-message").text("Invalid.").show();
			$("#query-input").val();
		}
	});

	$("#query-input").keypress(function (event) {
		let query = $("#query-input").val();
		if (event.which === 13) {
			if (valid(query)) {
				$("#error-message").hide();
			} else {
				event.preventDefault(); // Stop form submission
				$("#error-message").text("Invalid.").show();
				$("#query-input").val("");
			}
		}
	});

	page_id = $("body").attr("id");
	if (page_id == "view-page") {
		display_covers(data);
	} else if (page_id == "home-page") {
		display_featured(data);
	} else if (page_id == "results-page") {
		display_results(data, count);
	} else {
		load_dropdown(data);
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
		let songId = $(this).attr("id");
		if (songId) {
			window.location.href = `view/${songId}`;
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
