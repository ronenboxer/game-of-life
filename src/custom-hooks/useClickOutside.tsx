import React from 'react';


export function useClickOutside(ref: React.RefObject<HTMLDivElement>, condition: any, cb: Function) {

    function handleClickOutside(ev: MouseEvent | TouchEvent) {
        if (condition && ref.current && !ref.current.contains(ev.target as HTMLElement)) cb()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
    }
}