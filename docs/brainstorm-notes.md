# Game of Life Online - Brainstorm Notes

## Core Concept

- **Asynchronous turn-based gameplay**: Players take turns adding/removing 1 cell before each tick
- **Territory control**: Each player controls ONE continuous territory; cells within it follow conquest rules
- **Multiplayer conflict**: 2-8 players on shared grid competing for territory and survival
- **Primary goal**: Prevent extinction while expanding/defending territory through strategic cell placement

## Game Loop (Per Tick)

1. **Player action phase**: Each player edits 1 cell in their controlled zone (add/remove)
   - Can only edit cells adjacent to their living cells
   - Limited action per tick (1 cell currently)
2. **Simulation phase**: Game of Life rules apply to all cells simultaneously
3. **Scoring phase**: Points awarded for population size, patterns, area dominance
4. Players compete through strategic cell placement vs dynamic evolution

## Core Game Rules (Precise Definition)

### Rule 1: Territory Definition
- **Each player has exactly ONE contiguous territory** (their "body")
- **Territory boundary**: The convex hull or bounding region that encompasses all cells owned by a player
- **Dynamic territory**: Territory expands/contracts as the player's population changes
- **Implication**: Cells far from the main body cannot be easily controlled

### Rule 2: Cell Ownership & Evolution
- **Living cells** belong to a player (marked by color)
- **Dead cells** inside a player's territory are "neutral" 
- **Dead cells** outside all territories remain neutral (no owner)
- **Game of Life applies equally to all cells** (ownership doesn't affect birth/survival rules)
- **When a dead cell births** (3+ neighbors):
  - Cell becomes alive
  - **Ownership**: assigned to the player with the most adjacent living cells
  - Tiebreaker: player A wins (or random)

### Rule 3: Territorial Conquest (3-Turn Rule)
- **Contested cell**: A cell inside Player A's territory but owned by Player B
- **Conquest condition**: If a contested cell remains in Player A's territory for **3+ consecutive turns** → ownership transfers to Player A
- **Wild cell condition**: If a cell owned by Player A leaves their territory for **3+ consecutive turns** → becomes **wild/unowned**
- **Wild cell behavior**: 
  - Wild cells follow normal Game of Life rules (birth/death)
  - Any player can conquer wild cells if they enter their territory for 3+ turns
  - Creates neutral "frontier" cells that can be claimed by anyone
- **Implication**: 
  - Glider guns can only conquer cells within the shooter's own territory
  - Invasion requires expanding your territory first, then using cells/patterns to conquer slowly
  - You must defend your population from spreading too far, or lose cells to wildness
  - Wild cells create strategic neutral zones and recovery opportunities

### Rule 4: Player Actions (Per Turn)
- **Action phase**: Before each tick, one player (in turn order) can:
  - **Add 1 cell** to the grid, adjacent to their living cells, within their territory
  - **Remove 1 cell** from the grid, from their own living cells
  - **Modify rules** (B/S change) — costs rule points (TBD)
- **Restriction**: Can only edit cells in/near your territory
- **Resource cost**: Currently 1 action per turn (no cost system yet)

### Rule 5: Scoring
- **Population bonus**: +1 point per 5 living cells
- **Pattern bonus**: Glider (+10), Blinker (+3), Block (+2), etc.
- **Territory bonus**: +1 point per turn controlling majority of your territory (TBD)

## Game Configuration (Decided)

- **Grid size**: 50x50 minimum (supports 4-8 players)
- **Number of players**: 2-8 (each with unique color)
- **Starting pattern**: Small seed (3-5 cells) per player in separate corners
- **Initial B/S rules**: B3/S23 (Conway's original)
- **Win condition**: Last player with living cells, OR highest score after N turns
- **Lose condition**: Population extinction (0 cells) OR cells remain isolated for 5+ turns

## Open Questions

### Rule Power System (B/S Changes)
- Starting rule points per player?
- Cost per B/S change?
- Can you earn rule points during the game?
- Should rule changes affect all players equally or individual rulesets?

### Pattern Recognition System
- Which patterns should award bonus points?
- How do we detect patterns efficiently?
- Should rare patterns be worth more?

### Scoring Balance
- Current: +1 per 5 cells, pattern bonuses, (territory TBD)
- Is this balanced for 2-8 players?
- Should scoring encourage defense or aggression?

### Technical Implementation
- How do we compute territory boundaries (convex hull? flood fill?)
- How do we track "3-turn rule" state efficiently?
- Real-time or turn-based display?

## Next Steps
1. Brainstorm area control mechanics specifically
2. Define B/S point system
3. Define win/lose conditions
4. Map out full game loop with all mechanics
