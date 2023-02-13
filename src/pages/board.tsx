import React, { MouseEvent, useEffect, useRef } from "react"
import boardService, { Shape } from "../services/board.service"
import utilService from "../services/util.service"
import { Aside } from "../cmps/aside"
import { GameHeader } from "../cmps/game-header"

export function Board({ eventBus }: { eventBus: Function }) {

    // element refs
    const boardContainerRef = useRef<HTMLElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const onLoadCanvasRef = useRef<HTMLCanvasElement>(null)
    const saveElementsContainer = useRef<HTMLDivElement>(null)
    const pseudoCanvasWrapperRef = useRef<HTMLDivElement>(null)
    const pseudoCanvasRef = useRef<HTMLCanvasElement>(null)
    const canvasCoverRef = useRef<HTMLDivElement>(null)
    const shapeNameInputRef = useRef<HTMLInputElement>(null)

    // elements
    let canvas: HTMLCanvasElement
    let ctx = useRef(null as unknown as CanvasRenderingContext2D)
    let elBoardContainer: HTMLElement

    // board props
    const isInfinite = { x: true, y: true }
    let gCols: number
    let gRows: number
    let village = useRef(null as unknown as string[][])
    let lastHoveredCell = [-1, -1]
    const margin = 12

    // range props
    const snapshotDuration = 1500
    const ranges = useRef<{ [name: string]: { max: number, min: number, current: number } }>({
        speed: { min: 30, max: 1300, current: 1046 },
        resolution: { min: 20, max: 100, current: 40 },
        population: { min: 0, max: 100, current: 22 }
    })

    // gameplay props
    const genCounter = useRef(1)
    const population = useRef(0)
    const selectHandler = useRef(onSelect)
    let isNextGen = true
    let intervalId = useRef(null as unknown as string | number | NodeJS.Timer | undefined)
    let loadedShape: Shape | null = null
    let pseudoVillage: string[][] | null = null

    // shape cell selection
    let shapeFormattedCorners = [] as number[][]
    let shapeCorners = [] as number[][]
    let cornerStart: number[] | null
    let cornerEnd: number[] | null
    let shapeDropCell = [-1, -1]

    // modes props
    const isOn = useRef(true)
    let isSaveShapeMode = false
    let isSuperMode = false
    let isLoadingBoard = true

    function onSelectHandler(ev: MouseEvent | TouchEvent) {
        selectHandler.current(ev)
    }

    function onSelect(ev: MouseEvent | TouchEvent) {
        const size = ranges.current.resolution.current
        const { row, col } = utilService.getCoordsByEv(ev as MouseEvent, gRows, gCols, size)
        if (col >= gCols || col < 0 ||
            row >= gRows || row < 0) return

        const currState = village.current[row][col]

        if (isSuperMode) village.current[row][col] = currState === 'super' ? 'dead' : 'super'
        else {
            if (currState === 'super') return
            village.current[row][col] = currState === 'dying' || currState === 'dead'
                ? 'alive'
                : 'dead'
        }
        renderBoard()
    }

    function onHover(ev: React.MouseEvent) {
        const size = ranges.current.resolution.current
        const { row, col } = utilService.getCoordsByEv(ev, gRows, gCols, size)
        if (col >= gCols || col < 0 ||
            row >= gRows || row < 0) return
        if (row === lastHoveredCell[0] && col === lastHoveredCell[1]) return
        lastHoveredCell = [row, col]
        cornerEnd = [row, col]
        renderBoard()

        if (!(ev.nativeEvent instanceof TouchEvent)) ctx.current.fillStyle = boardService.lighten(village.current[row][col])
        ctx.current.stroke()
        ctx.current.fillRect(col * size, row * size, size, size)
    }

    function onSaveShape() {
        selectHandler.current = onSelectCorners
        cornerStart = null
        cornerEnd = null
        isSaveShapeMode = true
    }

    function onCaptureAndSave({ isShape, name } = { isShape: true, name: 'My Shape' }) {
        boardService.saveShape(shapeFormattedCorners, village.current, name, isShape)
        pseudoCanvasWrapperRef.current?.classList.toggle('done')
        canvasCoverRef.current?.classList.toggle('show')
        setTimeout(() => {
            saveElementsContainer?.current?.classList.toggle('show')
            eventBus().emit('actionEnd', null)
        }, snapshotDuration);
        setTimeout(() => {
            pseudoCanvasWrapperRef?.current?.classList.toggle('done')
            canvasCoverRef.current?.classList.toggle('show')
        }, snapshotDuration + 1000);
    }

    function onSelectCorners(ev: MouseEvent | TouchEvent) {
        if (!isSaveShapeMode) return
        const size = ranges.current.resolution.current
        const { row, col } = utilService.getCoordsByEv(ev, gRows, gCols, size)
        if (!cornerStart) cornerStart = [row, col]
        else {
            shapeCorners = [[...cornerStart], [...cornerEnd || cornerStart]]
            shapeFormattedCorners = boardService.getFormattedShapeCorners(shapeCorners, village.current)
            cornerStart = null
            cornerEnd = null

            if (shapeFormattedCorners.length) {
                snapCanvas()
                eventBus().emit('cornersSelected', null)
                saveElementsContainer?.current?.classList.toggle('show')
            }
            else eventBus().emit('actionEnd', null)
        }
    }

    function onLoadShape({ shape, isBoard = false }: { shape: Shape, isBoard: boolean }) {
        eventBus().emit('actionStart', null)
        loadedShape = shape
        if (isBoard) isLoadingBoard = true
        selectHandler.current = (ev: MouseEvent | TouchEvent) => { }
        onLoadCanvasRef?.current?.classList.add('active')
    }

    function onLoadShapeHover(ev: React.MouseEvent) {
        const size = ranges.current.resolution.current
        let { row, col } = utilService.getCoordsByEv(ev, gRows, gCols, size)
        const loaderCanvas = onLoadCanvasRef.current
        if (!canvas) canvas = canvasRef.current!
        loaderCanvas!.style.top = canvas.offsetTop + 'px'
        loaderCanvas!.style.left = canvas.offsetLeft + 'px'
        if ((!gRows && !gCols) || !loadedShape) return
        row = row >= gRows
            ? gRows - 1
            : row < 0
                ? 0
                : row
        col = col >= gCols
            ? gCols - 1
            : col < 0
                ? 0
                : col

        if (row === lastHoveredCell[0] && col === lastHoveredCell[1]) return
        lastHoveredCell = [row, col]

        if (shapeDropCell[0] !== -1 && shapeDropCell[1] !== -1) return
        renderPseudoVillage(row, col)
    }

    function onSelectDropCell(ev: MouseEvent | TouchEvent) {
        const size = ranges.current.resolution.current
        const { row, col } = utilService.getCoordsByEv(ev, gRows, gCols, size)
        shapeDropCell = [row, col]
        renderPseudoVillage(row, col)
        eventBus().emit('shapePositioned', null)
    }

    function positionLoadedShape() {
        onLoadCanvasRef?.current?.classList.remove('active')
        clearCanvas(onLoadCanvasRef?.current as HTMLCanvasElement)
        if (!pseudoVillage) return
        village.current = boardService.mergeBoardWithPseudo(village.current, pseudoVillage)
        if (shapeNameInputRef.current?.value) shapeNameInputRef.current.value = ''
        if (isOn.current) play()
        eventBus().emit('actionEnd', null)
    }

    function play() {
        isSaveShapeMode = false
        cornerStart = null
        cornerEnd = null
        shapeCorners = []
        shapeFormattedCorners = []
        selectHandler.current = onSelect
        loadedShape = null
        pseudoVillage = null
        renderBoard()
        clearInterval(intervalId.current)
        intervalId.current = setInterval(onStep, ranges.current.speed.current)
    }

    function pause() {
        clearInterval(intervalId.current)
    }

    function onCancelSave() {
        saveElementsContainer.current?.classList.toggle('show')
        eventBus().emit('actionEnd', null)
    }

    function onStep() {
        if (isNextGen) village.current = boardService.getNextGen(village.current)
        else {
            village.current = boardService.updateCurrGen(village.current)
            genCounter.current++
            population.current = boardService.getPopulation()
            if (boardService.getIsStatic()) eventBus().emit('actionStart', { isOn: false })
        }
        isNextGen = !isNextGen
        renderBoard()
    }

    function onCancelLoad() {
        loadedShape = null
        pseudoVillage = null
        shapeDropCell = [-1, -1]
        isLoadingBoard = false
        selectHandler.current = onSelect
        onLoadCanvasRef?.current?.classList.remove('active')
        clearCanvas(onLoadCanvasRef?.current as HTMLCanvasElement)
        eventBus().emit('actionEnd', null)
    }

    function clearCanvas(canvas: HTMLCanvasElement) {
        if (!canvas) canvas = canvasRef.current!
        if (!canvas) return
        const currCtx = canvas.getContext('2d')
        currCtx?.clearRect(0, 0, canvas.width, canvas.height)
    }

    function calcBoardSize() {
        const size = ranges.current.resolution.current
        if (!boardContainerRef?.current || !canvasRef?.current || !onLoadCanvasRef.current) return
        canvas = canvasRef.current
        const loaderCanvas = onLoadCanvasRef.current
        elBoardContainer = boardContainerRef.current
        ctx.current = canvas.getContext('2d') as CanvasRenderingContext2D
        if (!ctx.current) return
        gCols = Math.floor((elBoardContainer.offsetWidth - 2 * margin) / size)
        gRows = Math.floor((elBoardContainer.offsetHeight - 2 * margin) / size)
        if (isLoadingBoard) {
            isLoadingBoard = false
        }
        if (!village.current) village.current = boardService.getBoard(gRows, gCols, ranges.current.population.current) as string[][]
        else village.current = boardService.resizeBoard(village.current, [gRows, gCols])
        canvas.width = gCols * size
        canvas.height = gRows * size

        loaderCanvas.width = canvas.width
        loaderCanvas.height = canvas.height
        loaderCanvas.style.top = canvas.offsetTop + 'px'
        loaderCanvas.style.left = canvas.offsetLeft + 'px'
    }

    function renderBoard(context = ctx) {
        const size = ranges.current.resolution.current
        let highlightRowStart = lastHoveredCell[0]
        let highlightRowEnd = lastHoveredCell[0]
        let highlightColStart = lastHoveredCell[1]
        let highlightColEnd = lastHoveredCell[1]

        if (cornerStart?.length && cornerEnd?.length) {
            highlightRowStart = Math.min(cornerStart[0], cornerEnd[0])
            highlightRowEnd = Math.max(cornerStart[0], cornerEnd[0])
            highlightColStart = Math.min(cornerStart[1], cornerEnd[1])
            highlightColEnd = Math.max(cornerStart[1], cornerEnd[1])
        }

        for (let row = 0; row < gRows; row++) {
            for (let col = 0; col < gCols; col++) {
                context.current.beginPath()
                context.current.rect(col * size, row * size, size, size)
                context.current.fillStyle = (row >= highlightRowStart && row <= highlightRowEnd
                    && col >= highlightColStart && col <= highlightColEnd)
                    ? boardService.lighten(village.current[row][col])
                    : boardService.getCurrColor(village.current[row][col])
                context.current.lineWidth = .5
                context.current.stroke()
                context.current.fill()
            }
        }
    }

    function renderPseudoVillage(row: number, col: number) {
        if (!loadedShape) return
        const size = ranges.current.resolution.current
        const ctx = onLoadCanvasRef.current!.getContext('2d')!
        clearCanvas(onLoadCanvasRef.current as HTMLCanvasElement)
        clearCanvas(canvas)
        const { x, y } = boardService.getIsInfiniteAxis()
        // if (loadedShape.size[0] > ROWS || loadedShape.size[1] > COLS) loadedShape = boardService.resizeShape(loadedShape, [ROWS,COLS])
        if (!x && col + loadedShape.size[1] >= gCols) col = gCols - loadedShape.size[1] < 0 ? 0 : gCols - loadedShape.size[1]
        if (!y && row + loadedShape.size[0] >= gRows) row = gRows - loadedShape.size[0] < 0 ? 0 : gRows - loadedShape.size[0]
        pseudoVillage = boardService.getPseudoVillage([gRows, gCols], loadedShape, [row, col])
        if (!pseudoVillage) return
        for (let row = 0; row < gRows; row++) {
            for (let col = 0; col < gCols; col++) {
                ctx.beginPath()
                ctx.rect(col * size, row * size, size, size)
                if (pseudoVillage[row][col] === 'null') ctx.fillStyle = boardService.getCurrColor(village.current[row][col])
                else ctx.fillStyle = boardService.lighten(pseudoVillage[row][col])
                ctx.lineWidth = .5
                ctx.stroke()
                ctx.fill()
            }
        }
    }

    function snapCanvas() {

        const size = ranges.current.resolution.current
        const rowStart = shapeCorners[0][0] || 0
        const colStart = shapeCorners[0][1] || 0
        const rowEnd = shapeCorners[1][0] || gRows - 1
        const colEnd = shapeCorners[1][1] || gCols - 1
        if (!canvas) canvas = canvasRef.current!
        if (!pseudoCanvasRef.current) return
        const pseudoCtx = pseudoCanvasRef.current.getContext('2d')
        if (!pseudoCtx || !canvasCoverRef?.current || !pseudoCanvasWrapperRef?.current) return
        const width = (colEnd - colStart + 1) * size
        const height = (rowEnd - rowStart + 1) * size
        const top = canvas.offsetTop + rowStart * size
        const left = canvas.offsetLeft + colStart * size

        pseudoCanvasRef.current.width = width
        pseudoCanvasRef.current.height = height
        const transition = pseudoCanvasWrapperRef.current.style.transition
        pseudoCanvasWrapperRef.current.style.transition = 'none'

        pseudoCanvasWrapperRef.current.style.width = width + 'px'
        pseudoCanvasWrapperRef.current.style.height = height + 'px'
        pseudoCanvasWrapperRef.current.style.top = top + 'px'
        pseudoCanvasWrapperRef.current.style.left = left + 'px'

        for (let row = rowStart; row <= rowEnd; row++) {
            for (let col = colStart; col <= colEnd; col++) {
                pseudoCtx.beginPath()
                pseudoCtx.fillStyle = boardService.getCurrColor(village.current[row][col])
                pseudoCtx.rect((col - colStart) * size, (row - rowStart) * size, size, size)
                pseudoCtx.lineWidth = .5
                pseudoCtx.stroke()
                pseudoCtx.fill()
            }
        }
        setTimeout(() => {
            if (pseudoCanvasWrapperRef?.current?.style?.transition) pseudoCanvasWrapperRef.current.style.transition = transition
        }, 100);
    }

    useEffect(() => {
        console.log('board mounted')
        calcBoardSize()
        play()

        return () =>{
            console.log('board unmounted')
            removeOnChangeGameStateListener()
            removeOnToggleInfiniteAxisListener()
            removeOnStepListener()
            removeOnSetRangedValsListener()
            removeOnCancelSaveModeListener()
            removeOnSaveShapeListener()
            removeOnSaveModeListener()
            removeOnLoadShapeListener()
            removeOnLoadShapePositionListener()
            removeOnToggleSuperLifeListener()
            removeOnMenuToggledListener()
            window.removeEventListener('resize', onResize)
        }
    })

    const removeOnChangeGameStateListener = eventBus().on('onChangeGameState', ((state: { isOn: boolean } | null) => {
        if (!state?.isOn) return pause()
        isOn.current = state.isOn
        return isOn.current
            ? play()
            : pause()
    }))
    const removeOnToggleInfiniteAxisListener = eventBus().on('onToggleInfiniteAxis', (axis: string) => {
        boardService.setInfiniteProp(axis, !isInfinite[axis as keyof typeof isInfinite])
        isInfinite[axis as keyof typeof isInfinite] = !isInfinite[axis as keyof typeof isInfinite]
    })
    const removeOnStepListener = eventBus().on('onStep', onStep)
    const removeOnSetRangedValsListener = eventBus().on('onSetRangedVal', ({ percentage, rangeFor }: { percentage: number, rangeFor: string }) => {
        if (!ranges.current[rangeFor as keyof typeof ranges]) return
        const { max, min } = ranges.current[rangeFor as keyof typeof ranges]
        const range = max - min
        const current = rangeFor !== 'population'
            ? min + range * (100 - percentage) / 100
            : max - range * (100 - percentage) / 100
        ranges.current = { ...ranges.current, [rangeFor]: { min, max, current } }
        if (rangeFor === 'resolution') {
            calcBoardSize()
        } else if (rangeFor === 'population') village.current = boardService.getBoard(gRows, gCols, current)
        pause()
        if (isOn.current) play()
    })

    // shape/board listeners
    window.addEventListener('resize', onResize )
    function onResize(){
        if (isOn.current) pause()
        utilService.debounce(() => {
            calcBoardSize()
            if (isOn.current) play()
        }, 300)()
    }

    const removeOnCancelSaveModeListener = eventBus().on('cancelSaveMode', () => saveElementsContainer.current?.classList.remove('show'))
    const removeOnSaveShapeListener = eventBus().on('onSaveShape', onCaptureAndSave)
    const removeOnSaveModeListener = eventBus().on('onSaveMode', (isShape: boolean) => {
        onCancelLoad()
        pause()
        if (isShape) return onSaveShape()
        cornerStart = [0, 0]
        cornerEnd = [gRows - 1, gCols - 1]
        shapeCorners = [[...cornerStart], [...cornerEnd]]
        shapeFormattedCorners = boardService.getFormattedShapeCorners(shapeCorners, village.current)
        snapCanvas()
        saveElementsContainer?.current?.classList.toggle('show')
        cornerStart = null
        cornerEnd = null
    })
    const removeOnLoadShapeListener = eventBus().on('onLoadShape', onLoadShape)
    const removeOnLoadShapePositionListener = eventBus().on('onLoadShapePosition', (state: string) => {
        debugger
        switch (state) {
            case 'position':
                positionLoadedShape()
                break
            case 'reposition':
                shapeDropCell = [-1, -1]
                break
            default: onCancelLoad()
        }
    })

    // mode listeners
    const removeOnToggleSuperLifeListener = eventBus().on('toggleSuperLife', (state:boolean) => { isSuperMode = state })
    const removeOnMenuToggledListener = eventBus().on('menuToggled', () => onCancelLoad())


    return (
        <>
            <GameHeader eventBus={eventBus} />
            <section className="board-container relative flex column center" ref={boardContainerRef}>
                <Aside eventBus={eventBus} />

                <canvas ref={canvasRef} onMouseMove={onHover} onClick={onSelectHandler} onMouseLeave={() => {
                    lastHoveredCell = [-1, -1]
                    renderBoard()
                }}></canvas>
                <canvas className="pseudo-load-canvas absolute" onMouseMove={onLoadShapeHover} onClick={onSelectDropCell} ref={onLoadCanvasRef}></canvas>
                <div ref={saveElementsContainer} className="save-elements-container fixed" onClick={onCancelSave}>
                    <div ref={pseudoCanvasWrapperRef} className="canvas-wrapper absolute" onClick={ev => ev.stopPropagation()}>
                        <canvas ref={pseudoCanvasRef} ></canvas>
                        <div ref={canvasCoverRef} className="canvas-cover absolute flex center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 64 64"><path fill="currentColor" d="M56 2L18.8 42.9L8 34.7H2L18.8 62L62 2z" /></svg>
                        </div>
                    </div>
                </div>
            </section >
        </>
    )
}


