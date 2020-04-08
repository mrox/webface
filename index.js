// import * as THREE from "three"
import { ScatterGL } from "scatter-gl"
import * as facemesh from '@tensorflow-models/facemesh'
import * as tf from '@tensorflow/tfjs-core';
import Stats from 'stats.js';
import { round } from "prelude-ls";

// import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';

// const scatterGL = new ScatterGL(document.querySelector('#scatter-gl-container'), { 'rotateOnStart': false, 'selectEnabled': true });
const stats = new Stats();
let model, video, videoWidth, videoHeight, canvas, ctx, scatterGLHasInitialized = false, scatterGL;
let preLog = document.querySelector('#log-container')
const VIDEO_SIZE = 500;
const mobile = isMobile();

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
            // Only setting the video to a specified size in order to accommodate a
            // point cloud, so on mobile devices accept the default size.
            width: mobile ? undefined : VIDEO_SIZE,
            height: mobile ? undefined : VIDEO_SIZE
        },
    });
    video.srcObject = stream;

    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            resolve(video);
        };
    });
}

async function renderPrediction() {
    stats.begin();

    const predictions = await model.estimateFaces(video);
    // console.log(predictions.length);
    //
    if (predictions.length > 0) drawScatter(predictions)

    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);
    stats.end();
    requestAnimationFrame(renderPrediction);

}

async function drawScatter(predictions) {
    const pointsData = predictions.map(prediction => {
        let scaledMesh = prediction.scaledMesh;
        return scaledMesh.map(point => ([-point[0], -point[1], -point[2]]));
    });

    let flattenedPointsData = [];
    for (let i = 0; i < pointsData.length; i++) {
        flattenedPointsData = flattenedPointsData.concat(pointsData[i]);
    }

    let pointA = flattenedPointsData[362]
    let pointB = flattenedPointsData[133]
    let pointC = flattenedPointsData[62]
    let pointD = flattenedPointsData[291]

    //Tính vector pháp tuyến của mặt phẳng mặt. từ 4 điểm 
    let vecAB = getVector(pointA, pointB)
    let vecAD = getVector(pointA, pointD)
    let vecBC = getVector(pointB, pointC)

    let normalVec = sum(cross(vecAD, vecAB), cross(vecBC, vecAB))
    let horizontalAngle = Math.atan2(normalVec[0], normalVec[2]) * 180 / Math.PI
    let verticalAngle = Math.atan2(normalVec[1], normalVec[2]) * 180 / Math.PI
    // console.log(`horizontalAngle: ${horizontalAngle}, verticalAngle: ${verticalAngle}`);
    //show pre log
    if(preLog) showPreLogs(horizontalAngle, verticalAngle)

    if (!mobile) {
        const dataset = new ScatterGL.Dataset(flattenedPointsData);

        if (!scatterGLHasInitialized) {
            scatterGL.render(dataset);
        } else {
            scatterGL.updateDataset(dataset);
        }
        scatterGLHasInitialized = true;
    }

}

function showPreLogs(horizontalAngle, verticalAngle){
    preLog.innerHTML=`${round(horizontalAngle)}, ${round(verticalAngle)}`
}


async function main() {
    model = await facemesh.load({ maxFaces: 1 });
    console.log(tf.getBackend());

    //show stats
    stats.showPanel(0);  // 0: fps, 1: ms, 2: mb, 3+: custom
    document.getElementById('main').appendChild(stats.dom);

    //setup camera
    await setupCamera();
    video.play();
    videoWidth = video.videoWidth;
    videoHeight = video.videoHeight;
    video.width = videoWidth;
    video.height = videoHeight;

    canvas = document.getElementById('output');
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    const canvasContainer = document.querySelector('.canvas-wrapper');
    canvasContainer.style = `width: ${videoWidth}px; height: ${videoHeight}px`;

    ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.fillStyle = '#32EEDB';
    ctx.strokeStyle = '#32EEDB';
    ctx.lineWidth = 0.5;

    renderPrediction()

    if(mobile){
        document.querySelector('#scatter-gl-container').style =
            `width: ${VIDEO_SIZE}px; height: ${VIDEO_SIZE}px;`;
    
        scatterGL = new ScatterGL(
            document.querySelector('#scatter-gl-container'),
            { 'rotateOnStart': false, 'selectEnabled': true });
    }
}

main()


//Các hàm cho vector
function getVector(A, B) {
    return [B[0] - A[0], B[1] - A[1], B[2] - A[2]]
}

function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function sum(a, b) {

    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}

