const path = require("path");
const fs = require("fs");

const dirName = path.dirname("C:\\Users\\배준영\\pictures\\test\\randome.aee"); // dir

console.log("Processing in %s....", dirName);

function makeFolder(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function moveFile(file, folder) {
  fs.rename(
    dirName + "/" + file,
    dirName + "/" + folder + "/" + file,
    (err) => {
      if (err) throw err;
      console.log("move " + file + " to " + folder);
    }
  );
}

fs.readdir(dirName, (error, filelist) => {
  filelist.forEach((file) => {
    if (path.extname(file) == ".mp4" || path.extname(file) == ".mov") {
      makeFolder(dirName + "/video");
      moveFile(file, "video");
    } else if (path.extname(file) == ".png" || path.extname(file) == ".aae") {
      makeFolder(dirName + "/captured");
      moveFile(file, "captured");
    } else if (file.includes("E")) {
      makeFolder(dirName + "/duplicated");
      moveFile(file, "duplicated");
    }
  });
});
