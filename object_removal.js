const canvas = document.querySelector("#canvasImage");
const ctx = canvas.getContext("2d");
const canvas_mask = document.querySelector("#canvasMask");
const ctx_mask = canvas_mask.getContext("2d");
const inputImgElement = document.getElementById("inputImageSrc");
const inputFileElement = document.getElementById("fileInput");
const outputImgElement = document.getElementById("outputImageSrc");
const outputFileElement = document.getElementById("fileOutput");
const content = document.getElementsByClassName("content")[0];
const canvasImage = document.getElementById("canvasImage");
const canvasMask = document.getElementById("canvasMask");
const exportBtn = document.getElementById("exportBtn");
let penWidth = 30;

init();

function init() {
  content.hidden = true;
  canvasImage.hidden = true;
  canvasMask.hidden = true;
  initInputCanvas();
  initOutputCanvas();
  initDrawingTool();
  bindKeyEvent();
}

function bindKeyEvent() {
  $(document).keydown(function(e) {
    hideMask();
  });
  $(document).keyup(function(e) {
    showMask();
  });

  function hideMask() {
    canvas_mask.style.opacity = "0.1";
  }

  function showMask() {
    canvas_mask.style.opacity = "1";
  }
}

function initInputCanvas() {
  inputFileElement.addEventListener(
    "change",
    e => {
      inputImgElement.src = URL.createObjectURL(e.target.files[0]);
    },
    false
  );
  inputImgElement.onload = function() {
    let mat = cv.imread(inputImgElement);
    cv.imshow("canvasImage", mat);
    // let dst = new cv.Mat();
    // cv.cvtColor(mat, dst, cv.COLOR_RGBA2GRAY);
    // cv.imshow("canvasImage", dst);
    mat.delete();
    canvasImage.hidden = false;
  };
}

function initOutputCanvas() {
  outputFileElement.addEventListener(
    "change",
    e => {
      outputImgElement.src = URL.createObjectURL(e.target.files[0]);
    },
    false
  );
  outputImgElement.onload = function() {
    let mat = cv.imread(outputImgElement);
    cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);
    // cv.cvtColor(mat, mat, CV_BGRA2BGR);
    cv.imshow("canvasMask", mat);

    // let dst = new cv.Mat();
    // cv.cvtColor(mat, dst, cv.COLOR_RGBA2GRAY);
    // cv.imshow("canvasMask", dst);
    mat.delete();
    canvasMask.hidden = false;
  };
}

function onOpenCvReady() {
  content.hidden = false;
  document.getElementById("status").innerHTML = "OpenCV.js is ready.";
}

function initDrawingTool() {
  let painting = false;
  function startPosition(e) {
    painting = true;
    draw(e);
  }
  function finishedPosition() {
    painting = false;
    ctx_mask.beginPath();
  }
  function draw(e) {
    if (!painting) return;
    var mousePos = getMousePos(canvas_mask, e);
    ctx_mask.lineWidth = penWidth;
    ctx_mask.lineCap = "round";

    ctx_mask.lineTo(mousePos.x, mousePos.y);
    ctx_mask.stroke();
    ctx_mask.beginPath();
    ctx_mask.moveTo(mousePos.x, mousePos.y);
  }

  canvas_mask.addEventListener("mousedown", startPosition);
  canvas_mask.addEventListener("mouseup", finishedPosition);
  canvas_mask.addEventListener("mousemove", draw);

  function getMousePos(canvas_mask, e) {
    var rect = canvas_mask.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }
}

function swapColor() {
  const swapColorBtn = document.getElementById("swapColorBtn");
  if (swapColorBtn.className == "btn btn-dark") {
    swapColorBtn.className = "btn btn-light";
    ctx_mask.strokeStyle = "white";
  } else {
    swapColorBtn.className = "btn btn-dark";
    ctx_mask.strokeStyle = "black";
  }
}

function changePenWidth(x) {
  document.getElementById("slider_value").innerHTML = x;
  penWidth = x;
}

function exportMask(e) {
  console.log("in exportMask()");
  //   dataUrl = canvas_mask.toDataURL(),
  //   imageElement = document.createElement('img');
  //   imageElement.src = dataUrl;
  //   let mat = cv.imread(imageElement);
  // //   let dst = new cv.Mat();
  //     cv.cvtColor(mat, mat, cv.COLOR_RGBA2GRAY);
  //     cv.cvtColor(mat, mat, CV_BGRA2BGR);

//   var imageURI = canvas_mask.toDataURL("image/png");
//   console.log(imageURI);
//     e.href = imageURI;
//     exportBtn.setAttribute("download","blah.png")

    var imageURI = canvas_mask.toDataURL("image/jpg");
    e.href = imageURI;
    exportBtn.setAttribute("download","blah.jpg")
}
