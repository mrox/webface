import { ScatterGL } from "scatter-gl"
import * as facemesh from '@tensorflow-models/facemesh'
import * as tf from '@tensorflow/tfjs-core';
import Stats from 'stats.js';
import { round } from "prelude-ls";

// import * as tfjsWasm from '@tensorflow/tfjs-backend-wasm';

const stats = new Stats();
let model, video, videoWidth, videoHeight, canvas, ctx, scatterGLHasInitialized = false, scatterGL;
let track = 0, trackBreak = true;
let preLog = document.querySelector('#log-container')
let preview, previewCtx, previewContainer;
let preBrightness = document.querySelector('#brightness')
let preFaceSize = document.querySelector('#facesize')
let preBlurry = document.querySelector('#blurry')
const VIDEO_SIZE = 500;
const mobile = isMobile();
const facePhotos = []
const cropPhotoworker = new Worker('./attribute.worker.js')

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
            width: { exact: 1280 }, height: { exact: 720 }
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

async function renderPrediction() {
    stats.begin();
    ctx.drawImage(video, 0, 0, videoWidth, videoHeight, 0, 0, canvas.width, canvas.height);
    
    const predictions = await model.estimateFaces(video);

    //
    if (predictions.length > 0) {
        const p = predictions[0]
        const box = p.boundingBox
        const topLeft = box.topLeft[0]
        const bottomRight = box.bottomRight[0]

        //lấy toạ độ face
        const w = Math.round(bottomRight[0] - topLeft[0])
        const x = Math.round(videoWidth - bottomRight[0])
        const y = Math.round(topLeft[1])
        const h = Math.round(bottomRight[1] - topLeft[1])

        //Vẽ 2 điểm góc của mặt lên video
        ctx.beginPath();
        ctx.arc(topLeft[0], topLeft[1], 3 /* radius */, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(bottomRight[0], bottomRight[1], 3 /* radius */, 0, 2 * Math.PI);
        ctx.fill();
        //
        //Tạo track mới nếu mất track từ frame trước
        if (trackBreak) {
            track += 1
            trackBreak = false
        }

        drawScatter(predictions)
    }
    else trackBreak = true;

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
        // console.log(pointsData[i]);

    }

    let minX = 100000
    let minY = 100000
    let maxX = -100000
    let maxY = -100000

    flattenedPointsData.forEach(p => {
        minX = Math.min(minX, -p[0])
        minY = Math.min(minY, -p[1])
        maxX = Math.max(maxX, -p[0])
        maxY = Math.max(maxY, -p[1])
    })

    const w = Math.round(maxX - minX)
    const x = Math.round(videoWidth - maxX)
    const y = Math.round(minY)
    const h = Math.round(maxY - minY)
    // var w = maxX - minX
    // var h = maxY - minY
    var imgData = ctx.getImageData(x, y, w, h);
    cropPhotoworker.postMessage({ imgData, w, h })
    //worker xử lý ảnh
    // if(imgData.data)

    ctx.beginPath();
    ctx.arc(minX, minY, 3 /* radius */, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(maxX, maxY, 3 /* radius */, 0, 2 * Math.PI);
    ctx.fill();




    // cropPhotoworker.postMessage({imgData, w, h})
    // console.log(`MIN: ${minX}, ${minY}; MAX: ${maxX}, ${maxY}`);



    let pointA = flattenedPointsData[362] //mép trong mắt trái
    let pointB = flattenedPointsData[133] //mép trong mắt phải
    let pointC = flattenedPointsData[62]  //mép phải miệng
    let pointD = flattenedPointsData[291] //mép trái miệng

    //Tính vector pháp tuyến của mặt phẳng mặt từ 4 điểm trên mặt
    let vecAB = getVector(pointA, pointB)
    let vecAD = getVector(pointA, pointD)
    let vecBC = getVector(pointB, pointC)

    let normalVec = sum(cross(vecAD, vecAB), cross(vecBC, vecAB))
    let horizontalAngle = Math.atan2(normalVec[0], normalVec[2]) * 180 / Math.PI
    let verticalAngle = Math.atan2(normalVec[1], normalVec[2]) * 180 / Math.PI



    if (preLog) showPreLogs(horizontalAngle, verticalAngle)

    // if (!mobile) {

    //     const dataset = new ScatterGL.Dataset(flattenedPointsData);

    //     if (!scatterGLHasInitialized) {
    //         scatterGL.render(dataset);
    //     } else {
    //         scatterGL.updateDataset(dataset);
    //     }
    //     scatterGLHasInitialized = true;
    // }

}

function showPreLogs(horizontalAngle, verticalAngle) {
    preLog.innerHTML = `Backend: ${tf.getBackend()}\nTrack: ${track} \nGóc mặt [h,v]: [${round(horizontalAngle)},${round(verticalAngle)}]`
}

async function main() {
    model = await facemesh.load({ maxFaces: 1 });

    console.log(tf.getBackend()); //wasm, webgl, cpu

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
    if (mobile) document.body.style = `width: ${videoWidth}px;`
    document.querySelector("#videosize").innerHTML = `Video Size: ${video.videoWidth},${video.videoHeight}`

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


    previewContainer = document.querySelector('.preview-wrapper');
    preview = document.querySelector('#crop');
    previewCtx = preview.getContext('2d')
    previewCtx.translate(canvas.width, 0);
    previewCtx.scale(-1, 1);


    renderPrediction()

    // if(!mobile){
    //     document.querySelector('#scatter-gl-container').style =
    //         `width: ${VIDEO_SIZE}px; height: ${VIDEO_SIZE}px;`;

    //     scatterGL = new ScatterGL(
    //         document.querySelector('#scatter-gl-container'),
    //         { 'rotateOnStart': false, 'selectEnabled': true });
    // }

    cropPhotoworker.addEventListener('message', async (e) => {
        preBrightness.innerHTML = `Brightness: ${e.data.brightness}`
        preFaceSize.innerHTML = `Face Size: ${e.data.w}, ${e.data.h}`
        preBlurry.innerHTML = `Blurry: ${e.data.blur}`
        preview.width = e.data.w
        preview.height = e.data.h
        previewContainer.style = `width: ${e.data.w}px; height: ${e.data.h}px`;
        previewCtx.putImageData(e.data.pixels, 0, 0)        
    })
}

main()


//Các hàm cho vector
//#region vector
function getVector(A, B) {
    return [B[0] - A[0], B[1] - A[1], B[2] - A[2]]
}

function cross(a, b) {
    return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
}

function sum(a, b) {

    return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
}
//#endregion
