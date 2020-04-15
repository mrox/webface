import * as facemesh from '@tensorflow-models/facemesh'
import * as tf from '@tensorflow/tfjs-core';
import Stats from 'stats.js';

let video, videoWidth, videoHeight, ctx
let stats = new Stats();
let canvas = document.getElementById('output');

function isMobile() {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    return isAndroid || isiOS;
}

async function setupCamera() {
    video = document.getElementById('video');

    const stream = await navigator.mediaDevices.getUserMedia({
        'audio': false,
        'video': {
            facingMode: 'user',
            // width: { exact: 1280 }, height: { exact: 720 }
            // Only setting the video to a specified size in order to accommodate a
            // point cloud, so on mobile devices accept the default size.
            // width: mobile ? undefined : VIDEO_SIZE,
            // height: mobile ? undefined : VIDEO_SIZE
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

(async () => {
    if (!testBrowse()) {
        console.log("éo chạy đc");
        return;
    }
    stats.showPanel(0);  // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild(stats.dom);

    await setupCamera();
    video.play();
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    ctx = canvas.getContext('2d');
    renderPrediction()




})()

async function renderPrediction(){
    stats.begin();

    
    var scale = Math.max(canvas.width / videoWidth, canvas.height / videoHeight);
    var left = (canvas.width / 2) - (videoWidth / 2) * scale;
    var top = (canvas.height / 2) - (videoHeight / 2) * scale;
    
    ctx.drawImage(video, left, top, videoWidth * scale, videoHeight * scale);

    // ctx.drawImage(video, 0, 0, videoWidth * scale, videoHeight *scale);
    // ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);


    stats.end()
    requestAnimationFrame(renderPrediction);
}

async function testBrowse() {
    let valid = {
        "canvas": !!window.CanvasRenderingContext2D,
        "webgl": !!window.WebGLRenderingContext,
        "workers": !!window.Worker
    }
    return valid.canvas && valid.webgl && valid.workers
}

function animate() {

	

}


