import { MouseEvent } from "react"
import { Cell, Shape } from "./board.service"
export default new class utilService {

    debounce = (func: Function, timeout = 300) => {
        let timer: any
        return (...args: any) => {
            clearTimeout(timer);
            timer = setTimeout(() => { func.apply(this, args); }, timeout)
        }
    }
    hexToRGB = (hex: string) => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7,), 16)
        return { r, g, b }
    }

    getCoordsByEv(ev: MouseEvent | TouchEvent, ROWS: number, COLS: number, SIZE: number) {
        let row, col
        if (ev instanceof TouchEvent) {
            const target = ev.target as HTMLElement
            row = ev.touches[0].clientY - target.offsetTop
            col = ev.touches[0].clientX - target.offsetLeft
        } else {
            ({ offsetX: col, offsetY: row } = ev?.nativeEvent || ev)
        }
        row = Math.abs(Math.floor(row / SIZE))
        col = Math.abs(Math.floor(col / SIZE))
        return { row, col }
    }

    rotateShape(shape: Shape, rotations: number) {
        const formattedRotations = (rotations + 4) % 4
        let formattedShape = JSON.parse(JSON.stringify(shape)) as Shape
        for (let i = 0; i < formattedRotations; i++) { formattedShape = this._rotateShapeCounterClockWise(formattedShape) }
        return formattedShape
    }

    flipShape(shape: Shape, axis: string) {
        const [ROWS, COLS] = shape.size
        const formattedShape = JSON.parse(JSON.stringify(shape)) as Shape
        formattedShape.cells.forEach(cell => {
            if (axis === 'horizontal') cell.coords[1] = COLS - 1 - cell.coords[1]
            if (axis === 'vertical') cell.coords[0] = ROWS - 1 - cell.coords[0]
        })
        formattedShape.cells.sort(this._sortCoors)
        return formattedShape
    }

    saveToStorage(key: string, item: any) {
        localStorage.setItem(key, JSON.stringify(item))
        return item
    }

    loadFromStorage(key: string) {
        return JSON.parse(localStorage.getItem(key) as string)
    }

    private _rotateShapeCounterClockWise(shape: Shape) {
        const COLS = shape.size[1]
        shape.cells.forEach(cell => cell.coords = [COLS - 1 - cell.coords[1], cell.coords[0]])
        shape.size = [shape.size[1], shape.size[0]]
        shape.cells.sort(this._sortCoors)
        return shape
    }

    private _sortCoors(cell1: Cell, cell2: Cell) {
        const coords1 = cell1.coords
        const coords2 = cell2.coords
        if (coords1[0] > coords2[0]) return 1
        if (coords1[0] < coords2[0]) return -1
        return coords1[1] - coords2[1]
    }
}
