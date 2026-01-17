import Gameboard from './Gameboard.js';

export default class Player {
  constructor(type) {
    this.type = type;
    this.gameboard = new Gameboard();
    this.attacks = new Set();
    this.targetQueue = []; // Queue for smart targeting after a hit
    this.lastHit = null; // Track the last successful hit
  }

  randomAttack() {
    let coord;
    do {
      coord = [
        Math.floor(Math.random() * 10),
        Math.floor(Math.random() * 10),
      ];
    } while (this.attacks.has(coord.toString()));

    this.attacks.add(coord.toString());
    return coord;
  }

  // Smart attack that targets adjacent cells after a hit
  smartAttack(opponentBoard) {
    // If we have targets in queue, attack them first
    if (this.targetQueue.length > 0) {
      const coord = this.targetQueue.shift();
      if (!this.attacks.has(coord.toString())) {
        this.attacks.add(coord.toString());
        return coord;
      }
      // If already attacked, try next in queue
      return this.smartAttack(opponentBoard);
    }
    
    // Otherwise, make a random attack
    return this.randomAttack();
  }

  // Add adjacent cells to target queue after a hit
  addAdjacentTargets(coord) {
    const [x, y] = coord;
    const adjacents = [
      [x - 1, y], // up
      [x + 1, y], // down
      [x, y - 1], // left
      [x, y + 1], // right
    ];

    // Add valid adjacent cells that haven't been attacked yet
    adjacents.forEach(([newX, newY]) => {
      if (
        newX >= 0 && newX < 10 &&
        newY >= 0 && newY < 10 &&
        !this.attacks.has([newX, newY].toString())
      ) {
        // Only add if not already in queue
        const coordStr = [newX, newY].toString();
        const alreadyQueued = this.targetQueue.some(
          (target) => target.toString() === coordStr
        );
        if (!alreadyQueued) {
          this.targetQueue.push([newX, newY]);
        }
      }
    });

    this.lastHit = coord;
  }
}
