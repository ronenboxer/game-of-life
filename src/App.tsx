import { Board } from './pages/board';
import { About } from './pages/about';
import { Navigate, NavLink, Route, Routes } from 'react-router-dom';
import { Logo } from './cmps/logo';
import { Instructions } from './pages/instructions';

function App() {

  const listenersMap: { [key: string]: Function[] } = {}

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
        <NavLink to="/gameoflife/about">About</NavLink>
        <NavLink to="/gameoflife/instructions">Instructions</NavLink>

      </nav>
      <Routes>
        <Route path="/gameoflife/instructions" element={<Instructions />} />
        <Route path="/gameoflife/about" element={<About />} />
        <Route path="/gameoflife" element={<Board eventBus={createEventEmitter} />} />
        <Route path="/gameoflife/*" element={<Navigate to="/gameoflife"/>} />
        <Route path="*" element={<Navigate to="/gameoflife"/>} />
      </Routes>
    </main>
  );
}

export default App;
