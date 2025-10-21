// generateSongsJSON.js - CommonJS version
const fs = require("fs");
const path = require("path");

const songsRoot = path.join(process.cwd(), "songs");

function generateSongsJSON() {
  const albums = [];

  const folders = fs.readdirSync(songsRoot, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  folders.forEach(folder => {
    const folderPath = path.join(songsRoot, folder);
    const files = fs.readdirSync(folderPath);

    const mp3Files = files.filter(f => f.toLowerCase().endsWith(".mp3"));
    const cover = files.find(f => f.toLowerCase().startsWith("cover")) || "";
    const infoPath = path.join(folderPath, "info.json");

    let title = folder;
    let description = "No description available";

    if (fs.existsSync(infoPath)) {
      try {
        const info = JSON.parse(fs.readFileSync(infoPath, "utf8"));
        title = info.title || title;
        description = info.description || description;
      } catch (err) {
        console.warn(`⚠️ Couldn't read info.json for ${folder}:`, err);
      }
    }

    albums.push({
      folder,
      title,
      description,
      cover,
      songs: mp3Files
    });
  });

  const output = { albums };
  const outputPath = path.join(songsRoot, "songs.json");
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`✅ songs.json updated! Found ${albums.length} albums.`);
}

generateSongsJSON();
