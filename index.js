// import * as THREE from "three"
import { ScatterGL } from "scatter-gl"
import * as facemesh from '@tensorflow-models/facemesh'
import * as tf from '@tensorflow/tfjs-core';
import Stats from 'stats.js';

// import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';

// const scatterGL = new ScatterGL(document.querySelector('#scatter-gl-container'), { 'rotateOnStart': false, 'selectEnabled': true });
const stats = new Stats();
let model, video, mobile, videoWidth, videoHeight, canvas, ctx, scatterGLHasInitialized = false, scatterGL;
const VIDEO_SIZE = 500;


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
    let pointD=   flattenedPointsData[291]
    
    flattenedPointsData = [
        flattenedPointsData[1],
        pointA,
        pointB,
        pointC,
        pointD
    ]

    //Tính vector pháp tuyến của mặt phẳng mặt. từ 4 điểm 
    let vecAB = getVector(pointA, pointB)
    let vecAD = getVector(pointA, pointD)
    let vecBC = getVector(pointB, pointC)

    let normalVec = sum(cross(vecAD,vecAB ), cross(vecBC, vecAB))
    let horizontalAngle = Math.atan2(normalVec[0],normalVec[2]) * 180 / Math.PI
    let verticalAngle = Math.atan2(normalVec[1],normalVec[2]) * 180 / Math.PI
    console.log(`horizontalAngle: ${horizontalAngle}, verticalAngle: ${verticalAngle}`);
    //
    // var cPoint = [0, 0, 0]
    // var minX = 1000000
    // var maxX = -100000

    // var minY = 100000
    // var maxY = -100000

    // var minZ = 100000
    // var maxZ = -100000

    // flattenedPointsData.forEach(item => {
    //     minX = Math.min(item[0], minX)
    //     maxX = Math.max(item[0], maxX)

    //     minY = Math.min(item[1], minY)
    //     maxY = Math.max(item[1], maxY)

    //     minZ = Math.min(item[2], minZ)
    //     maxZ = Math.max(item[2], maxZ)

    //     cPoint = [cPoint[0] + item[0], cPoint[1] + item[1], cPoint[2] + item[2]]
    // })
    // cPoint = [cPoint[0] / flattenedPointsData.length, cPoint[1] / flattenedPointsData.length, cPoint[2] / flattenedPointsData.length]
    // cPoint = [(minX + maxX) / 2, (minY + maxY) / 2, (minZ + maxZ) / 2]

    
    // flattenedPointsData.push(cPoint)
   
    const dataset = new ScatterGL.Dataset(flattenedPointsData);
   
    if (!scatterGLHasInitialized) {
        scatterGL.render(dataset);
    } else {
        scatterGL.updateDataset(dataset);
    }
    scatterGLHasInitialized = true;
}

// async function drawNo


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


    document.querySelector('#scatter-gl-container').style =
        `width: ${VIDEO_SIZE}px; height: ${VIDEO_SIZE}px;`;

    scatterGL = new ScatterGL(
        document.querySelector('#scatter-gl-container'),
        { 'rotateOnStart': false, 'selectEnabled': true });
}

main()

function getVector(A,B){
    return [B[0] - A[0] , B[1] - A[1], B[2] - A[2] ]
}

function cross(a, b) {
    return [a[1] * b[2]  -  a[2]* b[1],   a[2] * b[0]  -  a[0]* b[2]   ,  a[0] * b[1]  -  a[1]* b[0]]
}

function sum(a,b) {

    return [a[0] + b[0], a[1] + b[1] ,a[2] + b[2] ]
}

