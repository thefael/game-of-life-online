# Game of Life Online: Multiplayer Game Design Specification

**Date**: 2026-04-11  
**Status**: Draft  
**Scope**: Core game mechanics, rules, and turn structure

---

## Executive Summary

**Game of Life Online** is a turn-based multiplayer strategy game built on Conway's Game of Life. Players compete on a shared grid, controlling territories and expanding/defending populations. The game combines **emergent cellular automaton dynamics** with **strategic player agency** — each player can add or remove 1 cell per turn, influencing how their territory evolves.

**Core loop**: Player action → Game of Life tick → Territorial ownership updates → Scoring → Next player.

**Target**: 2-8 players on a 50×50+ grid, competitive or cooperative modes.

---

## 1. Game World & Setup

### 1.1 Grid
- **Size**: 50×50 cells (minimum); 100×100+ for 6-8 players
- **Topology**: Toroidal (wraps at edges) or bounded (fixed walls TBD)
- **Cell states**: Alive (owned by Player 1-8, color-coded) or Dead (empty/wild)

### 1.2 Starting Configuration
- **Number of players**: 2-8 (each assigned unique color)
- **Starting position**: Each player receives a small seed pattern (3-5 cells) in a separate corner of the grid
- **Seed pattern**: Glider, Blinker, or custom pattern (TBD)
- **Starting B/S rules**: B3/S23 (Conway's original) for all players
- **Starting score**: 0 points

### 1.3 Player Identities
- Each player has a color, name, population count, territory bounds, score, and rule points (for future B/S changes)

---

## 2. Core Game Rules

### 2.1 Territory Definition
**Definition**: A player's territory is the **dynamic region** that encompasses all cells currently owned by that player.

- Computed each turn as the **bounding convex hull** (or expanding bounding box) of all cells owned by the player
- Territory expands when new cells are born within it
- Territory shrinks when cells leave and become wild

**Implication**: A cell far from the main body is outside the territory and subject to the 3-turn wild rule (see Rule 3).

### 2.2 Cell Ownership & Evolution

**Cell states**:
- **Alive & Owned**: Belongs to a specific player (colored)
- **Dead**: Empty; unowned until a birth event
- **Alive & Wild**: Was owned, became unowned; follows Game of Life normally

**Game of Life Rules**:
- All cells (owned, wild, dead) follow B3/S23 rules simultaneously
- **Ownership does NOT affect birth/survival** — rules apply equally to all cells

**Birth ownership**:
- When a dead cell becomes alive (3+ neighbors) → assigned to the player with the most adjacent alive neighbors
- Tiebreaker: Player with lowest ID (or random, TBD)
- Born cells retain ownership until they become wild (Rule 3)

### 2.3 Ownership & Wild Cells (Rule 3)

**Ownership by lineage**:
- A cell is "owned" by the player whose territory it was born in
- Ownership is tracked by lineage/origin, not individual cell instances
- A cell can die and be reborn — if reborn in the same player's territory, ownership persists

**Wild cell condition**:
- If a cell owned by Player A **leaves Player A's territory and remains outside for 3+ consecutive turns** (while alive) → becomes **wild**
- Wild cells are unowned and follow Game of Life normally
- Any player can claim wild cells

**Conquest condition**:
- If a wild cell (or enemy-owned cell) **stays inside Player A's territory for 3+ consecutive turns** → Player A gains ownership
- Cells re-born in A's territory after becoming wild are reclaimed by A

**Recovery**:
- If a cell owned by A becomes wild, A can reclaim it by expanding territory to re-encompass it
- Once reborn in A's territory, it becomes A's again

---

## 3. Player Actions & Turn Structure

### 3.1 Turn Sequence Overview

The game operates in **discrete turns**, where each turn follows this sequence:

1. **Current player decision phase** (player can see preview)
2. **Action commit** (add/remove/pass)
3. **Simulation phase** (Game of Life tick)
4. **Territorial update**
5. **Scoring update**
6. **Next player** (loop)

### 3.2 Global Timer & Simultaneous Decisions

**Turn timing**:
- **Global timer**: Each turn has a fixed duration (e.g., 30 seconds)
- **All players decide simultaneously**: Each player plans their action in parallel
- **Automatic progression**: When timer expires, all actions resolve and game ticks
- **Timeout behavior**: If a player doesn't confirm an action, they **pass** (no action taken)

### 3.3 Player Decision Phase (Preview System)

**Current player's perspective**:
- Player sees the **current game state** (all cells, territories, scores)
- Player can make **hypothetical edits** (test placing/removing cells) without committing
- For each hypothetical edit, the game shows a **live preview** of the next game state (next Game of Life frame)
- Player iterates: adjust cell placement, watch preview, adjust again
- Player can **cancel/undo** their choice and select a different action before final confirmation
- Once satisfied, player **confirms** one action (or passes)

**How preview works**:
1. Current game state: `Grid[t]`
2. Player proposes: "Add cell at (x, y)"
3. Game computes: `Grid[t+1]` = `GameOfLife(Grid[t] + new cell)`
4. Preview displays `Grid[t+1]` to the player
5. Player can see consequences before confirming
6. Player clicks "Confirm" to lock in the action

**Multiple preview options**:
- Player can preview multiple different placements (e.g., "what if I add at (10,10)?" vs. "what if I add at (10,11)?")
- Each preview is independent; no changes are made until confirmed
- Player settles on one action and clicks "Confirm"
- Player can click "Cancel" to undo, and try a different placement (must "Confirm" again)

### 3.4 Real-time Conflict Resolution (Simultaneous Multi-player)

**Conflict scenario**: Two players both try to add a cell at the same location.

**Resolution mechanism** (Opção C: Real-time Feedback + First Confirmed):

1. **Real-time visual feedback**: As timer counts down, players see which cells are being **"claimed"** by other players in real-time
   - A cell claimed by Player A shows **Player A's color** and a temporary indicator (e.g., outline, glow)
   - Player B sees this cell is no longer available
   - Cell remains claimed until one of two things happens:
     - Player A confirms their action → cell is locked for Player A
     - Timer expires before A confirms → cell is released (action timed out)

2. **Claim priority**: When a player **confirms** their action → claim becomes final
   - If Player A confirms first at (x, y) → A wins the cell
   - If Player B also selected (x, y) but hasn't confirmed → B sees it's taken, can cancel and choose elsewhere
   - If B confirms before timer, but A confirmed first → B's action is **rejected** and marked as conflict
   - B's action doesn't resolve; B is forced to re-attempt next turn (or timer expires to auto-pass)

3. **Player feedback on conflicts**:
   - **During decision phase**: "Cell (x, y) is claimed by Player A" message
   - **After confirmation attempt**: If conflict, message: "Action failed: cell already claimed. Choose another location or pass."
   - Player can quickly re-select and re-confirm before timer expires

4. **Timer expiration with pending action**:
   - If timer expires and player hasn't confirmed → action is **auto-passed**
   - If player confirmed but was in conflict → action fails, state reverts to "pass"
   - No action is lost; players simply pass that turn

**Example flow**:
```
T=0s (timer starts): Grid shows current state
T=5s: Player A clicks on cell (10, 10) → preview shows outcome → A is "planning"
T=8s: A clicks "Confirm" → cell (10, 10) is now CLAIMED by A (visual feedback)
T=10s: Player B clicks on cell (10, 10) → sees "Claimed by A" → cancels
T=12s: B clicks on cell (10, 11) → preview shows outcome → B clicks "Confirm"
T=30s: Timer expires
       → A's action: Add cell at (10, 10) ✓
       → B's action: Add cell at (10, 11) ✓
       → Game ticks
```

**Another example (conflict)**:
```
T=5s: Player A clicks (10, 10) → no preview yet
T=7s: A and B both decide (10, 10) is good
T=8s: A confirms → (10, 10) is CLAIMED by A
T=9s: B sees claim, cancels, tries (10, 11)
T=10s: B confirms (10, 11)
T=30s: Both actions succeed
```

**Worst case (simultaneous confirmation)**:
```
T=5s: A clicks (10, 10)
T=8s: B clicks (10, 10)
T=10s: A confirms (10, 10) → A gets the cell
T=10s: B also tries to confirm (10, 10) → CONFLICT
       Message: "Cell already claimed by Player A"
       B's action is rejected; B passes this turn
```

### 3.5 Simulation Phase (After Timer Expires)

**All confirmed actions resolve simultaneously**:
1. All valid, confirmed actions are applied to the grid
2. Game of Life tick computes next frame
   - All cells update simultaneously using B3/S23 rules
   - Births, deaths, and ownership assignments happen at once
3. Multi-player actions are all reflected in this single tick

**Non-simultaneous (vs. Turn-by-turn)**:
- Unlike turn-based where Player 1 acts → tick → Player 2 acts → tick
- Here: All players act (within timer) → single tick → next timer

### 3.6 Territorial Update & Scoring

After simulation:
1. Compute territories for each player
2. Apply wild cell rules (3+ turns outside → wild)
3. Apply conquest rules (3+ turns inside enemy territory → owned)
4. Update scores based on population, patterns, territory

### 3.7 Next Round

Timer resets. All players make decisions simultaneously for the next turn. Repeat from Section 3.2.

### 3.2 Restrictions
- **Add cell**: Must be adjacent (horizontally, vertically, or diagonally) to an existing owned cell
- **Add cell**: Cannot overlap with existing cells (dead or alive)
- **Add cell**: Must be within or adjacent to the player's territory
- **Remove cell**: Can only remove from your own alive cells
- **Remove cell**: Cannot reduce population below 1 cell (would cause extinction)

---

## 4. Scoring System

### 4.1 Score Mechanics

**Population bonus**: +1 point per 5 alive cells owned by the player  
- Rounded down (4 cells = 0 bonus, 5 cells = 1 bonus, 10 cells = 2 bonus)
- Awarded each turn

**Pattern bonus**: Awarded when a player's territory contains a recognizable pattern:
- **Glider**: +10 points (detected once per pattern instance)
- **Blinker** (period-2 oscillator): +3 points
- **Block** (2×2 still life): +2 points
- Other patterns TBD

**Territory bonus** (TBD):
- Awarded for controlling majority of a region
- May incentivize area control vs. just population size

### 4.2 Win Condition

**Elimination mode**:
- Last player with alive cells wins

**Time-based mode**:
- After N turns (e.g., 100 turns), highest score wins

---

## 5. Losing Conditions

**Extinction**:
- Population reaches 0 cells → player is eliminated

**Isolation** (TBD):
- If a player's population remains disconnected/isolated for 5+ consecutive turns → may face penalties or elimination

---

## 6. Advanced Mechanics (Future)

### 6.1 Rule Modification (B/S Changes)
- Players earn "rule points" through certain actions
- Can spend points to change B/S rules (affects all players or individual)
- Cost/gain structure TBD

### 6.2 Pattern Recognition & Powers
- Glider guns become offensive/defensive tools (if territory expands to encompass them)
- Puffer trains leave trails of controlled cells
- Detected patterns may unlock special actions

### 6.3 Multiplayer Dynamics
- Alliance system (cooperative gameplay)
- Shared territory (teams)
- Dynamic rule voting

---

## 7. Game Configuration

| Parameter | Value | Notes |
|-----------|-------|-------|
| Grid size | 50×50+ | Scales with player count |
| Players | 2-8 | Can adjust |
| Initial B/S rules | B3/S23 | Conway's original |
| Actions per round | 1 | Add or remove 1 cell per player |
| Timer duration | 30 seconds | Time to decide action |
| Timer behavior | Auto-advance | When time expires: all confirmed actions resolve + tick |
| Timeout action | Pass | Player who doesn't confirm = pass (no action) |
| Conflict resolution | First confirmed wins | Real-time visual feedback; earliest confirm gets cell |
| Wild rule timeout | 3 turns | Outside territory → wild |
| Conquest timeout | 3 turns | Inside territory → owned |
| Population bonus | +1 per 5 cells | Each round |
| Simultaneous ticks | Yes | All players' actions resolve in 1 tick (not sequential) |

---

## 7.1 Preview Mechanic Example

**Scenario**: Player A has 6 cells in a formation. Three cells will die next turn due to underpopulation.

**Current state (t=0)**:
```
. . . . . . . .
. . A A . . . .
. . A . . . . .
. A A A . . . .
. . . . . . . .
```

**Player A enters decision phase**:
- Sees current state (above)
- Thinks: "If I add a cell at (2, 2) to support the dying cell..."

**Player A tests preview #1** - Add cell at (2, 2):
```
. . . . . . . .
. . A A . . . .
. . A A . . . .  ← new cell at (2, 2)
. A A A . . . .
. . . . . . . .
```
Game computes next frame (Game of Life tick):
```
. . . . . . . .
. . A A . . . .
. . A A . . . .
. A A A . . . .
. . . . . . . .
```
**Result**: Cell at (2, 2) survives! Population stabilizes. Player A can see this before committing.

**Player A tests preview #2** - Add cell at (3, 1) instead:
```
. . . . . . . .
. . A A A . . .
. . A . . . . .
. A A A . . . .
. . . . . . . .
```
Game computes next frame:
```
. . . . . . . .
. . A A A . . .
. A A . A . . .
. A A A . . . .
. . . . . . . .
```
**Result**: Different outcome! More cells survive, but population spreads wider.

**Player A commits**: Chooses preview #1 (add at 2,2) as the actual action.

---

## 8. Example Turn Flow (Simultaneous Multi-player)

**Round 1 - Timer: 30 seconds**:

Player A:
- T=5s: Clicks on cell (10, 10), sees preview
- T=10s: Confirms (10, 10) → cell claimed by A
- T=30s: Action locked in

Player B:
- T=3s: Clicks on cell (12, 12), sees preview
- T=8s: Also wants (10, 10), sees it's claimed by A
- T=12s: Clicks (10, 11) instead, sees new preview
- T=20s: Confirms (10, 11) → cell claimed by B
- T=30s: Action locked in

Player C:
- T=2s: Selects (15, 15)
- T=25s: Still deliberating, hasn't confirmed
- T=30s: Timer expires, C **passes** (no action)

**Result**:
- A adds cell at (10, 10)
- B adds cell at (10, 11)
- C passes
- All three actions resolve simultaneously in a single Game of Life tick
- Score updates: A and B gain points for population (if applicable)
- Territories update

**Round 2**:
- New 30-second timer starts
- All players see the grid after round 1's tick + score updates
- Process repeats

---

## 9. Design Principles

**Emergence over prescription**: Game rules create emergent behavior (patterns, collisions, strategies) rather than forcing outcomes.

**Territory as core**: Ownership and territory expansion are central, not B/S rule changes (which are deferred).

**Simplicity**: Core rules (birth, ownership, wild cells) are simple and deterministic.

**Interactivity with agency**: Each player has agency to shape their population mid-evolution (add/remove 1 cell per turn). The **preview system** ensures informed decision-making: players see consequences before committing.

**Transparency**: Players can reason about Game of Life dynamics by previewing outcomes. No hidden mechanics or RNG in core rules.

**Balance**: Population growth is limited by: Game of Life dynamics, action cost (1 cell/turn), territorial constraints, and preview overhead (time to decide).

---

## 10. Open Questions & Future Work

1. **Territory computation**: Should we use convex hull, bounding box, or flood-fill?
2. **Wild cell tracking**: Should wild cells eventually decay/disappear if unclaimed?
3. **Tie-breaking on births**: If a dead cell has equal neighbors from two players, who owns it? (First to confirm action in that region?)
4. **Isolation rule**: Should isolated populations face penalties or auto-elimination?
5. **Rule modification system**: Cost structure, earning mechanics, global vs. local B/S changes?
6. **Pattern detection efficiency**: How to detect gliders, guns, puffers efficiently each tick?
7. **Multiplayer balance**: Is 1 action per round fair for 2 vs. 8 players?
8. **Timer tuning**: 30 seconds enough? Should it scale with player count or grid size?
9. **Claim timeout**: If a player claims a cell but doesn't confirm before timer → should claim be released?
10. **Simultaneous conflicts edge case**: If A and B both confirm on (10,10) at T=29.9s, how to determine who wins? (Server-side timestamp?)

---

## 11. User Interface & UX

### 11.1 Pre-Game: Room & Color Selection

**Screen**: Room lobby before game starts

```
┌─────────────────────────────────────────┐
│  Game of Life Online                    │
│─────────────────────────────────────────│
│  Room: "Arena 1"                        │
│  Players: [2/8]                         │
│─────────────────────────────────────────│
│  Choose your color:                     │
│                                         │
│  [🟦] Blue     [🟥] Red    [🟩] Green   │
│  [🟨] Yellow   [🟪] Purple [🟧] Orange  │
│  [⬛] Black    [⬜] White               │
│                                         │
│  (Click to select)                      │
│─────────────────────────────────────────│
│          [Start Game]                   │
└─────────────────────────────────────────┘
```

**Behavior**:
- Player selects one color
- Color preview updates in real-time
- Once all players ready → "Start Game" button activates
- Game begins with color assignment locked

### 11.2 Main Game Screen

**Layout**: Divided into 3 sections (Current State + Preview + Sidebar)

```
┌─────────────────────────┬──────────────────────────┬──────────────┐
│   CURRENT STATE         │   NEXT STATE PREVIEW     │   SIDEBAR    │
│   (Grid at t)           │   (Grid at t+1)          │──────────────│
│                         │                          │ Timer: 25s   │
│  . . . . . . . . .      │  . . . . . . . . .       │              │
│  . . . . . . . . .      │  . . . . . . . . .       │ Players:     │
│  . . 🟦🟦 . . . . .      │  . . 🟦🟦 . . . . .      │ 🟦 Player A  │
│  . . 🟦 . . 🟥🟥 .      │  . . 🟦 . . 🟥🟥 .      │    Pop: 12   │
│  . . 🟦🟦 . 🟥 . .      │  . . 🟦🟦 . 🟥 . .      │    Score:99  │
│  . . . . . . . . .      │  . . . . . . . . .      │              │
│  . . . . . . . . .      │  . . . . . . . . .      │ 🟥 Player B  │
│                         │                          │    Pop: 8    │
│                         │                          │    Score:87  │
│                         │                          │              │
│                         │                          │ [Confirm]    │
│                         │                          │ [Cancel]     │
│                         │                          │ [Pass]       │
└─────────────────────────┴──────────────────────────┴──────────────┘
```

**Left panel (Current State Grid)**:
- Shows current game state at time `t`
- White background
- Cells: colored if owned, white if empty
- Territory outline: faint gray/dashed line (optional)
- Player can click/hover to interact

**Middle panel (Next State Preview)**:
- Shows projected state at time `t+1` without any player action
- Updated in real-time as player hovers over cells
- When player hovers a cell in Current State → both grids highlight the same cell
- When player hovers → Middle grid shows: "what if I add a cell here?" (cell blinks in preview)
- Static when no hovering (shows default next state)

**Right sidebar**:
- Timer countdown (seconds)
- List of players: name, color, population count, current score
- Action buttons: Confirm / Cancel / Pass

### 11.3 Interaction Flow

**Always visible preview**:
- Middle panel always shows the **next state** (at time t+1) without any player action
- When player is NOT hovering/selecting: shows default next state (Game of Life tick on current state)
- Updates automatically every frame (no manual "compute" button)

**Player interacts with grid:**

1. **Hover over empty cell** in Current State (left grid):
   - Cell enters **preview state** in left grid (blinks with reduced opacity)
   - Middle grid (Next State) updates in real-time to show: "what if I add here?"
   - Both grids highlight the same cell position
   - If click is within 1 cell of territory → valid (preview shows outcome)
   - If click is outside territory → shows error "Too far from territory"

2. **Real-time preview display**:
   ```
   Current state (t):      Next state (t+1) if you add:
   
   . . . . . .            . . . . . .
   . 🟦 . . .             . 🟦 . . .
   . 🟦 . . .       →     . 🟦🟦 . .  (showing impact)
   . 🟦 . . .             . 🟦 . . .
   . . . . . .            . . . . . .
            ↑ hovering              ↑ updates in real-time
   ```

3. **Player decides**:
   - Hover over multiple cells to see different outcomes in real-time
   - Once settled on a location:
     - Click "Confirm" button → cell transitions to **non-committed action** state
       - Cell now shows in secondary color in Current State grid
       - No longer blinking
       - Checkmark icon appears
     - Click "Cancel" → reverts to default next-state preview (no action)
   - Click elsewhere → tests new location (preview updates to new location)

4. **After confirming** (non-committed):
   - Cell is locked in secondary color with checkmark in left grid
   - Middle grid continues to show preview of confirmed action
   - Player can click "Cancel" to undo and try different location again
   - Upon re-confirming new location: old secondary cell reverts to white, new cell becomes secondary
   - Only ONE non-committed action per player at a time

5. **Timer expires**:
   - All non-committed actions resolve and transform to **primary color** in left grid
   - Middle grid is recalculated based on new state
   - Animations stop
   - Scores update
   - New 30-second timer begins
   - New preview cycle starts

### 11.4 Visual Indicators

**Cell states on grid**:

| State | Visual | Description | Example |
|-------|--------|-------------|---------|
| Empty | White | Solid white background | ⬜ |
| Player A owned | Primary color | Solid, full opacity | 🟦 (solid blue) |
| Player B owned | Primary color | Solid, full opacity | 🟥 (solid red) |
| Wild cell | Faded/striped | Dimmed version of original color | 🟦░ (faded blue) |
| **Preview state** | **Blinking primary + transparency** | **Cell blinks at ~1 Hz, reduced opacity (~60%), player's primary color** | **🟦 (blinking, semi-transparent)** |
| **Non-committed action** | **Secondary color** | **Locked to secondary shade of player color (lighter/darker), solid, no blink** | **🟦' (lighter blue)** |
| **Confirmed action** | **Primary color** | **Transforms to full primary color, shows checkmark or lock icon** | **🟦✓ (solid blue + check)** |
| Conflict (taken by other) | Crossed pattern | X overlay or dimmed + X | 🟦❌ |

**Color system per player**:
- **Primary color**: The player's main color (e.g., Blue for Player A)
- **Secondary color**: Lighter/darker shade of primary
  - Example: Player A is `#0066FF` (blue) → secondary is `#99CCFF` (light blue)
  - Example: Player B is `#FF0000` (red) → secondary is `#FF9999` (light red)

**Animation states**:
- **Preview (blinking)**: CSS `opacity: 0.6; animation: blink 1s infinite;`
- **Non-committed (static)**: CSS `opacity: 1; color: secondary_shade;`
- **Confirmed (static + icon)**: CSS `opacity: 1; color: primary_color;` + checkmark overlay

**State transition example** (Player A: Primary Blue / Secondary Light Blue):

```
Step 1 - Initial (t=0, no hovering):
LEFT (current):         RIGHT (next without action):
. . . .                 . . . .
. 🟦 . .         →       . 🟦 . .
. 🟦 . .                 . 🟦 . .
. . . .                 . . . .

Step 2 - Player hovers (1,1):
LEFT (current):         RIGHT (next with (1,1) added):
. . . .                 . . . .
. 🟦 . .         →       . 🟦 . .
. 🟦 . .  ← blinking     . 🟦🟦 . .  ← blinks/updates
. . . .                 . . . .

Step 3 - Player confirms (1,1):
LEFT (current):         RIGHT (next with (1,1)):
. . . .                 . . . .
. 🟦 . .         →       . 🟦 . .
. 🟦 . .  ← 🟦' (locked)  . 🟦🟦 . .
. . . .                 . . . .

Step 4 - Player changes mind, hovers (2,2):
LEFT (current):         RIGHT (next with (2,2)):
. . . .                 . . . .
. 🟦 . .         →       . 🟦 . .
. 🟦 . .                 . 🟦 . .  ← preview updates
. . 🟦 . ← blinking      . . 🟦 . .  ← shows (2,2) outcome

Step 5 - Player confirms (2,2):
LEFT (current):         RIGHT (next with (2,2)):
. . . .                 . . . .
. 🟦 . .         →       . 🟦 . .
. 🟦 . .  ← reverted     . 🟦 . .
. . 🟦' . ← 🟦' (locked) . . 🟦 . .

Step 6 - Timer expires (t+1), action resolves:
LEFT (current):         RIGHT (next at t+2):
. . . .                 . . . .
. 🟦 . .         →       . 🟦 . .
. 🟦 . .                 . 🟦 . .
. . 🟦 . ← 🟦 (primary)  . . 🟦 . .
```

**Territory bounds** (optional overlay):
- Faint gray dashed line showing each player's territory boundary
- Can be toggled on/off
- Helps players understand their claimed region

**Timer visual**:
- Large countdown number (25s, 24s, 23s...)
- Color changes as time runs low: green → yellow → red (< 5s)
- Pulsing animation when < 5 seconds

### 11.5 Feedback & Status Messages

**Top or bottom of screen**:

```
Status bar:
"✓ Action confirmed at (10, 10) | Waiting for timer... 15s remaining"
```

**Error messages** (if applicable):
- "❌ Too far from territory! Add adjacent to your cells."
- "❌ Cell already claimed by Player B."
- "⏰ Time's up! Action saved. Resolving..."

**Success**:
- "✓ Action confirmed!"
- "✓ Round resolved! +5 points (population)."

### 11.6 Responsive Design Notes

- Grid should scale to fit screen (zoom in/out)
- Mobile: single column (grid above, sidebar below)
- Desktop: side-by-side layout (grid left, sidebar right)
- Sidebar always visible (sticky, not scrollable)
- Preview can open in modal or split-screen depending on screen size

---

## 12. References

- [Game of Life Rules Document](./../../game-of-life-rules.md) — Comprehensive rules, patterns, and implementation notes
- [Brainstorm Notes](./../../brainstorm-notes.md) — Design evolution and decisions

---

**Design Status**: Ready for implementation planning.
