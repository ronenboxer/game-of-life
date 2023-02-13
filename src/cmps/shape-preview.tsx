import { useEffect, useRef } from "react"
import { ShapeShifter } from "./shape-shifter"
import boardService, { Shape } from '../services/board.service'

interface ShapePreviewProps {
    type: string,
    idx: number,
    shape: Shape,
    name: string,
    eventBus: Function,
    maxWidth: number,
    gResolution: number,
    onTransformShape: Function
}

export function ShapePreview({ type, idx, shape, name, eventBus, maxWidth, gResolution, onTransformShape }: ShapePreviewProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const savedShapeRef = useRef<HTMLLIElement>(null)

    function onLoadShape() { eventBus().emit('onLoadShape', { shape, isBoard: type === 'board' }) }

    function clearCanvas(canvas: HTMLCanvasElement) {
        if (!canvas) return
        const currCtx = canvas.getContext('2d')
        currCtx?.clearRect(0, 0, canvas.width, canvas.height)
    }

    function renderCanvas(canvas: HTMLCanvasElement) {
        if (!canvas) return
        clearCanvas(canvas)
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const calcCellWidth = maxWidth / shape.size[1]
        const calcCellHeight = maxWidth / shape.size[0]
        const resolution = Math.min(calcCellWidth, calcCellHeight) > gResolution
            ? gResolution
            : Math.min(calcCellWidth, calcCellHeight)
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

    useEffect(() => {
        if (!canvasRef?.current) return
        renderCanvas(canvasRef.current)
        return () => {
            removeOnTransformShapeListener()
            removeOnDeleteSavedShapeListener()
        }
    })

    const removeOnTransformShapeListener = eventBus().on('onTransformShape', onTransformShape)
    const removeOnDeleteSavedShapeListener = eventBus().on('deleteSavedShape', ({ type: typeToDelete, idx: idxToDelete, name: nameToDelete }: { type: string, name: string, idx: number }) => {
        if (idx === idxToDelete &&
            type === typeToDelete &&
            name === nameToDelete) {
            savedShapeRef.current?.classList.add('deleted')
            boardService.removeShapeFromStorage(type, name)
        }
    })

    return (
        <li className="saved-shape flex column center" ref={savedShapeRef}>
            <div className="shape-header flex between align center relative">
                <h2>{name}</h2>
            </div>
            <ShapeShifter {...{ name, type, idx, eventBus, onTransformShape }} />
            <canvas onClick={onLoadShape}
                ref={canvasRef} data-name={name} data-type={type} />
        </li>
    )
}