import * as facemesh from '@tensorflow-models/facemesh'
import * as tf from '@tensorflow/tfjs-core';
import FaceAttributes from '../ultis/faces'

let isRunning = false
let model, loading = false
var canvas
var context
let imageData
let bitmap
let faceAttributes = new FaceAttributes()
let faces = [];
let numFaces = 8
let step = 360 / numFaces
let current = 0
let index = 0

while (current < 360) {
    faces[index] = {
        min: index - step / 2 + current,
        max: index + 1 + step / 2 + current
    }
    current += step
    index += 1
}

function resetFaces() {
    console.log('reset face');
    faces.forEach(f => {
        delete f.value
    });
}

self.onmessage = async (e) => {

    if (e.data.type) {
        switch (e.data.type) {
            case 'reset':
                resetFaces()
                break;

            default:
                break;
        }
        return
    }
    let face;
    if (!model && !loading) {
        console.log(`load model`);
        loading = true
        model = await facemesh.load({ maxFaces: 1 });
        loading = false
        console.log(`load done`);
    }
    if (!isRunning && !loading) {
        var t0 = performance.now()
        var t1, t2, t3

        isRunning = true
        bitmap = e.data

        if (!canvas && !context) {
            canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
            context = canvas.getContext('2d');
        }

        try {
            context.drawImage(bitmap, 0, 0);
            imageData = context.getImageData(0, 0, bitmap.width, bitmap.height);
        } catch (error) {
            console.log(error);

            self.postMessage({ type: 'done', face })
            isRunning = false
            return
        }


        const predictions = await model.estimateFaces(imageData);

        if (predictions.length > 0) {

            const pointsData = predictions.map(prediction => {

                let scaledMesh = prediction.scaledMesh;
                return scaledMesh.map(point => ([-point[0], -point[1], -point[2]]));
            });

            const p = predictions[0]
            const box = p.boundingBox
            const topLeft = box.topLeft[0]
            const bottomRight = box.bottomRight[0]
            //lấy toạ độ face
            const wb = Math.round(bottomRight[0] - topLeft[0])
            const xb = Math.round(canvas.width - bottomRight[0])
            const yb = Math.round(topLeft[1])
            const hb = Math.round(bottomRight[1] - topLeft[1])


            let flattenedPointsData = [];
            for (let i = 0; i < pointsData.length; i++) {
                flattenedPointsData = flattenedPointsData.concat(pointsData[i]);

            }
            await faceAttributes.init({
                flattenedPointsData,
                imageData
            })

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
            const x = Math.round(bitmap.width - maxX)
            const y = Math.round(minY)
            const h = Math.round(maxY - minY)

            //TODO: Cần Load worker ngay từ đầu 
            t1 = performance.now()

            let blur = faceAttributes.checkBlur()
            t2 = performance.now()
            // console.log(blur);

            if (w > 240 && w < 1024) {
                let { angle, distance } = faceAttributes.angle()
                // let coverData = context.getImageData(xb, yb, wb, hb)
               
                if(imageData)
                keepPhotos({ angle, distance, coverData:imageData })

                // face = {
                //     x, y, w, h: w * 1.2
                // }
            }
        }

        self.postMessage({ type: 'done', face })
        isRunning = false

        t3 = performance.now()
    }

}


self.keepPhotos = ({ angle, distance, coverData }) => {

    faces.forEach((v, i) => {
        if (distance > 30 && angle > v.min && angle < v.max) {
            v.value = angle
            v.face = coverData
            self.postMessage({ type: 'draw', i: i + 1, data: v })
            // console.log(faces);
        }
    });



}
