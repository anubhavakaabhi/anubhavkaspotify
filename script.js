// --- Spotify Clone JS (Vercel-ready) ---

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// 🎵 Format seconds -> MM:SS
function formatToMinutesSeconds(totalSeconds) {
  totalSeconds = Math.floor(totalSeconds);
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

// 🎧 Play a specific song
const playMusic = (track, pause = false) => {
  currentSong.src = `${currFolder}/${encodeURIComponent(track)}`;
  if (!pause) {
    currentSong.play();
    play.src = "pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// 🎵 Get songs for a selected album from songs.json
async function getSongs(folder) {
  currFolder = folder;
  const res = await fetch("songs/songs.json");
  const data = await res.json();

  const album = data.albums.find(a => `songs/${a.folder}` === folder);
  if (!album) {
    console.error("Album not found:", folder);
    return [];
  }

  songs = album.songs.map(song => `${folder}/${song}`);

  // Update the song list UI
  let songUL = document.querySelector(".songlist ul");
  songUL.innerHTML = "";

  for (const song of album.songs) {
    songUL.innerHTML += `
      <li>
        <img class="invert" src="music.svg" alt="music icon">
        <div class="info">
          <div>${song}</div>
          <div>Anubhav</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img class="invert" src="play.svg" alt="">
        </div>
      </li>`;
  }

  // Add click listeners to each song
  Array.from(songUL.getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", () => {
      playMusic(e.querySelector(".info div").innerText.trim());
    });
  });

  return songs;
}

// 🎵 Display all albums from songs.json
async function displayAlbums() {
  const res = await fetch("songs/songs.json");
  const data = await res.json();
  const cardContainer = document.querySelector(".cardContainer");
  cardContainer.innerHTML = "";

  data.albums.forEach(album => {
    cardContainer.innerHTML += `
      <div data-folder="songs/${album.folder}" class="card">
        <div class="play">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
            <path d="M64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576C178.6 576 64 461.4 64 320zM252.3 211.1C244.7 215.3 240 223.4 240 232L240 408C240 416.7 244.7 424.7 252.3 428.9C259.9 433.1 269.1 433 276.6 428.4L420.6 340.4C427.7 336 432.1 328.3 432.1 319.9C432.1 311.5 427.7 303.8 420.6 299.4L276.6 211.4C269.2 206.9 259.9 206.7 252.3 210.9z"/>
          </svg>
        </div>
        <img src="songs/${album.folder}/${album.cover}" alt="">
        <h2>${album.title}</h2>
        <p>${album.description}</p>
      </div>`;
  });

  // Add event listeners to album cards
  Array.from(document.getElementsByClassName("card")).forEach(card => {
    card.addEventListener("click", async e => {
      const folder = e.currentTarget.dataset.folder;
      songs = await getSongs(folder);
      if (songs.length > 0) {
        playMusic(songs[0].split("/").pop(), false);
      }
    });
  });
}

// 🎶 Initialize app
async function main() {
  const res = await fetch("songs/songs.json");
  const data = await res.json();

  // Load the first album by default
  const firstAlbum = data.albums[0];
  if (firstAlbum) {
    await getSongs(`songs/${firstAlbum.folder}`);
    playMusic(firstAlbum.songs[0], true);
  }

  // Display album cards
  displayAlbums();

  // --- Player Controls ---
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "pause.svg";
    } else {
      currentSong.pause();
      play.src = "play.svg";
    }
  });

  // Update progress bar and time
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
      `${formatToMinutesSeconds(currentSong.currentTime)} / ${formatToMinutesSeconds(currentSong.duration || 0)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration * 100) + "%";
  });

  // Seek bar click
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Sidebar open/close
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Helper to get current song index
  function getSongIndex() {
    let currentFile = decodeURIComponent(currentSong.src).split("/").pop();
    return songs.findIndex(s => decodeURIComponent(s).split("/").pop() === currentFile);
  }

  // Prev / Next controls
  prev.addEventListener("click", () => {
    let index = getSongIndex();
    if (index > 0) playMusic(songs[index - 1].split("/").pop());
  });

  next.addEventListener("click", () => {
    let index = getSongIndex();
    if (index + 1 < songs.length) playMusic(songs[index + 1].split("/").pop());
  });

  // Auto-play next song
  currentSong.addEventListener("ended", () => {
    let index = getSongIndex();
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1].split("/").pop());
    } else {
      playMusic(songs[0].split("/").pop()); // loop playlist
    }
  });
}

main();
