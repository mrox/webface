import Vector from "../ultis/vector"
import cv from '../opencv'


export default class FaceAttributes {
    constructor({ flattenedPointsData, imageData, w, h }) {
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
        let horizontalAngle = Math.atan2(normalVec[0], normalVec[2]) * 180 / Math.PI
        let verticalAngle = Math.atan2(normalVec[1], normalVec[2]) * 180 / Math.PI

        console.log(horizontalAngle, verticalAngle);
        return { horizontalAngle, verticalAngle }
    }


}