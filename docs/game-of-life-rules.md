# Conway's Game of Life: Rules & Concepts

A technical and conceptual reference for understanding and implementing Conway's Game of Life.

---

## 1. Foundational Concepts

### What is a Cellular Automaton?

A cellular automaton is a discrete computational model consisting of:
- A **grid** of cells (1D, 2D, 3D, etc.)
- Each cell has a **finite set of states** (in Game of Life: alive or dead)
- A **rule set** that determines how each cell transitions based on its neighbors
- **Synchronous updates**: all cells change simultaneously each generation (tick)

The power of cellular automata lies in how **simple local rules** generate **complex global behavior** — a principle called **emergence**.

### Why Game of Life Matters

John Horton Conway invented Game of Life in 1970 to explore a fundamental question: what is the minimal rule set that produces unbounded complexity?

The answer: **four rules**. From those four rules emerges:
- Stable structures (still lifes)
- Periodic oscillators (clocks and pulses)
- Moving structures (spaceships)
- Universal computation (Turing-complete)

Game of Life demonstrates that complexity is not proportional to rule complexity — it's orthogonal.

### The Grid & Neighborhood

**Grid**: An infinite two-dimensional array of square cells. For practical purposes, we use a finite grid with wrapping (toroidal topology) or boundary conditions.

**Neighborhood**: Each cell has **8 neighbors** (Moore neighborhood):
```
[NW] [N] [NE]
[W ] [X] [E ]
[SW] [S] [SE]
```

Where X is the cell in question. This is the only spatial structure that matters — adjacency and proximity.

---

## 2. Conway's Rules (Classical)

### The Four Rules

Applied **simultaneously** to every cell in every generation:

**Rule 1: Underpopulation (Death)**
- A live cell with **fewer than 2 live neighbors** dies
- Reason: Isolation; the cell cannot sustain itself

**Rule 2: Overpopulation (Death)**
- A live cell with **more than 3 live neighbors** dies
- Reason: Competition for resources; too much crowding

**Rule 3: Survival**
- A live cell with **2 or 3 live neighbors** survives to the next generation
- Reason: Stable population

**Rule 4: Birth (Reproduction)**
- A dead cell with **exactly 3 live neighbors** becomes alive
- Reason: Optimal conditions for reproduction

### Notation

Conway's rules are often written as **B3/S23**:
- **B** (Birth): dead cells with exactly 3 neighbors become alive
- **S** (Survive): live cells with 2 or 3 neighbors survive
- All other cells die

### Computation Algorithm

**Pseudocode for one generation:**
```
function nextGeneration(grid):
  new_grid = empty grid (same size)
  
  for each cell at (x, y) in grid:
    neighbor_count = count live neighbors of (x, y)
    cell_state = grid[x, y]
    
    if cell_state == ALIVE:
      if neighbor_count == 2 or neighbor_count == 3:
        new_grid[x, y] = ALIVE
      else:
        new_grid[x, y] = DEAD
    else:  // cell_state == DEAD
      if neighbor_count == 3:
        new_grid[x, y] = ALIVE
      else:
        new_grid[x, y] = DEAD
  
  return new_grid
```

**Key property**: All updates happen **in parallel**. You cannot update cells one-by-one in sequence — you must compute the next state for all cells based on the current state, then switch to the new grid.

### Example: Evolution of a Blinker

**Generation 0:**
```
. . .
. X .
. X .
. X .
. . .
```
(3 live cells, vertical)

**Generation 1:**
```
. . .
. . .
X X X
. . .
. . .
```
(3 live cells, horizontal)

**Generation 2:**
Back to generation 0 (vertical again)

The blinker **oscillates** with period 2. It's a simple periodic structure.

---

## 3. Emergent Patterns

The beauty of Game of Life is that from four simple rules, complex patterns spontaneously arise.

### Still Lifes (Stable Structures)

Patterns that never change. Once formed, they remain indefinitely.

**Block** (2×2 square):
```
X X
X X
```
(4 cells)

**Beehive**:
```
. X X .
X . . X
. X X .
```
(6 cells)

**Loaf**:
```
. X X .
X . . X
. X . X
. . X .
```
(8 cells)

Still lifes are the "matter" of Game of Life — stable units that can be composed and manipulated.

### Oscillators (Periodic Structures)

Patterns that cycle through states with a period > 1.

**Blinker** (Period 2):
```
Gen 0:    Gen 1:
. X .     . . .
. X .     X X X
. X .     . . .
```

**Toad** (Period 2):
```
Gen 0:       Gen 1:
. . . .      . . . .
. X X X      X X X .
X X X .      . . . .
. . . .      . . . .
```

**Pulsar** (Period 3):
A 13×13 structure with intricate symmetry. After 3 generations, it returns to its original state.

Oscillators are clocks and signal generators in Game of Life's computational structures.

### Spaceships (Moving Structures)

Patterns that translate across the grid without growth or decay. After N generations, they return to the same configuration but shifted by (dx, dy).

**Glider** (Period 4, moves diagonally):
```
Gen 0:    Gen 1:    Gen 2:    Gen 3:    Gen 4:
. X . .   . . X .   . . . X   . . . .   . X . .
. . X .   . X X .   . X X .   . X X .   . . X .
X X . .   . X . .   . . X .   . X . X   X X . .
. . . .   . . . .   . . . .   . . . .   . . . .

(Returns to gen 0 shape, but shifted right-down)
```

**LWSS** (Lightweight Spaceship, Period 4, moves horizontally):
```
. X . . .
. . . X .
. X . . X
X X . . X
X X . . .
```

Spaceships are mobile structures that can interact with other patterns — they form the "particles" and "signals" of Game of Life.

### Methuselahs (Long-Running Structures)

Patterns that take hundreds or thousands of generations to stabilize into still lifes and oscillators.

**R-pentomino** (5 cells):
```
. X .
X X .
. X .
```

Takes **1103 generations** to stabilize! It spawns 8 gliders along the way.

Methuselahs demonstrate how initial conditions can lead to unpredictable, long-term evolution.

### Guns & Puffers (Advanced)

**Glider Gun** (period 30): A configuration that emits gliders. Demonstrates that Game of Life can be Turing-complete.

**Puffer Train**: A moving structure that leaves still lifes or other patterns in its wake.

These show that Game of Life supports construction and self-replication.

---

## 4. Rule Variations

While B3/S23 (Conway's original) is the most famous, dozens of rule variations exist. Each produces distinct behaviors.

### Notation: Birth/Survive

Rules are written as `B{births}/S{survivals}`:
- **B** lists the neighbor counts at which a dead cell births
- **S** lists the neighbor counts at which a live cell survives
- All other state transitions result in death

**Conway's Game of Life**: B3/S23
- Dead cells with exactly 3 neighbors → alive
- Live cells with 2-3 neighbors → survive

### Popular Variants

**HighLife** (B36/S23):
- Dead cells with 3 **or 6** neighbors can birth
- Live cells with 2-3 neighbors survive
- Produces "replicators" — self-copying patterns
- More chaotic than Conway's original

**Seeds** (B2/S):
- Dead cells with exactly 2 neighbors → alive
- No live cell survives (all die every generation)
- Produces rapid, organic-looking growth patterns
- Tends toward expansion and extinction

**Life Without Death** (B3/S012345678):
- Cells only birth and survive; never die
- Results in rapid filling of space
- Eventually reaches a density equilibrium

**Day and Night** (B3678/S34678):
- High symmetry between birth and survival rules
- Produces spaceships that move at different speeds

### Why Variations Matter

Slight changes in rules produce drastically different dynamics:
- **Chaotic regimes**: Patterns grow unbounded
- **Periodic regimes**: Stable cycles emerge
- **Critical points**: Rule sets where complexity peaks

For this project, we can support **rule variants** as a configuration parameter, allowing players to explore different rulesets.

---

## 5. Implementation Considerations

### Data Structures

**Dense Grid**:
- 2D array `grid[x][y]` where each cell is a boolean (alive/dead)
- Simple, fast neighbor counting
- Memory usage: O(width × height)
- Good for small, finite grids (e.g., 100×100 to 1000×1000)

**Sparse Grid** (Recommended for infinite/large grids):
- Set of live cells only: `HashSet<(x, y)>`
- Only track cells that are alive
- Memory usage: O(number of live cells)
- Neighbor counting: iterate only around alive cells
- Better for sparse patterns (like most long-running simulations)

**Quadtree**:
- Hierarchical spatial decomposition
- Very efficient for large grids with sparse patterns
- Enables fast zooming and pattern detection
- More complex to implement

For **game-of-life-online**, a **sparse grid** is ideal:
- Web-based environments have memory constraints
- Most stable patterns are sparse
- Allows infinite exploration without bounds

### Algorithm Optimization

**Naive approach** (recompute everything):
- Compute next state for all cells
- Time: O(grid_width × grid_height) or O(live_cells × 8) for sparse grids

**Optimized approach** (only check affected cells):
- Live cells and their neighbors can change
- Dead cells far from live cells never change
- Track a "bounding box" of relevant cells
- Skip dead regions entirely

**Memoization/Caching**:
- Cache common stable patterns
- Recognize oscillators and spaceships
- Skip unneeded computation

### Rendering

- Each cell → one pixel or DOM element
- Pan/zoom for infinite grid exploration
- Color live/dead cells differently
- Optional: overlay grid lines

---

## 6. Key Insights for Implementation

1. **Synchronous Updates**: All cells must update simultaneously. Double-buffering (current grid + next grid) is essential.

2. **Sparsity**: Most patterns are sparse. Use sparse data structures to avoid computing dead regions.

3. **Pattern Recognition**: Detecting still lifes, oscillators, and spaceships enables optimization and visualization.

4. **Rule Flexibility**: Parameterize birth/survive rules to support variants like HighLife, Seeds, etc.

5. **Infinite Grids**: Handle unbounded grids by expanding dynamically or using toroidal wrapping.

6. **Performance**: For interactive gameplay, aim for 30-60 FPS. This requires fast generation computation.

---

## References

- [ConwayLife.com](https://www.conwaylife.com/) — Comprehensive resource with pattern catalog
- [LifeWiki](https://www.conwaylife.com/wiki/) — Technical documentation and research
- [The Pattern Treasury](https://www.conwaylife.com/patterns/) — Thousands of known patterns
