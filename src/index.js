import * as handTrack from 'handtrackjs';
import './style.css';

const video = document.getElementById("srcvideo");
const canvas = document.getElementById("canvas");
const context = canvas.getContext("2d");
const trackButton = document.getElementById("track");
const pointer = document.getElementById("pointer");
let updateNote = document.getElementById("updatenote");
let log = document.getElementById("log");


let isVideo = false;
let model = null;
let lastMidX = -100;
let lastMidY = -100;

const modelParams = {
    flipHorizontal: true,   // flip e.g for video  
    maxNumBoxes: 1,        // maximum number of boxes to detect
    iouThreshold: 0.5,      // ioU threshold for non-max suppression
    scoreThreshold: 0.6,    // confidence threshold for predictions.
}

function startVideo() {
    handTrack.startVideo(video).then(function (status) {
        console.log("video started", status);
        if (status) {
            updateNote.innerText = "Video started. Now tracking"
            isVideo = true
            runDetection()
        } else {
            updateNote.innerText = "Please enable video"
        }
    });
}

function toggleVideo() {
    if (!isVideo) {
        updateNote.innerText = "Starting video"
        startVideo();
    } else {
        updateNote.innerText = "Stopping video"
        handTrack.stopVideo(video)
        isVideo = false;
        updateNote.innerText = "Video stopped"
    }
}

trackButton.addEventListener("click", function () {
    toggleVideo();
});

function moveCursor(x, y) {
    pointer.style.position = "absolute";
    pointer.style.left = (x - pointer.clientWidth / 2) + 'px';
    pointer.style.top = (y - pointer.clientHeight / 2) + 'px';

}

function processPrediction(prediction) {
    const [x, y, width, height] = prediction.bbox;
    let midX = Math.round(x + (width / 2));
    let screenX = Math.round(document.body.clientWidth * (midX / video.width));
    let midY = Math.round(y + (height / 2));
    let screenY = Math.round(document.body.clientHeight * (midY / video.height));
    log.innerText += `score: ${Math.round(prediction.score)} (x,y): (${midX},${midY}) 
    diff: (${lastMidX - midX},${lastMidY - midY})\n`;
    // console.log('doc: ', document.body.clientWidth, document.body.clientHeight);
    // console.log('vid: ', x, y, width, height);
    // console.log('sceen: ', screenX, screenY);
    lastMidX = midX;
    lastMidY = midY;
    moveCursor(screenX, screenY);

}
function runDetection() {
    model.detect(video).then(predictions => {

        model.renderPredictions(predictions, canvas, context, video);
        console.log(predictions);

        if (predictions[0]) {
            processPrediction(predictions[0]);
        }
        if (isVideo) {
            requestAnimationFrame(runDetection);
        }
    });
}

//Scrumboard
$(function() {
    $( ".column" ).sortable({
      connectWith: ".column",
      handle: ".portlet-header",
      cancel: ".portlet-toggle",
      placeholder: "portlet-placeholder ui-corner-all"
    });
 
    $( ".portlet" )
      .addClass( "ui-widget ui-widget-content ui-helper-clearfix ui-corner-all" )
      .find( ".portlet-header" )
        .addClass( "ui-widget-header ui-corner-all" )
       
 
    $( ".portlet-toggle" ).click(function() {
        console.log('here');
        
      var icon = $( this );
      icon.toggleClass( "ui-icon-minusthick ui-icon-plusthick" );
      icon.closest( ".portlet" ).find( ".portlet-content" ).toggle();
    });
  });
//End scrumboard
// Load the model.
handTrack.load(modelParams).then(lmodel => {
    // detect objects in the image.
    model = lmodel
    updateNote.innerText = "Loaded Model!"
    trackButton.disabled = false
});
