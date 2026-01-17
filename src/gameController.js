import Player from './Player.js';

export default function gameController() {
  const player = new Player('human');
  const computer = new Player('computer');
  let currentPlayer = player;

  function switchTurn() {
    currentPlayer = currentPlayer === player ? computer : player;
  }

  function checkGameOver() {
    return (
      player.gameboard.allShipsSunk() ||
      computer.gameboard.allShipsSunk()
    );
  }

  return { player, computer, switchTurn, checkGameOver };
}
