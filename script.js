const map = document.getElementById('map');
const startBtn = document.getElementById('startBtn');
const pauseDuration = 100; // milliseconds
let startNode = null;
let endNode = null;
let nodes = [];
let edges = [];

class Node {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.isStart = false;
        this.isEnd = false;
        this.distance = Infinity;
        this.previousNode = null;
        this.visited = false;
        this.edges = [];
        this.element = document.createElement('div');
        this.element.classList.add('node');
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        this.element.addEventListener('click', () => this.handleClick());
    }

    handleClick() {
        if (!startNode) {
            this.isStart = true;
            startNode = this;
            this.element.classList.add('start');
        } else if (!endNode) {
            this.isEnd = true;
            endNode = this;
            this.element.classList.add('end');
        }
    }

    reset() {
        this.isStart = false;
        this.isEnd = false;
        this.distance = Infinity;
        this.previousNode = null;
        this.visited = false;
        this.element.className = 'node';
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }

    setVisited() {
        if (!this.isStart && !this.isEnd) {
            this.element.classList.add('visited');
        }
    }

    setPath() {
        if (!this.isStart && !this.isEnd) {
            this.element.classList.add('path');
        }
    }

    addEdge(edge) {
        this.edges.push(edge);
    }
}

class Edge {
    constructor(node1, node2) {
        this.node1 = node1;
        this.node2 = node2;
        this.weight = Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
        this.element = document.createElement('div');
        this.element.classList.add('edge');
        this.positionElement();
    }

    positionElement() {
        const x1 = this.node1.x + 10; // Center of node1
        const y1 = this.node1.y + 10; // Center of node1
        const x2 = this.node2.x + 10; // Center of node2
        const y2 = this.node2.y + 10; // Center of node2
        const length = this.weight;
        const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        this.element.style.width = `${length}px`;
        this.element.style.transform = `rotate(${angle}deg)`;
        this.element.style.left = `${x1}px`;
        this.element.style.top = `${y1}px`;
    }

    setVisited() {
        this.element.classList.add('visited');
    }

    setPath() {
        this.element.classList.add('path');
    }
}

function createGraph() {
    const nodePositions = [
        { x: 100, y: 100 }, { x: 200, y: 150 }, { x: 300, y: 100 },
        { x: 400, y: 200 }, { x: 500, y: 300 }, { x: 600, y: 200 },
        { x: 700, y: 100 }, { x: 400, y: 400 }, { x: 200, y: 400 }
    ];

    nodePositions.forEach((pos, id) => {
        let node = new Node(id, pos.x, pos.y);
        map.appendChild(node.element);
        nodes.push(node);
    });

    const edgePairs = [
        [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
        [5, 6], [0, 7], [7, 8], [8, 0], [1, 7]
    ];

    edgePairs.forEach(([id1, id2]) => {
        let edge = new Edge(nodes[id1], nodes[id2]);
        nodes[id1].addEdge(edge);
        nodes[id2].addEdge(edge);
        map.appendChild(edge.element);
        edges.push(edge);
    });
}

async function dijkstra() {
    const unvisitedNodes = [...nodes];
    startNode.distance = 0;
    while (!!unvisitedNodes.length) {
        unvisitedNodes.sort((a, b) => a.distance - b.distance);
        const closestNode = unvisitedNodes.shift();
        if (closestNode.distance === Infinity) return;
        closestNode.visited = true;
        closestNode.setVisited();
        await pause(pauseDuration);
        if (closestNode === endNode) {
            visualizePath();
            return;
        }
        updateUnvisitedNeighbors(closestNode);
    }
}

function updateUnvisitedNeighbors(node) {
    const neighbors = node.edges.map(edge => (edge.node1 === node ? edge.node2 : edge.node1));
    neighbors.forEach(neighbor => {
        const distance = node.distance + node.edges.find(edge => (edge.node1 === neighbor || edge.node2 === neighbor)).weight;
        if (distance < neighbor.distance) {
            neighbor.distance = distance;
            neighbor.previousNode = node;
        }
    });
}

function visualizePath() {
    let currentNode = endNode;
    while (currentNode !== null) {
        currentNode.setPath();
        const previousNode = currentNode.previousNode;
        if (previousNode) {
            const edge = currentNode.edges.find(edge => (edge.node1 === previousNode || edge.node2 === previousNode));
            if (edge) edge.setPath();
        }
        currentNode = currentNode.previousNode;
    }
}

function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

startBtn.addEventListener('click', () => {
    nodes.forEach(node => node.reset());
    dijkstra();
});

createGraph();
