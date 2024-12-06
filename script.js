document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "AIzaSyDO2YVW5g8XgDEnBCH1LEur7SOCAEr4rYk";

    // Pages
    const pages = {
        home: document.getElementById("home-page"),
        search: document.getElementById("search-page"),
        playlists: document.getElementById("playlists-page"),
    };

    // Playlist Array (Load from localStorage if available)
    let playlist = JSON.parse(localStorage.getItem("playlist")) || [];

    console.log("Loaded Playlist:", playlist); // Debugging: Check if playlist is loaded

    // Bottom Navigation Buttons
    const navBtns = document.querySelectorAll(".nav-btn");
    navBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            navBtns.forEach(nav => nav.classList.remove("active"));
            btn.classList.add("active");
            showPage(btn.id.replace("-btn", ""));
        });
    });

    // Fetch Trending Songs
    function fetchTrendingSongs() {
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&chart=mostPopular&regionCode=US&videoCategoryId=10&key=${apiKey}&maxResults=10`)
            .then(response => response.json())
            .then(data => {
                renderVideos(data.items, "trending-results");
            })
            .catch(error => console.error("Error fetching trending songs:", error));
    }

    // Search Functionality
    document.getElementById("execute-search-btn").addEventListener("click", () => {
        const query = document.getElementById("search-box").value.trim();
        if (!query) return alert("Please enter a search term!");

        fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=10`)
            .then(response => response.json())
            .then(data => {
                renderVideos(data.items, "search-results");
            })
            .catch(error => console.error("Error fetching search results:", error));
    });

    // Render Videos
    function renderVideos(videos, targetDivId) {
        const targetDiv = document.getElementById(targetDivId);
        targetDiv.innerHTML = "";

        videos.forEach(video => {
            const videoId = video.id.videoId || video.id;
            const title = video.snippet.title;

            const videoDiv = document.createElement("div");
            videoDiv.classList.add("video");
            videoDiv.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${videoId}" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                <h3>${title}</h3>
                <button class="add-to-playlist-btn" data-id="${videoId}" data-title="${title}">Add to Playlist</button>
                <button class="download-btn" data-id="${videoId}">Download</button>
            `;

            targetDiv.appendChild(videoDiv);
        });

        // Add Event Listeners for Buttons
        targetDiv.querySelectorAll(".add-to-playlist-btn").forEach(btn => {
            btn.addEventListener("click", addToPlaylist);
        });

        targetDiv.querySelectorAll(".download-btn").forEach(btn => {
            btn.addEventListener("click", downloadSong);
        });
    }

    // Add to Playlist
    function addToPlaylist(e) {
        const videoId = e.target.getAttribute("data-id");
        const title = e.target.getAttribute("data-title");

        if (!playlist.some(song => song.videoId === videoId)) {
            playlist.push({ videoId, title });
            updatePlaylist();
            alert(`"${title}" added to your playlist.`);
        } else {
            alert(`"${title}" is already in your playlist.`);
        }
    }

    // Update Playlist
    function updatePlaylist() {
        const playlistDiv = document.getElementById("playlist");
        playlistDiv.innerHTML = "";

        // Check if playlist has items
        if (playlist.length === 0) {
            playlistDiv.innerHTML = "<p>No songs in the playlist.</p>";
        }

        playlist.forEach(song => {
            const songDiv = document.createElement("div");
            songDiv.classList.add("video");
            songDiv.innerHTML = `
                <iframe src="https://www.youtube.com/embed/${song.videoId}" allow="autoplay; encrypted-media" allowfullscreen></iframe>
                <h3>${song.title}</h3>
            `;

            playlistDiv.appendChild(songDiv);
        });

        // Save playlist to localStorage
        localStorage.setItem("playlist", JSON.stringify(playlist));
    }

    // Download Song
    function downloadSong(e) {
        const videoId = e.target.getAttribute("data-id");
        const youtubeLink = `https://www.youtube.com/watch?v=${videoId}`;
        const downloadUrl = `https://yt1d.com/en12/q=${youtubeLink}`; // No encoding here

        window.open(downloadUrl, "_blank");
    }

    // Show Pages
    function showPage(page) {
        Object.keys(pages).forEach(p => pages[p].classList.add("hidden"));
        if (pages[page]) {
            pages[page].classList.remove("hidden");
        }

        const pageTitles = {
            home: "Shade Music",
            search: "Search Music",
            playlists: "Your Playlists",
        };
        document.getElementById("page-title").textContent = pageTitles[page] || "";
    }

    // Initialize
    fetchTrendingSongs();
    showPage("home");

    // Ensure playlist is rendered correctly on load
    updatePlaylist(); // Ensure playlist is displayed on page load
});
function renderPlaylist() {
    const playlistDiv = document.getElementById("playlist");
    playlistDiv.innerHTML = playlist.length
        ? playlist.map(song => `
            <div class="video">
                <img src="https://img.youtube.com/vi/${song.videoId}/default.jpg" alt="cover">
                <div>
                    <h4>${song.title}</h4>
                </div>
            </div>`).join('')
        : "<p>No songs in the playlist.</p>";

    localStorage.setItem("playlist", JSON.stringify(playlist));
}
