import Vector from "../ultis/vector"
import cv from '../opencv'


export default class FaceAttributes {

    init({ flattenedPointsData, imageData, w, h }) {
        this.flattenedPointsData = flattenedPointsData
        this.imageData = imageData
    }

    angle() {

        let pointA = this.flattenedPointsData[362] //mép trong mắt trái
        let pointB = this.flattenedPointsData[133] //mép trong mắt phải
        let pointC = this.flattenedPointsData[62]  //mép phải miệng
        let pointD = this.flattenedPointsData[291] //mép trái miệng

        //Tính vector pháp tuyến của mặt phẳng mặt từ 4 điểm trên mặt
        let vecAB = Vector.get(pointA, pointB)
        let vecAD = Vector.get(pointA, pointD)
        let vecBC = Vector.get(pointB, pointC)

        let normalVec = Vector.sum(Vector.cross(vecAD, vecAB), Vector.cross(vecBC, vecAB))

        // let horizontalAngle = Math.atan2(normalVec[0], normalVec[2]) * 180 / Math.PI
        // let verticalAngle = Math.atan2(normalVec[1], normalVec[2]) * 180 / Math.PI


        let angle = Math.round(Math.atan2(normalVec[0], normalVec[1]) * 180 / Math.PI);//Math.atan2(horizontalAngle,verticalAngle)*(180/Math.PI);
        if (angle < 0) angle = 360 + angle
        let distance = Math.round(Math.sqrt(Math.pow(normalVec[0], 2) + Math.pow(normalVec[1], 2)) / 100)

        return { angle, distance }
    }


    checkBlur() {
        const src = cv.matFromImageData(this.imageData)
        cv.cvtColor(src, src, cv.COLOR_RGB2GRAY, 0);
        let dst = new cv.Mat();
        let men = new cv.Mat();
        let menO = new cv.Mat();

        cv.Laplacian(src, dst, cv.CV_64F, 1, 1, 0, cv.BORDER_DEFAULT);
        cv.meanStdDev(dst, menO, men)
        const blur = men.data64F[0]
        src.delete(); dst.delete(); men.delete(), menO.delete()
        return Math.pow(blur, 2)
    }



}