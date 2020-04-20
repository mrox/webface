//Get Vector from 2 points

export default new class Vector {

    get(A, B) {
        return [B[0] - A[0], B[1] - A[1], B[2] - A[2]]
    }
    
    cross(a, b) {
        return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
    }
    
    sum(a, b) {
    
        return [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
    }
    //#endregion
    
}
