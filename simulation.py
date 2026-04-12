#!/usr/bin/env python3
"""
Game of Life Multiplayer Simulation
Explores competitive gameplay with two players, pattern recognition, and rule changes.
"""

from collections import defaultdict

class GameOfLifeSimulation:
    def __init__(self, width=20, height=20):
        self.width = width
        self.height = height
        # Grid stores player IDs: 0=empty, 1=Player A, 2=Player B
        self.grid = [[0 for _ in range(width)] for _ in range(height)]
        self.birth_rules = {1, 2, 3}  # B{1,2,3}
        self.survive_rules = {2, 3}   # S{2,3}
        self.scores = {'A': 0, 'B': 0}
        self.generation = 0
        self.pattern_history = defaultdict(list)

    def set_initial_patterns(self):
        """Set up initial populations for both players"""
        # Player A: Vertical blinker at (5, 5)
        self.grid[5][5] = 1
        self.grid[6][5] = 1
        self.grid[7][5] = 1

        # Player B: L-pentomino at (5, 15)
        self.grid[5][15] = 2
        self.grid[6][16] = 2
        self.grid[7][14] = 2
        self.grid[7][15] = 2
        self.grid[7][16] = 2

    def count_neighbors(self, x, y):
        """Count live neighbors (both players) around cell (x, y)"""
        count = 0
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                nx = (x + dx) % self.width
                ny = (y + dy) % self.height
                if self.grid[ny][nx] > 0:
                    count += 1
        return count

    def count_neighbors_by_player(self, x, y):
        """Count neighbors by player"""
        counts = {1: 0, 2: 0}
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                nx = (x + dx) % self.width
                ny = (y + dy) % self.height
                player = self.grid[ny][nx]
                if player > 0:
                    counts[player] += 1
        return counts

    def step(self):
        """Advance one generation"""
        new_grid = [[0 for _ in range(self.width)] for _ in range(self.height)]

        for y in range(self.height):
            for x in range(self.width):
                current_player = self.grid[y][x]
                total_neighbors = self.count_neighbors(x, y)
                neighbor_counts = self.count_neighbors_by_player(x, y)

                if current_player > 0:  # Cell is alive
                    if total_neighbors in self.survive_rules:
                        new_grid[y][x] = current_player  # Survives
                    # else: dies (stays 0)
                else:  # Cell is dead
                    if total_neighbors in self.birth_rules:
                        # Birth: cell becomes alive - belongs to majority neighbor player
                        if neighbor_counts[1] > neighbor_counts[2]:
                            new_grid[y][x] = 1
                        elif neighbor_counts[2] > neighbor_counts[1]:
                            new_grid[y][x] = 2
                        # If tied, let's say it becomes player 1
                        else:
                            new_grid[y][x] = 1

        self.grid = new_grid
        self.generation += 1

    def detect_patterns(self):
        """Detect specific patterns and award points"""
        # Simple pattern detection
        patterns_found = {'A': [], 'B': []}

        for player_id, player_name in [(1, 'A'), (2, 'B')]:
            cells = [(y, x) for y in range(self.height) for x in range(self.width) if self.grid[y][x] == player_id]

            if len(cells) == 0:
                continue

            # Detect blinker (3 cells in a line, period 2)
            if self._is_blinker(player_id, cells):
                patterns_found[player_name].append(('Blinker', 3))

            # Detect glider (4-5 cells in specific arrangement)
            if self._is_glider(player_id, cells):
                patterns_found[player_name].append(('Glider', 10))

            # Detect block (2x2)
            if self._is_block(player_id, cells):
                patterns_found[player_name].append(('Block', 2))

        return patterns_found

    def _is_blinker(self, player_id, cells):
        """Check if pattern is a blinker"""
        if len(cells) != 3:
            return False

        # Check if all in same row or column
        rows = set(c[0] for c in cells)
        cols = set(c[1] for c in cells)

        if len(rows) == 1 or len(cols) == 1:
            return True
        return False

    def _is_glider(self, player_id, cells):
        """Check if pattern resembles a glider"""
        if len(cells) < 4 or len(cells) > 5:
            return False

        # Gliders typically have width/height of 3-4
        min_row = min(c[0] for c in cells)
        max_row = max(c[0] for c in cells)
        min_col = min(c[1] for c in cells)
        max_col = max(c[1] for c in cells)

        width = max_col - min_col + 1
        height = max_row - min_row + 1

        if 3 <= width <= 4 and 3 <= height <= 4:
            return True
        return False

    def _is_block(self, player_id, cells):
        """Check if pattern is a 2x2 block"""
        if len(cells) != 4:
            return False

        rows = set(c[0] for c in cells)
        cols = set(c[1] for c in cells)

        if len(rows) == 2 and len(cols) == 2:
            return True
        return False

    def update_scores(self):
        """Update scores based on current patterns and population"""
        patterns = self.detect_patterns()

        for player_name, patterns_list in patterns.items():
            for pattern_name, points in patterns_list:
                self.scores[player_name] += points
                print(f"    [{player_name}] Found {pattern_name}! +{points} points")

        # Population size bonus (1 point per 5 cells)
        for player_id, player_name in [(1, 'A'), (2, 'B')]:
            pop_size = sum(1 for y in range(self.height) for x in range(self.width) if self.grid[y][x] == player_id)
            pop_bonus = pop_size // 5
            self.scores[player_name] += pop_bonus

    def change_rules(self, birth_set, survive_set):
        """Change the rules (B/S notation)"""
        self.birth_rules = birth_set
        self.survive_rules = survive_set

    def display_grid(self):
        """Display the current grid"""
        print(f"\n{'='*60}")
        print(f"Generation {self.generation} | Scores: A={self.scores['A']}, B={self.scores['B']}")
        print(f"Rules: B{{{','.join(map(str, sorted(self.birth_rules)))}/S{','.join(map(str, sorted(self.survive_rules)))}}}")
        print(f"{'='*60}")

        for y in range(self.height):
            row = ""
            for x in range(self.width):
                if self.grid[y][x] == 0:
                    row += ". "
                elif self.grid[y][x] == 1:
                    row += "A "
                else:
                    row += "B "
            print(row)

        pop_a = sum(1 for y in range(self.height) for x in range(self.width) if self.grid[y][x] == 1)
        pop_b = sum(1 for y in range(self.height) for x in range(self.width) if self.grid[y][x] == 2)
        print(f"Population A: {pop_a} | Population B: {pop_b}")

def main():
    print("=" * 60)
    print("Game of Life: Multiplayer Competitive Simulation")
    print("=" * 60)

    sim = GameOfLifeSimulation(width=20, height=20)
    sim.set_initial_patterns()

    print("\n[INITIAL STATE]")
    sim.display_grid()

    # Run for 20 generations
    for gen in range(1, 21):
        sim.step()
        sim.update_scores()

        if gen % 3 == 0 or gen <= 3:  # Display every 3 gens, or first 3
            sim.display_grid()

        # At generation 10, change rules to Seeds (B2/S)
        if gen == 10:
            print("\n[RULE CHANGE AT GENERATION 10]")
            print("Player B changes rules to B2/S (Seeds) to disrupt Player A!")
            sim.change_rules(birth_set={2}, survive_set=set())
            print("New rules: B2/S (dead cells birth with 2 neighbors, no cells survive)")

    print("\n" + "=" * 60)
    print("FINAL SCORES")
    print("=" * 60)
    print(f"Player A: {sim.scores['A']} points")
    print(f"Player B: {sim.scores['B']} points")

    if sim.scores['A'] > sim.scores['B']:
        print("\n🎉 Player A WINS!")
    elif sim.scores['B'] > sim.scores['A']:
        print("\n🎉 Player B WINS!")
    else:
        print("\n⚖️ TIED!")

if __name__ == "__main__":
    main()
