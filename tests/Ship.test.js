import Ship from '../src/Ship';

test('ship stores its length', () => {
  const ship = new Ship(3);
  expect(ship.length).toBe(3);
});

test('hit() increases hit count', () => {
  const ship = new Ship(3);
  ship.hit();
  expect(ship.hits).toBe(1);
});

test('ship is not sunk if hits < length', () => {
  const ship = new Ship(3);
  ship.hit();
  ship.hit();
  expect(ship.isSunk()).toBe(false);
});

test('ship is sunk if hits === length', () => {
  const ship = new Ship(2);
  ship.hit();
  ship.hit();
  expect(ship.isSunk()).toBe(true);
});
