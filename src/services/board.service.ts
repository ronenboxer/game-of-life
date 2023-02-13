import utilService from "./util.service"
const shapes = require('../data/shapes.json')

export interface Cell {
    coords: number[],
    state: string
}

export interface Shape {
    cells: Cell[],
    size: number[]
}

export interface Shapes {
    [name: string]: Shape
}

export default new class boardService {
    private STORAGE_KEYS = {
        board: 'GOL_Board_DB',
        shape: 'GOL_Shapes_DB'
    }
    private stateColorMap = {
        dead: '#808080',
        dying: '#b82462',
        born: '#fdab3d',
        alive: '#00a359',
        super: '#5a82e6',
        null: 'transparent'
    }
    private lightenPercentage = 20
    private isXInfinite = true
    private isYInfinite = true
    private isStatic = false
    private population = 0

    getIsStatic() {
        return this.isStatic
    }

    getPopulation() {
        return this.population
    }

    getFactoryShapes(){
        if (shapes) return shapes as Shapes
        return {} as Shapes
    }

    getIsInfiniteAxis() { return { x: this.isXInfinite, y: this.isYInfinite } }

    setInfiniteProp(axis: string, isInfinite: boolean) {
        if (axis === 'x') this.isXInfinite = isInfinite
        if (axis === 'y') this.isYInfinite = isInfinite
    }

    getBoard(rows: number, cols: number, populationPercentage = 50) {
        this.population = 0
        return new Array(rows).fill(null)
            .map(_row => new Array(cols).fill('dead')
                .map(_cell => {
                    const isAlive = Math.random() > (100 - populationPercentage) / 100
                    if (!isAlive) return 'dead'
                    this.population++
                    return 'alive'
                }))
    }

    getCurrColor(state = 'dead') {
        return this.stateColorMap[state as keyof typeof this.stateColorMap]
    }

    lighten(state = 'null') {
        if (state === 'null') return 'transparent'
        const color = this.stateColorMap[state as keyof typeof this.stateColorMap]
        const { r, g, b } = utilService.hexToRGB(color)
        const diff = {
            r: (255 - r) * (this.lightenPercentage) / 100,
            g: (255 - g) * (this.lightenPercentage) / 100,
            b: (255 - b) * (this.lightenPercentage) / 100
        }
        return `rgb(${r + diff.r},${g + diff.g},${b + diff.b})`
    }

    getNextGen(village: string[][]) {
        this.isStatic = true
        this.population = 0
        const nextGen = [] as string[][]
        const ROWS = village.length
        const COLS = village[0].length
        for (let x = 0; x < ROWS; x++) {
            nextGen[x] = []
            for (let y = 0; y < COLS; y++) {
                const currCell = village[x][y]
                nextGen[x][y] = currCell
                if (currCell === 'super') {
                    this.population++
                    continue
                }
                const neighborsCount = this._checkNeighbors(x, y, village)
                if (currCell === 'dead' && neighborsCount === 3) nextGen[x][y] = 'born'
                else if (currCell === 'alive' && (neighborsCount < 2 || neighborsCount > 3)) nextGen[x][y] = 'dying'
                if (nextGen[x][y] === 'alive' || nextGen[x][y] === 'born') this.population++
                if (nextGen[x][y] !== currCell) this.isStatic = false
            }
        }
        return nextGen
    }

    updateCurrGen(village: string[][]) {
        const updatedGen = [] as string[][]
        const ROWS = village.length
        const COLS = village[0].length
        for (let x = 0; x < ROWS; x++) {
            updatedGen[x] = []
            for (let y = 0; y < COLS; y++) {
                const currCell = village[x][y]
                updatedGen[x][y] = currCell
                if (currCell === 'dying') updatedGen[x][y] = 'dead'
                else if (currCell === 'born') updatedGen[x][y] = 'alive'
            }
        }
        return updatedGen
    }

    saveShape(formattedCorners: number[][], village: string[][], name: string, isShape = true) {
        const startRow = formattedCorners[0][0]
        const startCol = formattedCorners[0][1]
        const endRow = formattedCorners[1][0]
        const endCol = formattedCorners[1][1]
        const savedShape = [] as { coords: number[], state: string }[]
        const rowCount = formattedCorners[1][0] - formattedCorners[0][0] + 1
        const colCount = formattedCorners[1][1] - formattedCorners[0][1] + 1
        for (let row = startRow; row <= endRow; row++) {
            for (let col = startCol; col <= endCol; col++) {
                const currCell = village[row][col]
                if (currCell === 'dead' || currCell === 'dying') continue
                const cellToSave = {
                    coords: [row - startRow, col - startCol],
                    state: 'alive'
                }
                if (currCell === 'super') cellToSave.state = 'super'
                savedShape.push(cellToSave)
            }
        }

        if (!savedShape.length) return []
        const shapes = this.loadShapesFromStorage(isShape ? 'shape' : 'board')|| {}
        shapes[name] = { cells: savedShape, size: [rowCount, colCount] }
        this.saveShapesToStorage(shapes, isShape ? 'shape' : 'board')

        return savedShape as Cell[]
    }

    saveShapesToStorage(shapes: Shapes, key = 'shape') {
        return utilService.saveToStorage(this.STORAGE_KEYS[key as keyof typeof this.STORAGE_KEYS], shapes) as Shapes
    }

    loadShapeFromStorage(name: string, key = 'shape') {
        return this.loadShapesFromStorage(this.STORAGE_KEYS[key as keyof typeof this.STORAGE_KEYS])[name] as Shape || null
    }

    loadShapesFromStorage(key = 'shape') {
        if (key === 'factory') return this.getFactoryShapes()
        return (utilService.loadFromStorage(this.STORAGE_KEYS[key as keyof typeof this.STORAGE_KEYS]) || {}) as Shapes
    }

    removeShapeFromStorage(key = 'shape', name:string){
        debugger
        const shapes = this.loadShapesFromStorage(key)
        if (!shapes || !shapes[name as keyof typeof shapes]) return
        delete shapes[name as keyof typeof shapes]
        this.saveShapesToStorage(shapes, key)
    }

    getFormattedShapeCorners(corners: number[][], village: string[][]) {
        const startRow = Math.min(corners[0][0], corners[1][0])
        const endRow = Math.max(corners[0][0], corners[1][0])
        const startCol = Math.min(corners[0][1], corners[1][1])
        const endCol = Math.max(corners[0][1], corners[1][1])

        let shapeStartRow = endRow
        let shapeEndRow = startRow
        let shapeStartCol = endCol
        let shapeEndCol = startCol

        for (let i = startRow; i <= endRow; i++) {
            for (let j = startCol; j <= endCol; j++) {
                const currCell = village[i][j]
                if (currCell !== 'dead' && currCell !== 'dying') {
                    if (i < shapeStartRow) shapeStartRow = i
                    if (i > shapeEndRow) shapeEndRow = i
                    if (j < shapeStartCol) shapeStartCol = j
                    if (j > shapeEndCol) shapeEndCol = j
                }
            }
        }

        if (endRow - startRow < 2 && endCol - startCol < 2) return []
        return [[shapeStartRow, shapeStartCol], [shapeEndRow, shapeEndCol]]
    }

    getPseudoVillage(SIZE: number[], shape: Shape, startCell: number[], fillDeadCells = false) {
        const [startRow, startCol] = startCell
        const [ROWS, COLS] = SIZE || [0, 0]
        const pseudoVillage = new Array(ROWS).fill(null).map(_ => new Array(COLS).fill(fillDeadCells ? 'dead' : 'null'))
        let shapeIdx = 0
        let isEmpty = true
        let [shapeRow, shapeCol] = shape.cells[0].coords || [-1, -1]
        for (let row = startRow; row < startRow + shape.size[0]; row++) {
            let currRow = row
            if (this.isYInfinite) currRow = (currRow + ROWS) % ROWS
            else if (currRow >= ROWS) break
            for (let col = startCol; col < startCol + shape.size[1]; col++) {
                let currCol = col
                if (this.isXInfinite) currCol = (currCol + COLS) % COLS
                else if (currCol >= COLS) break
                if (row - startRow === shapeRow && col - startCol === shapeCol) {
                    isEmpty = false
                    pseudoVillage[currRow][currCol] = shape.cells[shapeIdx].state
                    shapeIdx++
                    [shapeRow, shapeCol] = shape.cells[shapeIdx]?.coords || [-1, -1]
                } else pseudoVillage[currRow][currCol] = 'dead'
            }
        }
        return isEmpty
            ? null
            : pseudoVillage
    }

    resizeShape(shape: Shape, newSize: number[]) {
        const [ROWS, COLS] = newSize
        const newShape = { ...shape }
        let endRow = 0
        let endCol = 0
        newShape.cells = shape.cells.filter(({ coords }) => {
            if (coords[0] >= ROWS || coords[1] >= COLS) return false
            if (coords[0] > endRow) endRow = coords[0]
            if (coords[1] > endCol) endCol = coords[1]
        })
        newShape.size = [endRow, endCol]
        return newShape
    }

    resizeBoard(village: string[][], newSize: number[]) {
        const [ROWS, COLS] = newSize
        const newVillage = [] as string[][]
        for (let row = 0; row < ROWS; row++) {
            newVillage[row] = []
            for (let col = 0; col < COLS; col++) {
                if (row < village.length && col < village[0].length) newVillage[row][col] = village[row][col]
                else newVillage[row][col] = 'dead'
            }
        }
        return newVillage
    }

    mergeBoardWithPseudo(village: string[][], pseudoVillage: string[][]) {
        const ROWS = village.length
        const COLS = village[0].length
        const newVillage = [] as string[][]
        for (let row = 0; row < ROWS; row++) {
            newVillage[row] = []
            for (let col = 0; col < COLS; col++) {
                newVillage[row][col] = pseudoVillage[row][col] === 'null'
                    ? village[row][col]
                    : pseudoVillage[row][col]
            }
        }
        return newVillage
    }

    transformShape(shape: Shape, action: string, value: string) {
        if (action === 'flip') return utilService.flipShape(shape, value) || shape
        if (action === 'rotate') return utilService.rotateShape(shape, value === 'right' || value === 'clcockwise' ? -1 : 1) || shape
        return shape
    }

    private _checkNeighbors(row: number, col: number, village: string[][]) {
        let neighborsCount = 0
        const ROWS = village.length
        const COLS = village[0].length
        for (let i = row - 1; i <= row + 1; i++) {
            let currRow = i
            if (this.isYInfinite) currRow = (currRow + ROWS) % ROWS
            else if (currRow < 0 || currRow >= ROWS) continue
            for (let j = col - 1; j <= col + 1; j++) {
                let currCol = j
                if (i === row && j === col) continue
                if (this.isXInfinite) currCol = (currCol + COLS) % COLS
                else if (currCol < 0 || currCol >= COLS) continue
                const currCell = village[currRow][currCol]
                if (currCell !== 'dead' && currCell !== 'dying') neighborsCount++
            }
        }
        return neighborsCount
    }
}
