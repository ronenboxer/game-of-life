import { RemoveIcon } from "./remove-icon";

export function ShapeShifter({ eventBus, type, idx, name, onTransformShape }: { eventBus: Function, idx: number, type: string, name: string, onTransformShape: Function }) {

    return (<div className="options flex center">
        <span onClick={() => onTransformShape(type, name, idx, 'rotate', 'left')} className="options-icon flex center"><svg className="rotate-left" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4.75 5.25h-3m0 3.5c0 2.5 2.798 5.5 6.25 5.5a6.25 6.25 0 1 0 0-12.5c-3.75 0-6.25 3.5-6.25 3.5v-3.5" /></svg></span>
        <span onClick={() => onTransformShape(type, name, idx, 'rotate', 'right')} className="options-icon flex center"><svg className="rotate-right" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11.25 5.25h3m0 3.5c0 2.5-2.798 5.5-6.25 5.5a6.25 6.25 0 1 1 0-12.5c3.75 0 6.25 3.5 6.25 3.5v-3.5" /></svg></span>
        <span onClick={() => onTransformShape(type, name, idx, 'flip', 'vertical')} className="options-icon flex center"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48"><mask id="ipSFlipVertically0"><g fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth="4"><path strokeLinecap="round" d="M42 24H6" /><path fill="#fff" d="m14 4l22 12H14V4Zm0 40V32h22L14 44Z" /></g></mask><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSFlipVertically0)" /></svg></span>
        <span onClick={() => onTransformShape(type, name, idx, 'flip', 'horizontal')} className="options-icon flex center"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 48 48"><mask id="ipSFlipHorizontally0"><g fill="none" stroke="#fff" strokeLinejoin="round" strokeWidth="4"><path strokeLinecap="round" d="M24 6v36" /><path fill="#fff" d="m4 34l12-22v22H4Zm40 0H32V12l12 22Z" /></g></mask><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#ipSFlipHorizontally0)" /></svg></span>
        {type !== 'factory' && <RemoveIcon onDeleteShape={()=>eventBus().emit('deleteSavedShape', { type, name, idx })} />}

    </div>)
}