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

### 3.2 Player Decision Phase (NEW: Preview System)

**Current player's perspective**:
- Player sees the **current game state** (all cells, territories, scores)
- Player can make **hypothetical edits** (test placing/removing cells) without committing
- For each hypothetical edit, the game shows a **live preview** of the next game state (next Game of Life frame)
- Player iterates: adjust cell placement, watch preview, adjust again
- Once satisfied, player **commits** one action (or passes)

**How preview works**:
1. Current game state: `Grid[t]`
2. Player proposes: "Add cell at (x, y)"
3. Game computes: `Grid[t+1]` = `GameOfLife(Grid[t] + new cell)`
4. Preview displays `Grid[t+1]` to the player
5. Player can see consequences before committing
6. Once committed, the turn proceeds

**Multiple preview options**:
- Player can preview multiple different placements (e.g., "what if I add at (10,10)?" vs. "what if I add at (10,11)?")
- Each preview is independent; no changes are made until commit
- Player settles on one action and commits

### 3.3 Action Commit Phase

**Player chooses ONE of**:
- **Add 1 cell** at position (x, y): Must be adjacent to owned cells; must be within/adjacent to territory; must be empty
- **Pass**: Do nothing (skip action)
- (Remove cell: deferred for now; can be added later)

**After commit**:
- The chosen cell addition/pass is locked in
- Game does NOT re-simulate — the actual state remains as-is
- Proceed to Simulation phase

### 3.4 Simulation Phase

**Game of Life tick**:
- All cells update simultaneously using B3/S23 rules
- Births, deaths, and ownership assignments happen at once
- The preview that the player saw is now realized (or diverges, depending on other players' actions if multiplayer)

**Multi-player note**: If N > 1 players:
- All players see previews based on the current state
- All previews are independent (not accounting for other players' actions)
- Once Player 1 commits their action and Game ticks, Player 2's preview becomes outdated
- Player 2 gets a fresh preview based on the new state (after Player 1's action and tick)

### 3.5 Territorial Update & Scoring

After simulation:
1. Compute territories for each player
2. Apply wild cell rules (3+ turns outside → wild)
3. Apply conquest rules (3+ turns inside enemy territory → owned)
4. Update scores based on population, patterns, territory

### 3.6 Next Player

Move to the next player in turn order. Repeat from Section 3.2.

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
| Actions per turn | 1 | Add or remove 1 cell |
| Wild rule timeout | 3 turns | Outside territory → wild |
| Conquest timeout | 3 turns | Inside territory → owned |
| Population bonus | +1 per 5 cells | Each turn |
| Scoring period | Per turn or end-of-game | TBD |

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

## 8. Example Turn Flow

**Turn 1 - Player A's action**:
- A has 5 cells forming a Blinker pattern
- A adds 1 cell adjacent to their territory
- → Score: A gains +1 (population: 6 cells = 1 bonus)
- Game of Life tick applies
- → Blinker oscillates; new cell may birth due to neighbors
- Territorial check: A's territory now encompasses 7 cells
- Next: Player B's action

**Turn 2 - Player B's action**:
- B places a cell that will die next turn (strategic sacrifice)
- Game of Life tick
- Territorial check: B loses 2 cells to wildness (were outside territory for 3 turns)
- B's population drops to 4 cells
- Next: Player C's action (if exists)

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
3. **Tie-breaking**: If a dead cell has equal neighbors from two players, who owns it?
4. **Isolation rule**: Should isolated populations face penalties or auto-elimination?
5. **Rule modification system**: Cost structure, earning mechanics, global vs. local B/S changes?
6. **Pattern detection efficiency**: How to detect gliders, guns, puffers efficiently each tick?
7. **Multiplayer balance**: Is 1 action/turn fair for 2 vs. 8 players?
8. **Real-time vs. turn-based UI**: How should players interact (simultaneous actions or strict turn order)?

---

## 11. References

- [Game of Life Rules Document](./../../game-of-life-rules.md) — Comprehensive rules, patterns, and implementation notes
- [Brainstorm Notes](./../../brainstorm-notes.md) — Design evolution and decisions

---

**Design Status**: Ready for implementation planning.
