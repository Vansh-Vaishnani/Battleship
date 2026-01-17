import Player from '../src/Player';

test('player has a gameboard', () => {
  const player = new Player('human');
  expect(player.gameboard).toBeDefined();
});

test('computer player can make a move', () => {
  const player = new Player('computer');
  const move = player.randomAttack();
  expect(move.length).toBe(2);
});
