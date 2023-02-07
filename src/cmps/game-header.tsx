import Flickity from "flickity"
import { FormEvent, useEffect, useRef, useState } from "react"
import { NavLink } from "react-router-dom"
import { Logo } from "./logo"

export function GameHeader({ eventBus }: { eventBus: Function }) {

    const [isSaveShapeMode, setIsSaveShapeMode] = useState('')
    const [isOn, setIsOn] = useState(true)
    const [isGameOnBeforeAction, setIsGameOnBeforeAction] = useState(true)
    const [isSuperLife, setIsSuperLife] = useState(false)
    const buttonAnimRef = useRef({} as { play: SVGAnimateElement, pause: SVGAnimateElement })
    const shapeNameInputRef = useRef<HTMLInputElement>(null)
    const saveShapeFormRef = useRef<HTMLFormElement>(null)
    const instructionsRef = useRef<HTMLParagraphElement>(null)
    const [isShapePositioned, setIsShapePositioned] = useState(false)

    let flkty: Flickity

    function onSubmitSavedShape(ev: FormEvent) {
        ev.preventDefault()
        eventBus().emit('onSaveShape', { isShape: isSaveShapeMode === 'shape', name: shapeNameInputRef.current!.value || 'My shape' })
        setIsSaveShapeMode('')
        if (!flkty) signToFlickity()
        flkty.select(1)
        setTimeout(() => {
            saveShapeFormRef!.current!.hidden = true
            instructionsRef!.current!.hidden = false
            shapeNameInputRef.current!.value = ''
        }, 500)
    }

    function onCancelSaveMode() {
        if (!flkty) signToFlickity()
        flkty.select(1)
        setIsOn(isGameOnBeforeAction)
        setIsSaveShapeMode('')
        eventBus().emit('cancelSaveMode', null)
        eventBus().emit('onChangeGameState', { isOn: isGameOnBeforeAction })
        setTimeout(() => {
            saveShapeFormRef!.current!.hidden = true
            instructionsRef!.current!.hidden = false
            shapeNameInputRef.current!.value = ''
        }, 500)
    }

    function onSaveShapeMode(isShape = true) {
        eventBus().emit('onSaveMode', isShape)
        if (!isShape) {
            saveShapeFormRef!.current!.hidden = false
            instructionsRef!.current!.hidden = true
        }
        if (!flkty) signToFlickity()
        flkty.select(2)
        setIsOn(false)
        setIsSaveShapeMode(isShape ? 'shape' : 'board')
    }

    function onTogglePlayPause(nextState?: { isOn: boolean }) {
        const next = nextState ? nextState.isOn : !isOn
        eventBus().emit('onChangeGameState', { isOn: next })
        if (!nextState) setIsGameOnBeforeAction(next)
        if (!next) buttonAnimRef.current.play.beginElement()
        else buttonAnimRef.current.pause.beginElement()
        setIsOn(next)
    }

    function onToggleSuperLife() {
        if (isSuperLife) eventBus().emit('endSuperLife', null)
        else eventBus().emit('onSuperLife', null)
        setIsSuperLife(lastState => !lastState)
    }

    function onStep() {
        eventBus().emit('onStep', null)
    }

    function signToFlickity() {
        flkty = new Flickity('.game-header', {
            draggable: false,
            freeScroll: false,
            wrapAround: true,
            groupCells: false,
            contain: true,
            cellAlign: 'left',
            prevNextButtons: false,
            pageDots: false
        })
    }

    useEffect(() => {
        signToFlickity()
        flkty.select(1)
    }, [])

    eventBus().on('actionEnd', () => {
        setIsOn(isGameOnBeforeAction)
        setIsSaveShapeMode('')
        eventBus().emit('onChangeGameState', { isOn: isGameOnBeforeAction })
        if (!flkty) signToFlickity()
        flkty.select(1)
        saveShapeFormRef!.current!.hidden = true
        instructionsRef!.current!.hidden = false
    })
    eventBus().on('actionStart', () => {
        setIsOn(false)
        eventBus().emit('onChangeGameState', { isOn: false })
    })
    eventBus().on('cornersSelected', () => {
        saveShapeFormRef!.current!.hidden = false
        instructionsRef!.current!.hidden = true
    })
    eventBus().on('menuToggled', () => onCancelSaveMode())
    eventBus().on('onLoadShape', () => {
        if (!flkty) signToFlickity()
        flkty.select(0)
    })
    eventBus().on('shapePositioned', () => setIsShapePositioned(true))

    return (
        <header className="game-header">
            <div className="gallery-cell">
                <div className="load-header main-layout">
                    <div className="confirm-load">
                        <button className={`submit-button ${isShapePositioned ? 'positioned' : ''}`} onClick={() => eventBus().emit('onLoadShapePosition', 'position')}>Place here</button>
                        <button className="submit-button" onClick={() => {
                            setIsShapePositioned(false)
                            eventBus().emit('onLoadShapePosition', 'reposition')
                        }}>New position</button>
                    </div>
                    <button className="cancel-button absolute" onClick={() => eventBus().emit('onLoadShapePosition', 'cancel')}>
                        <svg className="flex center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="M208.5 191.5a12 12 0 0 1 0 17a12.1 12.1 0 0 1-17 0L128 145l-63.5 63.5a12.1 12.1 0 0 1-17 0a12 12 0 0 1 0-17L111 128L47.5 64.5a12 12 0 0 1 17-17L128 111l63.5-63.5a12 12 0 0 1 17 17L145 128Z" /></svg>
                    </button>
                </div>
            </div>
            <div className="gallery-cell">
                <nav className="game-control main-layout relative flex warp align-center">
                    <button className="play-pause relative controller" disabled={!!isSaveShapeMode} onClick={() => onTogglePlayPause()}>
                        <svg className="absolute" width="104" height="104" id='pause'>
                            <circle className={`play-pause ${isOn ? '' : 'play'} `} id="circle" cx="51" cy="51" r="50" strokeDasharray="314" strokeDashoffset="0" style={{ strokeWidth: '6px', stroke: 'currentColor' }} />
                            <line id='line1' x1="38" y1="30" x2="38" y2="70" style={{ strokeWidth: '4px', stroke: 'currentColor', strokeLinecap: 'round' }} />
                            <path id='line2' d="M 66 30 L 66 50 L 66 70" rx="10" ry="10" style={{ strokeWidth: '4px', stroke: 'currentColor', fill: 'currentColor', strokeLinejoin: 'round', strokeLinecap: 'round' }}>
                                <animate
                                    ref={ref => buttonAnimRef.current.play = ref as SVGAnimateElement}
                                    attributeName="d"
                                    dur="300ms"
                                    from="M 66 30 L 66 50 L 66 70"
                                    to="M 38 30 L 70 50 L 38 70"
                                    begin="indefinite"
                                    fill="freeze"
                                    id="from_pause_to_play"
                                />
                            </path>
                            <animate
                                ref={ref => buttonAnimRef.current.pause = ref as SVGAnimateElement}
                                xlinkHref="#line2"
                                attributeName="d"
                                dur="300ms"
                                from="M 38 30 L 70 50 L 38 70"
                                to="M 66 30 L 66 50 L 66 70"
                                fill="freeze"
                                id="from_play_to_pause"
                                begin="indefinite"
                            /></svg>
                    </button>
                    <button className="flex center controller" disabled={isOn} onClick={onStep}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="currentColor" d="M16 8a2 2 0 1 1 0 4a2 2 0 0 1 0-4ZM2 10a.5.5 0 0 1 .5-.5h7.793L7.146 6.354a.5.5 0 1 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708l3.147-3.146H2.5A.5.5 0 0 1 2 10Z" /></svg>
                    </button>
                    <button className={`flex center controller ${isSuperLife ? 'active' : ''} `} onClick={onToggleSuperLife}>
                        {isSuperLife
                            ? <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 16q2.55-2.3 3.275-3.238Q16 11.825 16 10.9q0-.9-.65-1.55T13.8 8.7q-.525 0-1.012.212q-.488.213-.788.588q-.3-.375-.775-.588Q10.75 8.7 10.2 8.7q-.9 0-1.55.65T8 10.9q0 .475.125.875t.55.937q.425.538 1.212 1.313Q10.675 14.8 12 16Zm0 6q-3.475-.875-5.737-3.988Q4 14.9 4 11.1V5l8-3l8 3v6.1q0 3.8-2.262 6.912Q15.475 21.125 12 22Z" /></svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 16q2.55-2.3 3.275-3.238Q16 11.825 16 10.9q0-.9-.65-1.55T13.8 8.7q-.525 0-1.012.212q-.488.213-.788.588q-.3-.375-.775-.588Q10.75 8.7 10.2 8.7q-.9 0-1.55.65T8 10.9q0 .475.125.875t.55.937q.425.538 1.212 1.313Q10.675 14.8 12 16Zm0 6q-3.475-.875-5.737-3.988Q4 14.9 4 11.1V5l8-3l8 3v6.1q0 3.8-2.262 6.912Q15.475 21.125 12 22Zm0-2.1q2.6-.825 4.3-3.3q1.7-2.475 1.7-5.5V6.375l-6-2.25l-6 2.25V11.1q0 3.025 1.7 5.5t4.3 3.3Zm0-7.9Z" /></svg>}
                    </button>
                    <button className="wide flex center capitalize" onClick={() => onSaveShapeMode(true)}><span>Save shape</span></button>
                    <button className="wide flex center capitalize" onClick={() => onSaveShapeMode(false)}><span>Save board</span></button>
                    <button className="wide flex center" onClick={() => {
                        eventBus().emit('onSetRangedVal', { percentage: 0, rangeFor: 'population' })
                        onTogglePlayPause({ isOn: false })
                    }}><span>Clear</span></button>
                </nav>
            </div>
            <div className="gallery-cell">
                <div className="save-header main-layout">
                    <form onSubmit={onSubmitSavedShape} ref={saveShapeFormRef} hidden>
                        <label htmlFor="shape-name">Enter a name for your shape</label>
                        <input ref={shapeNameInputRef} type="text" id="shape-name" required autoFocus placeholder="Text" />
                        <button className="submit-button">
                            <svg className="flex center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 64 64"><path fill="currentColor" d="M56 2L18.8 42.9L8 34.7H2L18.8 62L62 2z" /></svg>
                        </button>
                    </form>
                    <p ref={instructionsRef} className="save-instructions">Click on 2 different cells and click save</p>
                    <button className="cancel-button absolute" onClick={onCancelSaveMode}>
                        <svg className="flex center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="M205.7 194.3a8.1 8.1 0 0 1 0 11.4a8.2 8.2 0 0 1-11.4 0L128 139.3l-66.3 66.4a8.2 8.2 0 0 1-11.4 0a8.1 8.1 0 0 1 0-11.4l66.4-66.3l-66.4-66.3a8.1 8.1 0 0 1 11.4-11.4l66.3 66.4l66.3-66.4a8.1 8.1 0 0 1 11.4 11.4L139.3 128Z" /></svg>
                    </button>
                </div>
            </div>
        </header >
    )

}