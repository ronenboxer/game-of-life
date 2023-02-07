

export function About() {
    return (
        <section className="about main-layout">
            <h2>Game of Life</h2>
            <h3>Devised by John Horton Conway</h3>
            <h3>Implemented by Ronen Boxer</h3>
            <p>
                Game of Life is a zero-player game that evolves based on its initial state, without any further input. It is a unique game, as its shapes are aesthetically pleasing and demonstrate Turing completeness, meaning it can simulate any Turing machine. Some patterns in the game are also undecidable, meaning there is no algorithm to tell if the pattern will reach its target.
            </p>
            <p>
                The game is played on an infinite 2D grid of cells, where each cell can be either alive or dead. Each cell has 8 neighbors, and their state along with the cell's own state will determine if it remains alive or dies, following these rules:
            </p>
            <ol>
                <h3>Living cell</h3>
                <li>A living cell with 1 neighbor or no neighbors will die as if by under-population.</li>
                <li>A living cell with 2 or 3 living neighbors will live through another "generation".</li>
                <li>A living cell with 4 or more living neighbors will die as if by over-population.</li>
            </ol>
            <ol>
                <h3>Dead cell</h3>
                <li>A dead cell with 2 or less living neighbor will remain dead as if extincted.</li>
                <li>A dead cell with 3 living cell will become alive as if by reproduction.</li>
                <li>A dead cell with 4 or more living neighbors will remain dead as if by over-population. </li>
            </ol>
            <p>Once the first generation is set, the rules apply to each cell simultaneously, resulting in life or death for each cell. The game ends when the next generation is the same as the current one or when all cells have died.</p>
            <p>Different shapes and patterns can occur, classified by their behavior, they include: <span className="bold uppercase">Still life</span> - which remain static through generations, <span className="bold uppercase">oscillators</span> - shapes that return to their original formation after a finite number of generations, <span className="bold uppercase">gliders or spaceships</span> - similar to oscillators that reach their original form at a different location.
                A pattern will be called chaotic when it takes a long time for it to become a defined shape.</p>
            <p>By applying the game rules, every starting point has predictable course of events. In other words, If two identical starting points are used, any Nᵗʰ generation will also be identical.</p>
        </section>
    )
}