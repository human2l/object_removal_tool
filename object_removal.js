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
let outputFileName = undefined;

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

//enable the shortcut keys
function bindKeyEvent() {
  $(document).keydown(function(e) {
    switch (e.which) {
      //H for help message
      case 72:
        showShortCuts();
        break;
      //9
      case 57:
        darker();
        break;
      //0
      case 48:
        lighter();
        break;
      //[
      case 219:
        if (penWidth == 1) break;
        changePenWidth(penWidth - 1);
        break;
      //]
      case 221:
        if (penWidth == 100) break;
        changePenWidth(penWidth + 1);
        break;
      //Tab
      case 9:
        swapColor();
        break;
      default:
        // exit this handler for other keys
        return;
    }
    //prevent default key actions
    e.preventDefault();
  });

  $(document).keyup(function(e) {
    switch (e.which) {
      //H
      case 72:
        hideShortCuts();
        break;
      default:
        return;
    }
    e.preventDefault();
  });
}

//load the bottom layer canvas(original image)
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
    mat.delete();
    canvasImage.hidden = false;
  };
}

//load the top layer canvas(mask image)
function initOutputCanvas() {
  outputFileElement.addEventListener(
    "change",
    e => {
      outputImgElement.src = URL.createObjectURL(e.target.files[0]);
      outputFileName = e.target.files[0].name;
    },
    false
  );
  outputImgElement.onload = function() {
    let mat = cv.imread(outputImgElement);
    cv.imshow("canvasMask", mat);
    mat.delete();
    canvasMask.hidden = false;
    canvas_mask.style.opacity = "0.1";
  };
}

//it still need about 3 seconds after opencv.js loaded. So here is a 3-sec-length interval
function onOpenCvReady() {
  var secondsLeft = 3;
  var countDown = setInterval(() => {
    if (secondsLeft == 0) {
      clearInterval(countDown);
      content.hidden = false;
      document.getElementById("status").innerHTML = "OpenCV.js is ready!";
    } else {
      document.getElementById("status").innerHTML =
        "OpenCV.js will be ready in " + secondsLeft;
      secondsLeft--;
    }
  }, 1000);
}

//drawing functions
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

//toggle the pen color between white & black
function swapColor() {
  const swapColorBtn = document.getElementById("swapColorBtn");
  if (swapColorBtn.className == "btn btn-dark btn-block") {
    swapColorBtn.className = "btn btn-light btn-block";
    ctx_mask.strokeStyle = "white";
  } else {
    swapColorBtn.className = "btn btn-dark btn-block";
    ctx_mask.strokeStyle = "black";
  }
}

//change width of pen
function changePenWidth(x) {
  document.getElementById("slider_value").innerHTML = x;
  document.getElementById("penWidthRange").value = x;
  penWidth = x;
}

//change the opacity of mask
function darker() {
  if (Number(canvas_mask.style.opacity) == 1) return;
  canvas_mask.style.opacity = "" + (Number(canvas_mask.style.opacity) + 0.1);
}
function lighter() {
  if (Number(canvas_mask.style.opacity) == 0.1) return;
  canvas_mask.style.opacity = "" + (Number(canvas_mask.style.opacity) - 0.1);
}

//download the modified mask as jpg file
function exportMask(e) {
  if (outputFileName == undefined) {
    return;
  }
  var imageURI = canvas_mask.toDataURL("image/jpg");
  e.href = imageURI;
  exportBtn.setAttribute("download", outputFileName);
}

//hold "H" will change the label/text to help message
function showShortCuts() {
  document.getElementById("penWidthDecrease").innerHTML = "[";
  document.getElementById("penWidthIncrease").innerHTML = "]";
  document.getElementById("swapColorBtn").innerHTML = "Tab";
  document.getElementById("opacityIncrease").innerHTML = "(";
  document.getElementById("opacityDecrease").innerHTML = ")";
}
function hideShortCuts() {
  document.getElementById("penWidthDecrease").innerHTML = "1";
  document.getElementById("penWidthIncrease").innerHTML = "100";
  document.getElementById("swapColorBtn").innerHTML = "Swap color";
  document.getElementById("opacityIncrease").innerHTML = "+";
  document.getElementById("opacityDecrease").innerHTML = "-";
}
