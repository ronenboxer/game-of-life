import Flickity from "flickity"
import { FormEvent, useEffect, useRef, useState } from "react"

interface headerProps {
    eventBus: Function,
    isOn: React.MutableRefObject<boolean>,
    isOnPriorToAction: React.MutableRefObject<boolean>,
    play: Function,
    pause: Function
}

export function GameHeader({ eventBus, isOn, isOnPriorToAction, play, pause }: headerProps) {

    const [isSaveShapeMode, setIsSaveShapeMode] = useState('')
    const [isSuperLife, setIsSuperLife] = useState(false)
    const buttonAnimRef = useRef({} as { play: SVGAnimateElement, pause: SVGAnimateElement })
    const shapeNameInputRef = useRef(null as unknown as HTMLInputElement)
    const saveShapeFormRef = useRef(null as unknown as HTMLFormElement)
    const instructionsRef = useRef(null as unknown as HTMLParagraphElement)
    const [isShapePositioned, setIsShapePositioned] = useState(false)

    let flkty: Flickity

    function onSubmitSavedShape(ev: FormEvent) {
        ev.preventDefault()
        eventBus().emit('onSaveShape', { isShape: isSaveShapeMode === 'shape', name: shapeNameInputRef.current!.value || 'My shape' })
        setIsSaveShapeMode('')
        if (!flkty) signToFlickity()
        flkty.select(0)
        setTimeout(() => {
            if (saveShapeFormRef?.current) saveShapeFormRef.current.hidden = true
            instructionsRef!.current!.hidden = false
            shapeNameInputRef.current!.value = ''
        }, 500)
    }

    function onCancelSaveMode() {
        if (!flkty) signToFlickity()
        flkty.select(0)
        handleStateAnimation({ state: isOnPriorToAction.current })
        if (isOnPriorToAction.current && !isOn.current) play()
        isOn.current = (isOnPriorToAction.current)
        setIsSaveShapeMode('')
        eventBus().emit('cancelSaveMode')
        setTimeout(() => {
            if (saveShapeFormRef?.current) saveShapeFormRef.current.hidden = true
            instructionsRef!.current!.hidden = false
            shapeNameInputRef.current!.value = ''
        }, 500)
    }

    function onSaveShapeMode(type = 'shape') {
        if (!saveShapeFormRef?.current) return
        handleStateAnimation({ state: false })
        eventBus().emit('onSaveMode', type === 'shape')
        if (type === 'board') {
            saveShapeFormRef.current.hidden = false
            instructionsRef!.current!.hidden = true
        }
        if (!flkty) signToFlickity()
        flkty.select(1)
        isOn.current = false
        pause()
        setIsSaveShapeMode(type)
    }

    function onTogglePlayPause(nextState?: { isOn: boolean }) {
        const next = nextState ? nextState.isOn : !isOn.current
        handleStateAnimation({ state: next })
        if (!nextState) isOnPriorToAction.current = (next)
        if (next !== isOn.current) next ? play() : pause()
        isOn.current = (next)
    }

    function onToggleSuperLife() {
        eventBus().emit('toggleSuperLife', !isSuperLife)
        setIsSuperLife(lastState => !lastState)
    }

    function onStep() { eventBus().emit('onStep', null) }

    function signToFlickity() {
        flkty = new Flickity('.carousel', {
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

    function handleStateAnimation({ state } = { state: isOn.current }) {
        if (state === isOn.current) return
        if (state) buttonAnimRef.current.pause.beginElement()
        else buttonAnimRef.current.play.beginElement()
    }

    useEffect(() => {
        console.log('header mounted')
        signToFlickity()
        const removeOnActionEndListener = eventBus().on('actionEnd', () => {
            handleStateAnimation({ state: isOnPriorToAction.current })
            setIsSaveShapeMode('')
            if (!flkty) signToFlickity()
            flkty.select(0)
            if (saveShapeFormRef?.current) saveShapeFormRef.current.hidden = true
            instructionsRef!.current!.hidden = false
        })
        const removeOnActionStartListener = eventBus().on('actionStart', () => handleStateAnimation({ state: false }))
        const removeOnCornersSelectedListener = eventBus().on('cornersSelected', () => {
            if (saveShapeFormRef?.current) saveShapeFormRef.current.hidden = false
            instructionsRef!.current!.hidden = true
        })
        const removeOnMenuToggledListener = eventBus().on('menuToggled', () => onCancelSaveMode())
        const removeOnLoadShapeListener = eventBus().on('onLoadShape', () => {
            if (!flkty) signToFlickity()
            flkty.select(2)
        })
        const removeOnShapePositionedListener = eventBus().on('shapePositioned', () => setIsShapePositioned(true))

        return () => {
            console.log('header unmounted')
            removeOnActionEndListener()
            removeOnActionStartListener()
            removeOnCornersSelectedListener()
            removeOnLoadShapeListener()
            removeOnMenuToggledListener()
            removeOnShapePositionedListener()
        }
    }, [])

    return (
        <>
            {window.innerWidth > 600 &&
                <header className="game-header carousel">
                    <div className="gallery-cell">
                        <nav className="game-control main-layout relative flex warp align-center">
                            <button className="play-pause relative controller" disabled={!!isSaveShapeMode} onClick={() => onTogglePlayPause()}>
                                <svg className="absolute" width="104" height="104" id='pause'>
                                    <circle className={`play-pause ${isOn.current ? '' : 'play'} `} id="circle" cx="51" cy="51" r="50" strokeDasharray="314" strokeDashoffset="0" style={{ strokeWidth: '6px', stroke: 'currentColor' }} />
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
                            <button className="flex center controller" disabled={isOn.current} onClick={onStep}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="currentColor" d="M16 8a2 2 0 1 1 0 4a2 2 0 0 1 0-4ZM2 10a.5.5 0 0 1 .5-.5h7.793L7.146 6.354a.5.5 0 1 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708l3.147-3.146H2.5A.5.5 0 0 1 2 10Z" /></svg>
                            </button>
                            <button className={`flex center superlife controller ${isSuperLife ? 'active' : ''} `} onClick={onToggleSuperLife}>
                                {isSuperLife
                                    ? <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 16q2.55-2.3 3.275-3.238Q16 11.825 16 10.9q0-.9-.65-1.55T13.8 8.7q-.525 0-1.012.212q-.488.213-.788.588q-.3-.375-.775-.588Q10.75 8.7 10.2 8.7q-.9 0-1.55.65T8 10.9q0 .475.125.875t.55.937q.425.538 1.212 1.313Q10.675 14.8 12 16Zm0 6q-3.475-.875-5.737-3.988Q4 14.9 4 11.1V5l8-3l8 3v6.1q0 3.8-2.262 6.912Q15.475 21.125 12 22Z" /></svg>
                                    : <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 16q2.55-2.3 3.275-3.238Q16 11.825 16 10.9q0-.9-.65-1.55T13.8 8.7q-.525 0-1.012.212q-.488.213-.788.588q-.3-.375-.775-.588Q10.75 8.7 10.2 8.7q-.9 0-1.55.65T8 10.9q0 .475.125.875t.55.937q.425.538 1.212 1.313Q10.675 14.8 12 16Zm0 6q-3.475-.875-5.737-3.988Q4 14.9 4 11.1V5l8-3l8 3v6.1q0 3.8-2.262 6.912Q15.475 21.125 12 22Zm0-2.1q2.6-.825 4.3-3.3q1.7-2.475 1.7-5.5V6.375l-6-2.25l-6 2.25V11.1q0 3.025 1.7 5.5t4.3 3.3Zm0-7.9Z" /></svg>}
                            </button>
                            <button className="wide flex center capitalize" onClick={() => onSaveShapeMode('shape')}><span>Save shape</span></button>
                            <button className="wide flex center capitalize" onClick={() => onSaveShapeMode('board')}><span>Save board</span></button>
                            <button className="wide flex center" onClick={() => {
                                eventBus().emit('onSetRangedVal', { percentage: 0, rangeFor: 'population' })
                                onTogglePlayPause({ isOn: false })
                            }}><span>Clear</span></button>
                        </nav>
                    </div>
                    <div className="gallery-cell">
                        <div className="save-header main-layout">
                            <form onSubmit={onSubmitSavedShape} ref={(ref: HTMLFormElement) => {
                                if (ref) saveShapeFormRef.current = ref
                            }} hidden>
                                <label htmlFor="shape-name">Enter a name for your shape</label>
                                <input ref={(ref: HTMLInputElement) => {
                                    if (ref) shapeNameInputRef.current = ref
                                }} type="text" id="shape-name" required autoFocus placeholder={isSaveShapeMode === 'shape' ? 'Shape name' : 'Board name'} />
                                <button className="submit-button">
                                    <svg className="flex center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 64 64"><path fill="currentColor" d="M56 2L18.8 42.9L8 34.7H2L18.8 62L62 2z" /></svg>
                                </button>
                            </form>
                            <p ref={(ref: HTMLParagraphElement) => {
                                if (ref) instructionsRef.current = ref
                            }} className="save-instructions">Select 2 cells and click save</p>
                            <button className="cancel-button absolute" onClick={onCancelSaveMode}>
                                <svg className="flex center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="M205.7 194.3a8.1 8.1 0 0 1 0 11.4a8.2 8.2 0 0 1-11.4 0L128 139.3l-66.3 66.4a8.2 8.2 0 0 1-11.4 0a8.1 8.1 0 0 1 0-11.4l66.4-66.3l-66.4-66.3a8.1 8.1 0 0 1 11.4-11.4l66.3 66.4l66.3-66.4a8.1 8.1 0 0 1 11.4 11.4L139.3 128Z" /></svg>
                            </button>
                        </div>
                    </div>
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
                </header >}
            {window.innerWidth <= 600 && <header className="game-header">
                <nav className="game-control top main-layout relative flex warp align-center">
                    <button className="play-pause relative controller" disabled={!!isSaveShapeMode} onClick={() => onTogglePlayPause()} title="Play / Pause">
                        <svg className="absolute" width="104" height="104" id='pause'>
                            <circle className={`play-pause ${isOn.current ? '' : 'play'} `} id="circle" cx="51" cy="51" r="50" strokeDasharray="314" strokeDashoffset="0" style={{ strokeWidth: '6px', stroke: 'currentColor' }} />
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
                            />
                        </svg>
                    </button>
                    <button className="flex center controller" disabled={isOn.current} onClick={onStep} title="One Step forward">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 20 20"><path fill="currentColor" d="M16 8a2 2 0 1 1 0 4a2 2 0 0 1 0-4ZM2 10a.5.5 0 0 1 .5-.5h7.793L7.146 6.354a.5.5 0 1 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708l3.147-3.146H2.5A.5.5 0 0 1 2 10Z" /></svg>
                    </button>
                    <button className={`flex center controller superlife ${isSuperLife ? 'active' : ''} `} onClick={onToggleSuperLife} title="Superlife Mode">
                        {isSuperLife
                            ? <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 16q2.55-2.3 3.275-3.238Q16 11.825 16 10.9q0-.9-.65-1.55T13.8 8.7q-.525 0-1.012.212q-.488.213-.788.588q-.3-.375-.775-.588Q10.75 8.7 10.2 8.7q-.9 0-1.55.65T8 10.9q0 .475.125.875t.55.937q.425.538 1.212 1.313Q10.675 14.8 12 16Zm0 6q-3.475-.875-5.737-3.988Q4 14.9 4 11.1V5l8-3l8 3v6.1q0 3.8-2.262 6.912Q15.475 21.125 12 22Z" /></svg>
                            : <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 16q2.55-2.3 3.275-3.238Q16 11.825 16 10.9q0-.9-.65-1.55T13.8 8.7q-.525 0-1.012.212q-.488.213-.788.588q-.3-.375-.775-.588Q10.75 8.7 10.2 8.7q-.9 0-1.55.65T8 10.9q0 .475.125.875t.55.937q.425.538 1.212 1.313Q10.675 14.8 12 16Zm0 6q-3.475-.875-5.737-3.988Q4 14.9 4 11.1V5l8-3l8 3v6.1q0 3.8-2.262 6.912Q15.475 21.125 12 22Zm0-2.1q2.6-.825 4.3-3.3q1.7-2.475 1.7-5.5V6.375l-6-2.25l-6 2.25V11.1q0 3.025 1.7 5.5t4.3 3.3Zm0-7.9Z" /></svg>}
                    </button>
                </nav>
                <div className="carousel">
                    <div className="gallery-cell">
                        <nav className="game-control main-layout relative flex warp align-center">
                            <button className="flex center capitalize" onClick={() => onSaveShapeMode('shape')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="currentColor" d="M8.5 1.5A1.5 1.5 0 0 1 10 0h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h6c-.314.418-.5.937-.5 1.5v7.793L4.854 6.646a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l3.5-3.5a.5.5 0 0 0-.708-.708L8.5 9.293V1.5z" /></svg>
                            </button>
                            <button className="flex center capitalize" onClick={() => onSaveShapeMode('board')}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 36 36"><path fill="currentColor" d="m18 19.84l6.38-6.35A1 1 0 1 0 23 12.08L19 16V4a1 1 0 1 0-2 0v12l-4-3.95a1 1 0 0 0-1.41 1.42Z" className="clr-i-solid clr-i-solid-path-1" /><path fill="currentColor" d="m19.41 21.26l-.74.74h15.26c-.17-.57-.79-2.31-3.09-8.63A1.94 1.94 0 0 0 28.93 12h-2.38a3 3 0 0 1-.76 2.92Z" className="clr-i-solid clr-i-solid-path-2" /><path fill="currentColor" d="m16.58 21.26l-6.38-6.35A3 3 0 0 1 9.44 12H7.07a1.92 1.92 0 0 0-1.9 1.32c-2.31 6.36-2.93 8.11-3.1 8.68h15.26Z" className="clr-i-solid clr-i-solid-path-3" /><path fill="currentColor" d="M2 24v6a2 2 0 0 0 2 2h28a2 2 0 0 0 2-2v-6Zm28 4h-4v-2h4Z" className="clr-i-solid clr-i-solid-path-4" /><path fill="none" d="M0 0h36v36H0z" /></svg>
                            </button>
                            <button className="flex center" onClick={() => {
                                eventBus().emit('onSetRangedVal', { percentage: 0, rangeFor: 'population' })
                                onTogglePlayPause({ isOn: false })
                            }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 32 32"><path fill="currentColor" d="M26 20h-6v-2h6zm4 8h-6v-2h6zm-2-4h-6v-2h6z" /><path fill="currentColor" d="M17.003 20a4.895 4.895 0 0 0-2.404-4.173L22 3l-1.73-1l-7.577 13.126a5.699 5.699 0 0 0-5.243 1.503C3.706 20.24 3.996 28.682 4.01 29.04a1 1 0 0 0 1 .96h14.991a1 1 0 0 0 .6-1.8c-3.54-2.656-3.598-8.146-3.598-8.2Zm-5.073-3.003A3.11 3.11 0 0 1 15.004 20c0 .038.002.208.017.469l-5.9-2.624a3.8 3.8 0 0 1 2.809-.848ZM15.45 28A5.2 5.2 0 0 1 14 25h-2a6.5 6.5 0 0 0 .968 3h-2.223A16.617 16.617 0 0 1 10 24H8a17.342 17.342 0 0 0 .665 4H6c.031-1.836.29-5.892 1.803-8.553l7.533 3.35A13.025 13.025 0 0 0 17.596 28Z" /></svg>
                            </button>
                        </nav>
                    </div>
                    <div className="gallery-cell">
                        <div className="save-header main-layout">
                            <form onSubmit={onSubmitSavedShape} ref={(ref: HTMLFormElement) => {
                                if (ref) saveShapeFormRef.current = ref
                            }} hidden>
                                <input ref={(ref: HTMLInputElement) => {
                                    if (ref) shapeNameInputRef.current = ref
                                }} type="text" id="shape-name" required autoFocus placeholder={isSaveShapeMode === 'shape' ? 'Shape name' : 'Board name'} />
                                <button className="submit-button">
                                    <svg className="flex center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 64 64"><path fill="currentColor" d="M56 2L18.8 42.9L8 34.7H2L18.8 62L62 2z" /></svg>
                                </button>
                            </form>
                            <p ref={(ref: HTMLParagraphElement) => {
                                if (ref) instructionsRef.current = ref
                            }} className="save-instructions">Select 2 cells to save</p>
                            <button className="cancel-button absolute" onClick={onCancelSaveMode}>
                                <svg className="flex center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="M205.7 194.3a8.1 8.1 0 0 1 0 11.4a8.2 8.2 0 0 1-11.4 0L128 139.3l-66.3 66.4a8.2 8.2 0 0 1-11.4 0a8.1 8.1 0 0 1 0-11.4l66.4-66.3l-66.4-66.3a8.1 8.1 0 0 1 11.4-11.4l66.3 66.4l66.3-66.4a8.1 8.1 0 0 1 11.4 11.4L139.3 128Z" /></svg>
                            </button>
                        </div>
                    </div>
                    <div className="gallery-cell">
                        <div className="load-header main-layout">
                            <div className="confirm-load">
                                <button className={`submit-button ${isShapePositioned ? 'positioned' : ''}`} onClick={() => eventBus().emit('onLoadShapePosition', 'position')}>
                                    <svg className="flex center" xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24"><path fill="currentColor" fillRule="evenodd" d="M19 12.87c0-.47-.34-.85-.8-.98A2.997 2.997 0 0 1 16 9V4h1c.55 0 1-.45 1-1s-.45-1-1-1H7c-.55 0-1 .45-1 1s.45 1 1 1h1v5c0 1.38-.93 2.54-2.2 2.89c-.46.13-.8.51-.8.98V13c0 .55.45 1 1 1h4.98l.02 7c0 .55.45 1 1 1s1-.45 1-1l-.02-7H18c.55 0 1-.45 1-1v-.13z" /></svg>
                                </button>
                                <button className="submit-button" onClick={() => {
                                    setIsShapePositioned(false)
                                    eventBus().emit('onLoadShapePosition', 'reposition')
                                }}>
                                    <svg className="flex center" xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24"><path fill="currentColor" d="m9 9l7 7h-3v4l-1 3l-1-3v-4H7a1 1 0 0 1-1-1v-1.586a1 1 0 0 1 .293-.707L9 10V9zm7-7a1 1 0 0 1 1 1v.382a1 1 0 0 1-.553.894L15 5v5l2.707 2.707a1 1 0 0 1 .293.707V15a.997.997 0 0 1-.076.383L12.27 9.73L9 6.46V5l-1.447-.724A1 1 0 0 1 7 3.382V3a1 1 0 0 1 1-1h8z" /><path fill="currentColor" d="M1.635 2.905a.9.9 0 0 0 0 1.27l18.19 18.19a.898.898 0 0 0 1.27-1.27L11 11L2.905 2.905a.898.898 0 0 0-1.27 0z" /></svg>
                                </button>
                            </div>
                            <button className="cancel-button absolute" onClick={() => eventBus().emit('onLoadShapePosition', 'cancel')} >
                                <svg className="flex center" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256"><path fill="currentColor" d="M208.5 191.5a12 12 0 0 1 0 17a12.1 12.1 0 0 1-17 0L128 145l-63.5 63.5a12.1 12.1 0 0 1-17 0a12 12 0 0 1 0-17L111 128L47.5 64.5a12 12 0 0 1 17-17L128 111l63.5-63.5a12 12 0 0 1 17 17L145 128Z" /></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header >}
        </>
    )

}