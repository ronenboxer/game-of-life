import { useEffect, useRef, useState } from "react"
import boardService, { Shape } from "../services/board.service"
import { MenuIcon } from "./menu-icon"
import { ShapeList } from "./shape-list"

interface RangeInput {
    resolution: HTMLInputElement,
    speed: HTMLInputElement,
    population: HTMLInputElement
}

export function Aside({ eventBus }: { eventBus: Function }) {
    // elements
    const menuRef = useRef<HTMLElement>(null)

    // shapes
    const [shapesObj, setShapes] = useState({
        factory: boardService.getFactoryShapes(),
        shape: boardService.loadShapesFromStorage('shape'),
        board: boardService.loadShapesFromStorage('board')
    })

    // states
    const [isMenuActive, setIsMenuActive] = useState(false)

    // gameplay
    const [isInfiniteAxis, setIsInfiniteAxis] = useState({ x: true, y: true })
    const rangeInputRefs = useRef<RangeInput>({} as RangeInput)
    const [rangeVals, setRangeVals] = useState({ speed: 20, population: 22, resolution: 44 })
    const [gResolution] = useState(40)

    function toggleMenuActive() {
        setIsMenuActive(!isMenuActive)
        eventBus().emit('menuToggled', null)
    }

    function onToggleInfiniteAxis(axis: string) {
        setIsInfiniteAxis({ ...isInfiniteAxis, [axis]: !isInfiniteAxis[axis as keyof typeof isInfiniteAxis] })
        eventBus().emit('onToggleInfiniteAxis', axis)
    }

    function onSetRange(type: string) {
        const percentage = +rangeInputRefs.current[type as keyof typeof rangeInputRefs.current].value
        eventBus().emit('onSetRangedVal', { percentage, rangeFor: type })
        setRangeVals({ ...rangeVals, [type]: percentage })
    }

    function onLoadShapes(type = 'shape') {
        const shapes = type === 'factory'
            ? boardService.getFactoryShapes()
            : boardService.loadShapesFromStorage(type)
        setShapes(prevShapes => {
            return { ...prevShapes, [type]: shapes }
        })
    }

    function onTransformShape(type: string, name: string, refIdx: number, action: string, value: string) {
        setShapes(prevShapes => {
            let shape = prevShapes?.[type as keyof typeof prevShapes]?.[name] || null as unknown as Shape
            if (!shape) return prevShapes
            shape = boardService.transformShape(shape, action, value)
            prevShapes[type as keyof typeof prevShapes][name] = shape
            return { ...prevShapes }
        })
    }

    useEffect(() => {
        console.log('mounting aside')
        return () => {
            console.log('unmounting aside')
            removeOnSaveListener()
            removeOnSaveModeListener()
            removeOnLoadListener()
            removeOnReloadShapesListener()
            removeOnDeleteSavedShapeListener()
            document.removeEventListener('keydown', onEsc)
        }
    })

    const removeOnSaveListener = eventBus().on('onSaveEvent', onLoadShapes)
    const removeOnSaveModeListener = eventBus().on('onSaveMode', () => setIsMenuActive(false))
    const removeOnLoadListener = eventBus().on('onLoadShape', () => setIsMenuActive(false))
    const removeOnDeleteSavedShapeListener = eventBus().on('deleteSavedShape', ({ type, }: { type: string }) =>{
        setTimeout(() => {
            setShapes(prevShapes => ({...prevShapes, [type]:boardService.loadShapesFromStorage(type)}))
        }, 400);
    })

    const removeOnReloadShapesListener = eventBus().on('reloadShapes', (type?: string) => {
        if (type) setShapes(prevShapes => ({ ...prevShapes, [type]: boardService.loadShapesFromStorage(type) }))
        else setShapes({
            factory: boardService.getFactoryShapes(),
            shape: boardService.loadShapesFromStorage('shape'),
            board: boardService.loadShapesFromStorage('board')
        })
    })

    document.addEventListener('keydown', onEsc)
    function onEsc(ev: KeyboardEvent) { 
        if (ev.key === 'Escape') setIsMenuActive(false) 
    }

    return (
        <section className={`menu-screen fixed ${isMenuActive ? 'active' : ''}`} onClick={toggleMenuActive}>
            <aside ref={menuRef} className={`side-bar absolute  ${isMenuActive ? 'active' : ''}`} onClick={ev => ev.stopPropagation()}>
                <MenuIcon {...{ isMenuActive, toggleMenuActive }} />
                {['x', 'y'].map(axis => {
                    const val = isInfiniteAxis[axis as keyof typeof isInfiniteAxis]
                    return <div className={`infinite relative  ${axis}`} key={axis}>
                        <h2>{axis === 'x' ? 'Columns' : 'Rows'}</h2>
                        <label className="switch flex between align-center">
                            <span className={`title ${!val ? 'active' : ''}`} >Finite</span>
                            <input type="checkbox" checked={val} onChange={() => onToggleInfiniteAxis(axis)} />
                            <div>
                                <span></span>
                            </div>
                            <span className={`title ${val ? 'active' : ''}`}>Infinite</span>
                        </label>
                    </div>
                })}

                {['speed', 'population', 'resolution'].map((type, idx) => <div className={`range-slider relative flex wrap align-center ${type}`} key={idx + ':' + type}>
                    <label className="capitalize" htmlFor={type}>{type}</label>
                    <input className="range-slider__range" type="range" id={type} defaultValue={rangeVals[type as keyof typeof rangeVals]} min="0" max="100"
                        ref={ref => rangeInputRefs.current[type as keyof typeof rangeInputRefs.current] = ref as unknown as HTMLInputElement}
                        onChange={() => onSetRange(type)} />
                    <span className="range-slider__value">{rangeVals[type as keyof typeof rangeVals] + '%'}</span>
                </div>)}
                {Object.keys(shapesObj).map((type, idx) => <ShapeList key={idx + ':' + type} {...{ eventBus, type, onTransformShape }} shapes={shapesObj[type as keyof typeof shapesObj]} gResolution={gResolution} />)}
            </aside >
        </section>
    )
}
