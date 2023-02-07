

export function About() {
    return (
        <section className="about main-layout">
            <h2>Game of Life</h2>
            <h3>Devised by John Horton Conway</h3>
            <h3>Implemented by Ronen Boxer</h3>
            <p>
                Game of life is a zero-player game, meaning that its evolution is determined by its initial state, requiring no further input.
                The game is unique in several ways. The shapes it generates are not only pleasant on the eyes, but also demonstrate Turing completeness because it can simulate any Turing machine.
                Many of the games patterns are undecidable, meaning that given an initial state and a target state, there is no algorithm to tell if the pattern will ever reach its target.
            </p>
            <p>
                The game of life is an infinite 2-dimensional grid of cells, in which each cell's state is either alive or dead.
                Each cell has 8 neighbors: 2 horizontal, 2 vertical and 4 diagonal. A cell's neighbors' state combined with its own will determine if it will be alive or dead, following these rules:
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
            <p>When started, the rules above apply to each cell simultaneously thus resulting in life or death for each cell. The game independently stops when the next generation formation is identical to the current or when all of the cells have died.</p>
            <p>It can be deduced that once the first generation is set on board, by applying the game rules the rest of the game is predictable. In other words, for 2 identical starting points, any Nᵗʰ generation will be identical too.</p>
            <p>Different shapes and patterns can occur, and they are classified by their behavior. Instances include: <span className="bold">still life</span> - which remain static through generations, <span className="bold">oscillators</span> - shapes that return to their original formation after a finite number of generations, <span className="bold">gliders or spaceships</span> - similar to oscillators that reach their original form at a different location.
            A pattern will be called chaotic when it takes a long time for it to become a defined shape.</p>
        </section>
    )
}