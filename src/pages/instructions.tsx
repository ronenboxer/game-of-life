import boardService from "../services/board.service";

export function Instructions() {
    return (
        <section className="instructions main-layout">
            <h2>Instructions</h2>
            <p>We will refer to each step of the game as a generation. Generations change simultaneously and universally throughout the grid. Each cell is colored according to its state. There are additional mid-states; "Dying" and "Being Born" as well as "Super-life" - an immortality cell state. Each state is colored accordingly:
            </p>
            <ul className="color-map">
                <li><span style={{ background: boardService.getCurrColor('super') }}>Super life</span></li>
                <li><span style={{ background: boardService.getCurrColor('alive') }}>Alive</span></li>
                <li><span style={{ background: boardService.getCurrColor('born') }}>Born</span></li>
                <li><span style={{ background: boardService.getCurrColor('dying') }}>Dying</span></li>
                <li><span style={{ background: boardService.getCurrColor('dead') }}>Dead</span></li>
            </ul>

            <p>
                This version of the game, being limited to the size of the browser window, doesn't have an infinite grid.
                However an infinite mockup is implemented by "connecting" rows and columns end to end. This can be deactivated.
            </p>
            <h2>Playing the game</h2>
            <ul>
                <li>By clicking on a cell, you will toggle its state from "dying" or "dead" to "alive", or the other way around.</li>
                <li>You may pause or resume the game by clicking on the top left button.</li>
                <li>When paused, you may click on the "step" button next to pause/resume. It will toggle between next generation and mid-generation.</li>
                <li>Place immortal cells by clicking the toggle super-life button next to the "step" button. When active, a mortal cell will become immortal and an immortal cell will die.</li>
                <li>The "clear" button will clean board from all living cells.</li>
            </ul>
            <h2>Save shape / board</h2>
            <p>You can save your shape to local storage by clicking the "save shape" button. Once clicked, the game will pause itself and you will have to select two opposite corners. The area between selected corners will be saved under a specified name of your choice. You may cancel this operation by clicking the "cancel" button on the top right.</p>
            <p>Same goes for the "save board" button, without the selection of corners.</p>
            <h2>Special features</h2>
            <p>In the sidebar on the left, toggled by the menu icon, there switches for infinite axis. When switch on infinite, the ends of the board will be connected (in a "cylinder" manner)</p>
            <p>There are range controls for speed (the duration of generations), population (randomly populating cell from 0 to 100 percent) and resolution (cell size).</p>
            <p>There are three loading options. Factory shapes are supplied by default for your exploration and entertainment. My shapes and My boards are saved shapes and boards respectively. They can be rotated, flipped or deleted. To edit saved shape or board simply clear the board by using the "clear" button on the top controller, load desired shape or board, edit and save under the same name or a new one. Keep in mind that shapes or boards larger than the game board will be cropped.</p>
        </section>
    )
}