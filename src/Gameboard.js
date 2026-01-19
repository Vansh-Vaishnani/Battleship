import Ship from './Ship.js';

export default class Gameboard {
  constructor() {
    this.ships = [];
    this.shipPositions = new Map();
    this.missedAttacks = [];
  }

  placeShip(start, length, direction) {
    const ship = new Ship(length);
    const positions = [];

    for (let i = 0; i < length; i++) {
      const x = direction === 'horizontal' ? start[0] : start[0] + i;
      const y = direction === 'horizontal' ? start[1] + i : start[1];
      const key = `${x},${y}`;
      this.shipPositions.set(key, ship);
      positions.push(key);
    }

    this.ships.push(ship);
  }

  receiveAttack(coord) {
    const key = `${coord[0]},${coord[1]}`;
    if (this.shipPositions.has(key)) {
      this.shipPositions.get(key).hit();
    } else {
      this.missedAttacks.push(coord);
    }
  }

  allShipsSunk() {
    return this.ships.every((ship) => ship.isSunk());
  }

  getSunkShipsCount() {
    return this.ships.filter((ship) => ship.isSunk()).length;
  }
}
