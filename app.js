const fs = require("fs");
const os = require("os");
const path = require("path");
// 계획
// 1. 사용자가 원하는 폴더의 이름을 받아온다

// console.log(process.argv); // 원하는 인자를 받아올 때
const folder = process.argv[2]; // 작업하고자 하는 폴더
const workingDir = path.join(os.homedir(), "ellie", folder); // 현재 운영체제에 있는 homedir에다가 우리가 원하는 'Pictures'라는 폴더 안에 사용자가 원하는 폴더에서 작업
if (!folder || !fs.existsSync(workingDir)) {
  // 폴더가 존재하지 않거나 존재하지 않는 경로라면
  console.error("Please enter folder name in Pictures");
  return;
}

// 2. 그 폴더안에 video, captured, duplicated 폴더를 만든다.
const videoDir = path.join(workingDir, "video");
const capturedDir = path.join(workingDir, "captured");
const duplicatedDir = path.join(workingDir, "duplicated");

!fs.existsSync(videoDir) && fs.mkdirSync(videoDir); // 경로가 존재하지 않는다면 만들고, 존재한다면 무시하고 다음으로
!fs.existsSync(capturedDir) && fs.mkdirSync(capturedDir);
!fs.existsSync(duplicatedDir) && fs.mkdirSync(duplicatedDir);

// 3. 폴더안에 있는 파일들을 다 돌면서 해당하는 mp4\mov, pgn\aee, IMG_1234 (IMG_E1234)

// promises로 경로의 모든 파일들을 다 읽어오고 출력.
fs.promises
  .readdir(workingDir) //
  .then(
    processFiles /** == files => processFiles(files), 전달하는 인자와 호출하는 인자가 동일하다면 생략 가능!*/
  )
  .catch(console.log);

function processFiles(files) {
  files.forEach((file) => {
    // files에서 forEach를 통해 뱅글뱅글 돌면서 찾기
    if (isVideoFile(file)) {
      // console.log("video", file);
      move(file, videoDir);
    } else if (isCapturedFile(file)) {
      // console.log("captured", file);
      move(file, capturedDir);
    } else if (isDuplicatedFile(files, file)) {
      // console.log("duplicated", file);
      move(file, duplicatedDir);
    }
  });
}

// 있는지 없는지 검사!

function isVideoFile(file) {
  const regExp = /(mp4|mov)$/gm; // 정규 표현식: 파일의 끝나는 부분이 mp4거나 mov로 끝난다면 video file이다.
  const match = file.match(regExp); // 맞는게 있다면 match에 결과값이 들어온다.
  // console.log(match);
  return !!match; // match의 결과값이 있다면 true
}
function isCapturedFile(file) {
  const regExp = /(png|aae)$/gm;
  const match = file.match(regExp);
  return !!match;
}
function isDuplicatedFile(files, file) {
  // 전체적인 파일 리스트를 받아와야한다.
  // IMG_XXXX가 있다면 동일한 이름인데 IMG_EXXX로 수정된 버전이 있는지 검사를 해야한다.
  if (!file.startsWith("IMG_") || file.startsWith("IMG_E")) {
    // 파일이 IMG_로 시작하지 않는 파일이거나 수정된 버전이라면 검사하지 않아도 된다.
    return false;
  }

  const edited = `IMG_E${file.split("_")[1]}`; // 수정된 버전은 원본으로 받은 이름에 E가 추가되면서 split을 이용해 구분자로 나누고 두 번째 것을 받아온다.
  const found = files.find((f) => f.includes(edited)); // 이름이 files안에 있는지 없는지 검사한다.
  return !!found; // 검사한게 있다면 true
}

// 해당하는 파일을 받고 원하는 targetDir을 받아서 실행

function move(file, targetDir) {
  console.info(`move ${file} to ${path.basename(targetDir)}`); // 그냥하면 어떤 일이 일어났는지 알 수 없으니까 로그를 출력. 그냥 targetDir하면 경로가 다 나와버리니 마지막것만 출력할 수 있도록 basename을 써줌
  const oldPath = path.join(workingDir, file);
  const newPath = path.join(targetDir, file);
  fs.promises
    .rename(oldPath, newPath) // 옮기는 것
    .catch(console.error); // 에러 발생하면 로그
}

/**
 * 디버깅을 하시고 싶으시다면!
 * 🐛인자를 전달해야 하는 경우 아래와 같이 .vscode/launch.json 파일을 설정해 보세요:
 * (디버깅 챕터에서 파일 설정하는법 다뤘었죠?)
 * "program": "${workspaceFolder}/5-project-photo/photo.js",    // 여러분 경로대로 바꿔주세요
 * "args": ["test"],    // 테스트 하고자 하는 폴더 이름
 * "restart": true,
 * "runtimeExecutable": "node"
 * 실행 nodemon app test
 *
 *
 * 저나 사용자(개발자)를 믿지 않는다.
 * 사용자로부터 입력받는 데이터에 대해 모두 검증을 한다.
 * 폴더 만들기는 경로를 만들고 실제 폴더와 시스템을 연결하기 위해 mkdirsync를 사용하여 만든ㄷ다. 폴더가 이미 존재하면 실행하지 않음으로  명제1(존재하지않으면) && 명제2(만든다)
 * readdir로 읽어온 후 if else if 문으로 전체적인 구조를 잡는다.
 * 확장자는 정규표현식으로
 * !!값= true, !!null=false 문법을 통해, 값에 의존적인 불리언 값을 편하게 만들어 리턴한다.
 * duplicated할 때, 시간을 줄이기 위해 복잡한 계산전에 한번 필터로 거른다.
 * 파일 옮기는 것은 fs.promises.rename을 사용한다.
 *
 *
 * 드림코딩 정규표현식 유뷰브 영상: https://youtu.be/t3M6toIflyQ
 */
