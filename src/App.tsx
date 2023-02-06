import { useState } from 'react';

import { Board } from './pages/board';
import { About } from './pages/about';
import { NavLink, Route, Routes } from 'react-router-dom';
import { Logo } from './cmps/logo';

function App() {

  const listenersMap: { [key: string]: Function[] } = {}
  const [isMenuActive, setIsMenuActive] = useState(false)

  function createEventEmitter() {
    return {
      on(evName: string, listener: Function) {
        listenersMap[evName] = (listenersMap[evName]) ? [...listenersMap[evName], listener] : [listener]
        return () => {
          listenersMap[evName] = listenersMap[evName].filter((func: Function) => func !== listener)
        }
      },
      emit(evName: string, data: unknown) {
        if (!listenersMap[evName]) return
        listenersMap[evName].forEach((listener: Function) => listener(data))
      }
    }
  }


  return (
    <main className="App flex column">

      <nav className="app-nav main-layout flex align-center">
        <Logo />
        <NavLink to="/about">About</NavLink>
        <span>Instructions</span>

      </nav>
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/" element={<Board eventBus={createEventEmitter} />} />
      </Routes>
    </main>
  );
}

export default App;
