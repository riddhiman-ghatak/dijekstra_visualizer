import pygame
import sys
import heapq

# Constants
WIDTH = 600
HEIGHT = 600
ROWS = 30
COLS = 30
CELL_SIZE = WIDTH // COLS

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
GREY = (128, 128, 128)
BLUE = (0, 0, 255)
RED = (255, 0, 0)
GREEN = (0, 255, 0)
YELLOW = (255, 255, 0)

# Pygame Initialization
pygame.init()
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Dijkstra Visualizer")

# Node Class
class Node:
    def __init__(self, row, col):
        self.row = row
        self.col = col
        self.x = col * CELL_SIZE
        self.y = row * CELL_SIZE
        self.color = WHITE
        self.neighbors = []
        self.visited = False
        self.distance = float("inf")
        self.previous = None

    def __lt__(self, other):
        return self.distance < other.distance

    def draw(self, screen):
        pygame.draw.rect(screen, self.color, (self.x, self.y, CELL_SIZE, CELL_SIZE))

    def add_neighbors(self, grid):
        if self.row < ROWS - 1:  # DOWN
            self.neighbors.append(grid[self.row + 1][self.col])
        if self.row > 0:  # UP
            self.neighbors.append(grid[self.row - 1][self.col])
        if self.col < COLS - 1:  # RIGHT
            self.neighbors.append(grid[self.row][self.col + 1])
        if self.col > 0:  # LEFT
            self.neighbors.append(grid[self.row][self.col - 1])

# Grid Functions
def make_grid():
    grid = []
    for row in range(ROWS):
        grid.append([])
        for col in range(COLS):
            node = Node(row, col)
            grid[row].append(node)
    return grid

def draw_grid():
    for row in range(ROWS):
        for col in range(COLS):
            rect = pygame.Rect(col * CELL_SIZE, row * CELL_SIZE, CELL_SIZE, CELL_SIZE)
            pygame.draw.rect(screen, GREY, rect, 1)

def draw_grid_nodes(screen, grid):
    for row in grid:
        for node in row:
            node.draw(screen)

def update_display():
    draw_grid_nodes(screen, grid)
    draw_grid()
    pygame.display.update()

# Dijkstra Algorithm
def dijkstra(grid, start, target):
    start.distance = 0
    pq = [(0, start)]
    heapq.heapify(pq)

    while pq:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

        current_distance, current_node = heapq.heappop(pq)

        if current_node.visited:
            continue

        current_node.visited = True
        if current_node != start and current_node != target:
            current_node.color = BLUE

        if current_node == target:
            while current_node.previous:
                if current_node != target:
                    current_node.color = YELLOW
                current_node = current_node.previous
                update_display()
                pygame.time.delay(50)  # Slow down the backtracking
            return True

        for neighbor in current_node.neighbors:
            if neighbor.color == BLACK:
                continue  # Skip obstacles
            distance = current_distance + 1  # Assuming uniform weight

            if distance < neighbor.distance:
                neighbor.distance = distance
                neighbor.previous = current_node
                heapq.heappush(pq, (distance, neighbor))
                if neighbor != target:
                    neighbor.color = GREEN  # Color nodes in consideration

        update_display()
        pygame.time.delay(20)  # Control visualization speed

    return False

# Main Loop
def main():
    global grid
    grid = make_grid()

    start = None
    target = None

    run = True
    while run:
        screen.fill(WHITE)
        draw_grid_nodes(screen, grid)
        draw_grid()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                run = False

            if pygame.mouse.get_pressed()[0]:  # LEFT CLICK
                pos = pygame.mouse.get_pos()
                row = pos[1] // CELL_SIZE
                col = pos[0] // CELL_SIZE
                node = grid[row][col]
                if not start:
                    start = node
                    start.color = GREEN
                elif not target:
                    target = node
                    target.color = RED
                elif node != start and node != target:
                    node.color = BLACK

            elif pygame.mouse.get_pressed()[2]:  # RIGHT CLICK
                pos = pygame.mouse.get_pos()
                row = pos[1] // CELL_SIZE
                col = pos[0] // CELL_SIZE
                node = grid[row][col]
                node.color = WHITE
                if node == start:
                    start = None
                elif node == target:
                    target = None

            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_SPACE and start and target:
                    for row in grid:
                        for node in row:
                            node.add_neighbors(grid)
                    
                    dijkstra(grid, start, target)

        update_display()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()