import boardService from "../services/board.service";

export function Instructions() {
    return (
        <section className="instructions main-layout">
            <h2>Instructions</h2>
            <p>In this implementation of the Game of Life, each step is referred to as a generation, which updates simultaneously and uniformly across the grid. Each cell is colored according to its state. Each cell has a unique state represented by colors:
            </p>
            <ul className="color-map">
                <li><span style={{ background: boardService.getCurrColor('super') }}>Super life </span> (Immortality)</li>
                <li><span style={{ background: boardService.getCurrColor('alive') }}>Alive</span></li>
                <li><span style={{ background: boardService.getCurrColor('born') }}>Born </span>(Mid state between generations)</li>
                <li><span style={{ background: boardService.getCurrColor('dying') }}>Dying </span>(Mid state between generations)</li>
                <li><span style={{ background: boardService.getCurrColor('dead') }}>Dead</span></li>
            </ul>

            <p>
                This version of the game, being limited to the size of the browser window, doesn't have an infinite grid.
                However an infinite mockup is implemented by "connecting" rows and columns end to end. This can be deactivated.
            </p>
            <h2>Playing the game</h2>
            <ul>
                <li>Alter a cell's state (life and death) by clicking on it.</li>
                <li>Pause or resume the game by clicking the top left button.</li>
                <li>If the game is paused, use the "step" button to advance to the next generation</li>
                <li>Place immortal cells by clicking the "toggle super-life" button (next to the "step" button), then click on any cell. State will alter between "super-life" and "dead".</li>
                <li>Wipe the board clean of all living cells using the "clear" button.</li>
            </ul>
            <h2>Save shape / board</h2>
            <p>Save your shape to local storage by clicking the "Save Shape" button. The game will pause and you'll be prompted to select two opposite corners of the area you want to save.</p>
            <p>Save your entire board by clicking the "Save Board" button without the need for corner selection.</p>
            <h2>Special features</h2>
            <p>Since the amount of cells is limited by the screen size, an infinite mockup switch is available in the sidebar. When activated, the ends of the board will be connected, forming a cylindrical connection.</p>
            <p>Adjust the speed, population, and resolution of the game using the available controls.</p>
            <p>Choose from three loading options: default factory shapes, saved shapes (under "My Shapes"), and saved boards (under "My Boards"). You can rotate, flip, or delete saved shapes/boards, and make edits by clearing the board and saving the changes under the same name or a new one. Note that any shapes/boards larger than the current game board will be trimmed.</p>
        </section>
    )
}