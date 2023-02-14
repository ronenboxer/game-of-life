import { useEffect, useRef } from "react";
import boardService, { Shapes } from "../services/board.service";
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

    function expandMenu() {
        const shapeList = shapeListRef.current!
        shapeList.classList.toggle('expanded')
        if (!shapeList.classList.contains('expanded')) return
        eventBus().emit('reloadShapes', type)
    }

    useEffect(() => {
        const removeOnMenuToggledListener = eventBus().on('menuToggled', () => shapeListRef.current?.classList.remove('expanded'))
        
        return () => {
            removeOnMenuToggledListener()
        }
    }, [])

    return (
        <>
            <h2 className={`item-title relative flex between align-center ${type}`} onClick={() => expandMenu()}>
                <span>{TITLES[type as keyof typeof TITLES]}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><rect x="0" y="0" width="24" height="24" fill="none" stroke="none" /><path fill="currentColor" d="M8.025 22L6.25 20.225L14.475 12L6.25 3.775L8.025 2l10 10Z" /></svg>
            </h2>
            <ul ref={shapeListRef} className={`shape-list dropdown-menu relative clean-list ${type} ${!Object.keys(shapes).length ? 'empty flex' : ''}`}>
                {Object.keys(shapes).length
                    ? Object.keys(shapes).map((name, idx) => <ShapePreview {...{ name, type, eventBus, gResolution, onTransformShape, idx }}
                        shape={shapes[name]} maxWidth={(shapeListRef.current?.offsetWidth || 255) - CANVAS_PADDING} key={idx + ':' + type + ':' + name} />)
                    : <h2>I'm an empty list</h2>
                }
            </ul>
        </>
    )
}