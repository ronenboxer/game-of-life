import { useRef } from "react";
import boardService, { Shape, Shapes } from "../services/board.service";
import { ShapePreview } from "./shape-preview";

interface ShapeListProps {
    type: string,
    shapes: Shapes,
    onTransformShape: Function,
    eventBus: Function,
    gResolution: number
}

export function ShapeList({ type, shapes, onTransformShape, eventBus, gResolution }: ShapeListProps) {

    // elements
    const shapeListRef = useRef<HTMLUListElement>(null)
    const TITLES = {
        factory: 'Factory shapes',
        shape: 'My shapes',
        board: 'My boards'
    }
    const CANVAS_PADDING = 22
    const canvasRefs = useRef([] as HTMLCanvasElement[])

    function clearCanvas(canvas: HTMLCanvasElement) {
        if (!canvas) return
        const currCtx = canvas.getContext('2d')
        currCtx?.clearRect(0, 0, canvas.width, canvas.height)
    }

    function expandMenu() {
        const shapeList = shapeListRef.current!
        shapeList.classList.toggle('expanded')
        if (!shapeList.classList.contains('expanded')) return
        eventBus().emit('reloadShapes', type)
        const canvases = canvasRefs.current
        if (!canvases) return
        canvases.forEach(canvas => {
            const name = canvas.dataset.name || ''
            renderSavedShape(canvas, name)
        })
    }

    function renderSavedShape(canvas: HTMLCanvasElement, name: string) {
        clearCanvas(canvas)
        const ctx = canvas.getContext('2d')
        if (!ctx || !shapeListRef?.current) return
        const shape = shapes[name]
        const totalWidth = shapeListRef!.current.offsetWidth - 2 * CANVAS_PADDING
        const calcCellWidth = totalWidth / shape.size[1]
        const resolution = calcCellWidth > gResolution
            ? gResolution
            : calcCellWidth
        canvas.width = resolution * shape.size[1]
        canvas.height = resolution * shape.size[0]

        let cellIdx = 0
        for (let row = 0; row < shape.size[0]; row++) {
            for (let col = 0; col < shape.size[1]; col++) {
                const currCell = cellIdx >= shape.cells.length ? null : shape.cells[cellIdx]
                ctx.beginPath()
                if (currCell && row === currCell.coords[0] && col === currCell.coords[1]) {
                    ctx.fillStyle = boardService.getCurrColor(currCell.state)
                    cellIdx++
                } else ctx.fillStyle = boardService.getCurrColor('dead')

                ctx.rect(col * resolution, row * resolution, resolution, resolution)
                ctx.lineWidth = .5
                ctx.stroke()
                ctx.fill()
            }
        }
    }

    eventBus().on('menuToggled', () => shapeListRef.current?.classList.remove('expanded'))

    return (
        <>
            <h2 className={`item-title relative flex between align-center ${type}`} onClick={() => expandMenu()}>
                <span>{TITLES[type as keyof typeof TITLES]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><rect x="0" y="0" width="24" height="24" fill="none" stroke="none" /><path fill="currentColor" d="M8.025 22L6.25 20.225L14.475 12L6.25 3.775L8.025 2l10 10Z" /></svg>
            </h2>
            <ul ref={shapeListRef} className={`shape-list dropdown-menu relative clean-list ${type}`}>
                {
                    Object.keys(shapes).length &&
                    Object.keys(shapes).map((name, idx) => <ShapePreview {...{ name, type, eventBus, gResolution, onTransformShape, idx }}
                        shape={shapes[name]} maxWidth={(shapeListRef.current?.offsetWidth || 255) - CANVAS_PADDING} key={idx + ':' + type + ':' + name} />)}
            </ul>
        </>
    )
}