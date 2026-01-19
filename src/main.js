import Player from './Player.js';

class BattleshipGame {
  constructor() {
    this.gameMode = null; // 'computer' or '2player'
    this.player1 = null;
    this.player2 = null;
    this.currentPlayer = null;
    this.opponent = null;
    this.isPlacementPhase = true;
    this.isProcessingTurn = false; // Prevent multiple clicks
    this.shipsToPlace = [
      { name: 'Carrier', length: 5 },
      { name: 'Battleship', length: 4 },
      { name: 'Cruiser', length: 3 },
      { name: 'Submarine', length: 3 },
      { name: 'Destroyer', length: 2 },
    ];
    this.currentShipIndex = 0;
    this.draggedShip = null;
    
    this.initializeElements();
    this.setupEventListeners();
  }

  initializeElements() {
    // Mode selection
    this.modeSelection = document.getElementById('mode-selection');
    this.vsComputerBtn = document.getElementById('vs-computer-btn');
    this.twoPlayerBtn = document.getElementById('two-player-btn');

    // Placement phase
    this.placementPhase = document.getElementById('placement-phase');
    this.placementTitle = document.getElementById('placement-title');
    this.placementInstructions = document.getElementById('placement-instructions');
    this.shipsContainer = document.getElementById('ships-container');
    this.placementBoard = document.getElementById('placement-board');
    this.startGameBtn = document.getElementById('start-game-btn');

    // Pass device screen
    this.passDeviceScreen = document.getElementById('pass-device-screen');
    this.passMessage = document.getElementById('pass-message');
    this.readyBtn = document.getElementById('ready-btn');

    // Game phase
    this.gamePhase = document.getElementById('game-phase');
    this.turnIndicator = document.getElementById('turn-indicator');
    this.gameMessage = document.getElementById('game-message');
    this.playerBoard = document.getElementById('player-board');
    this.enemyBoard = document.getElementById('enemy-board');
    this.playerLabel = document.getElementById('player-label');
    this.enemyLabel = document.getElementById('enemy-label');

    // Game over
    this.gameOverScreen = document.getElementById('game-over-screen');
    this.winnerMessage = document.getElementById('winner-message');
    this.playAgainBtn = document.getElementById('play-again-btn');

    // Info modal
    this.infoBtn = document.getElementById('info-btn');
    this.infoModal = document.getElementById('info-modal');
    this.closeModal = document.querySelector('.close');
  }

  setupEventListeners() {
    // Mode selection
    this.vsComputerBtn.addEventListener('click', () => this.startGame('computer'));
    this.twoPlayerBtn.addEventListener('click', () => this.startGame('2player'));

    // Placement
    this.startGameBtn.addEventListener('click', () => this.handleStartGame());

    // Pass device
    this.readyBtn.addEventListener('click', () => this.handleReadyButton());

    // Game over
    this.playAgainBtn.addEventListener('click', () => this.resetGame());

    // Info modal
    this.infoBtn.addEventListener('click', () => this.showInfoModal());
    this.closeModal.addEventListener('click', () => this.hideInfoModal());
    window.addEventListener('click', (e) => {
      if (e.target === this.infoModal) {
        this.hideInfoModal();
      }
    });
  }

  startGame(mode) {
    this.gameMode = mode;
    this.player1 = new Player('human');
    this.player2 = new Player(mode === 'computer' ? 'computer' : 'human');
    this.currentPlayer = this.player1;
    this.opponent = this.player2;

    this.modeSelection.classList.add('hidden');
    this.showPlacementPhase();
  }

  showPlacementPhase() {
    this.placementPhase.classList.remove('hidden');
    
    if (this.currentPlayer === this.player1) {
      this.placementTitle.textContent = this.gameMode === '2player' ? 'Player 1: Place Your Ships' : 'Place Your Ships';
    } else {
      this.placementTitle.textContent = 'Player 2: Place Your Ships';
    }

    this.renderPlacementBoard();
    this.setupDragAndDrop();
  }

  renderPlacementBoard() {
    this.placementBoard.innerHTML = '';
    for (let i = 0; i < 100; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.index = i;
      cell.dataset.row = Math.floor(i / 10);
      cell.dataset.col = i % 10;
      
      // Add drag over handlers
      cell.addEventListener('dragover', (e) => this.handleDragOver(e));
      cell.addEventListener('drop', (e) => this.handleDrop(e));
      cell.addEventListener('dragleave', (e) => this.handleDragLeave(e));
      
      this.placementBoard.appendChild(cell);
    }
  }

  setupDragAndDrop() {
    const shipItems = document.querySelectorAll('.ship-item');
    shipItems.forEach((shipItem) => {
      // Reset placed state
      shipItem.classList.remove('placed');
      shipItem.draggable = true;

      // Remove old event listeners by cloning
      const newShipItem = shipItem.cloneNode(true);
      shipItem.parentNode.replaceChild(newShipItem, shipItem);

      // Click to rotate
      newShipItem.addEventListener('click', (e) => {
        if (!newShipItem.classList.contains('placed')) {
          const currentDirection = newShipItem.dataset.direction;
          const newDirection = currentDirection === 'horizontal' ? 'vertical' : 'horizontal';
          newShipItem.dataset.direction = newDirection;
          
          const preview = newShipItem.querySelector('.ship-preview');
          if (newDirection === 'vertical') {
            preview.classList.add('vertical');
          } else {
            preview.classList.remove('vertical');
          }
        }
      });

      // Drag handlers
      newShipItem.addEventListener('dragstart', (e) => {
        if (!newShipItem.classList.contains('placed')) {
          // Read the current direction at drag time
          this.draggedShip = {
            length: parseInt(newShipItem.dataset.length),
            direction: newShipItem.dataset.direction,
            element: newShipItem,
          };
          console.log('Dragging ship:', this.draggedShip); // Debug log
        } else {
          e.preventDefault();
        }
      });

      newShipItem.addEventListener('dragend', () => {
        this.clearPlacementHighlights();
      });
    });
  }

  handleDragOver(e) {
    e.preventDefault();
    if (!this.draggedShip) return;

    const cell = e.target;
    if (!cell.classList.contains('cell')) return;

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    
    this.clearPlacementHighlights();
    this.highlightPlacement(row, col, this.draggedShip.length, this.draggedShip.direction);
  }

  handleDragLeave(e) {
    // Only clear if leaving the board container
    if (e.target === this.placementBoard) {
      this.clearPlacementHighlights();
    }
  }

  handleDrop(e) {
    e.preventDefault();
    if (!this.draggedShip) return;

    const cell = e.target;
    if (!cell.classList.contains('cell')) return;

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (this.canPlaceShip(row, col, this.draggedShip.length, this.draggedShip.direction)) {
      this.placeShip(row, col, this.draggedShip.length, this.draggedShip.direction);
      this.draggedShip.element.classList.add('placed');
      this.draggedShip.element.draggable = false;
      
      // Check if all ships are placed
      const allPlaced = Array.from(document.querySelectorAll('.ship-item')).every(
        (item) => item.classList.contains('placed')
      );
      
      if (allPlaced) {
        this.startGameBtn.classList.remove('hidden');
      }
    }

    this.clearPlacementHighlights();
    this.draggedShip = null;
  }

  highlightPlacement(row, col, length, direction) {
    const isValid = this.canPlaceShip(row, col, length, direction);
    
    for (let i = 0; i < length; i++) {
      const currentRow = direction === 'horizontal' ? row : row + i;
      const currentCol = direction === 'horizontal' ? col + i : col;
      
      if (currentRow >= 0 && currentRow < 10 && currentCol >= 0 && currentCol < 10) {
        const index = currentRow * 10 + currentCol;
        const cell = this.placementBoard.children[index];
        cell.classList.add(isValid ? 'valid-placement' : 'invalid-placement');
      }
    }
  }

  clearPlacementHighlights() {
    const cells = this.placementBoard.querySelectorAll('.cell');
    cells.forEach((cell) => {
      cell.classList.remove('valid-placement', 'invalid-placement');
    });
  }

  canPlaceShip(row, col, length, direction) {
    // Check bounds
    if (direction === 'horizontal' && col + length > 10) return false;
    if (direction === 'vertical' && row + length > 10) return false;

    // Check for overlapping ships
    for (let i = 0; i < length; i++) {
      const currentRow = direction === 'horizontal' ? row : row + i;
      const currentCol = direction === 'horizontal' ? col + i : col;
      const key = `${currentRow},${currentCol}`;
      
      if (this.currentPlayer.gameboard.shipPositions.has(key)) {
        return false;
      }
    }

    return true;
  }

  placeShip(row, col, length, direction) {
    this.currentPlayer.gameboard.placeShip([row, col], length, direction);
    
    // Update visual board
    for (let i = 0; i < length; i++) {
      const currentRow = direction === 'horizontal' ? row : row + i;
      const currentCol = direction === 'horizontal' ? col + i : col;
      const index = currentRow * 10 + currentCol;
      const cell = this.placementBoard.children[index];
      cell.classList.add('ship');
    }
  }

  handleStartGame() {
    // Always hide placement phase first
    this.placementPhase.classList.add('hidden');
    
    if (this.gameMode === 'computer') {
      // Computer mode: place computer ships and start game immediately
      this.placeComputerShips();
      this.startGamePhase();
    } else if (this.gameMode === '2player' && this.currentPlayer === this.player1) {
      // Two player mode: show pass device screen for player 2
      this.showPassDeviceScreen('Player 2');
    } else {
      // Player 2 done placing ships
      this.startGamePhase();
    }
  }

  showPassDeviceScreen(nextPlayer) {
    this.passDeviceScreen.classList.remove('hidden');
    this.passMessage.textContent = `It's ${nextPlayer}'s turn`;
  }

  handleReadyButton() {
    this.passDeviceScreen.classList.add('hidden');
    
    if (this.isPlacementPhase) {
      // Switch to player 2 placement
      this.currentPlayer = this.player2;
      this.opponent = this.player1;
      this.showPlacementPhase();
    } else {
      // Continue game after pass - show game phase
      this.gamePhase.classList.remove('hidden');
      this.updateGameDisplay();
    }
  }

  placeComputerShips() {
    const ships = [5, 4, 3, 3, 2];
    ships.forEach((length) => {
      let placed = false;
      while (!placed) {
        const row = Math.floor(Math.random() * 10);
        const col = Math.floor(Math.random() * 10);
        const direction = Math.random() < 0.5 ? 'horizontal' : 'vertical';
        
        // Temporarily switch to player2 for placement check
        const temp = this.currentPlayer;
        this.currentPlayer = this.player2;
        
        if (this.canPlaceShip(row, col, length, direction)) {
          this.placeShip(row, col, length, direction);
          placed = true;
        }
        
        this.currentPlayer = temp;
      }
    });
  }

  startGamePhase() {
    this.isPlacementPhase = false;
    this.placementPhase.classList.add('hidden');
    this.gamePhase.classList.remove('hidden');
    
    this.currentPlayer = this.player1;
    this.opponent = this.player2;
    
    this.renderGameBoards();
    this.updateGameDisplay();
  }

  renderGameBoards() {
    if (this.gameMode === 'computer') {
      // In computer mode, always show player1 board on left, player2 (computer) on right
      this.renderBoard(this.playerBoard, this.player1, true);
      this.renderBoard(this.enemyBoard, this.player2, false);
    } else {
      // In 2-player mode, show current player's board on left, opponent on right
      this.renderBoard(this.playerBoard, this.currentPlayer, true);
      this.renderBoard(this.enemyBoard, this.opponent, false);
    }
  }

  renderBoard(boardElement, player, showShips) {
    boardElement.innerHTML = '';
    
    for (let i = 0; i < 100; i++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      const row = Math.floor(i / 10);
      const col = i % 10;
      const key = `${row},${col}`;
      
      // Show ships on player's own board
      if (showShips && player.gameboard.shipPositions.has(key)) {
        cell.classList.add('ship');
      }
      
      // Show hits and misses
      const wasAttacked = player === this.currentPlayer ?
        this.opponent.attacks.has([row, col].toString()) :
        this.currentPlayer.attacks.has([row, col].toString());
      
      if (wasAttacked) {
        if (player.gameboard.shipPositions.has(key)) {
          cell.classList.add('hit');
        } else {
          cell.classList.add('miss');
        }
      }
      
      // Add click handler for enemy board
      if (!showShips && boardElement === this.enemyBoard) {
        cell.dataset.row = row;
        cell.dataset.col = col;
        cell.addEventListener('click', () => this.handleCellClick(row, col));
      }
      
      boardElement.appendChild(cell);
    }
  }

  handleCellClick(row, col) {
    // Prevent clicks during processing or computer turn
    if (this.isProcessingTurn || this.currentPlayer.type === 'computer') {
      return;
    }
    
    const coord = [row, col];
    
    // Check if already attacked
    if (this.currentPlayer.attacks.has(coord.toString())) {
      this.gameMessage.textContent = 'Already attacked this cell!';
      return;
    }
    
    // Lock turn
    this.isProcessingTurn = true;
    
    // Perform attack
    this.currentPlayer.attacks.add(coord.toString());
    this.opponent.gameboard.receiveAttack(coord);
    
    // Check if hit
    const key = `${row},${col}`;
    const isHit = this.opponent.gameboard.shipPositions.has(key);
    
    if (isHit) {
      this.gameMessage.textContent = 'Hit!';
    } else {
      this.gameMessage.textContent = 'Miss!';
    }
    
    // Update boards immediately
    this.renderGameBoards();
    
    // Check for game over
    if (this.opponent.gameboard.allShipsSunk()) {
      this.endGame();
      return;
    }
    
    // Switch turns after short delay
    setTimeout(() => {
      this.switchTurn();
    }, 800);
  }

  switchTurn() {
    const temp = this.currentPlayer;
    this.currentPlayer = this.opponent;
    this.opponent = temp;
    
    if (this.gameMode === '2player') {
      // Show pass device screen
      this.gamePhase.classList.add('hidden');
      const playerName = this.currentPlayer === this.player1 ? 'Player 1' : 'Player 2';
      this.showPassDeviceScreen(playerName);
      this.isProcessingTurn = false;
    } else if (this.currentPlayer.type === 'computer') {
      // Computer's turn
      this.turnIndicator.textContent = 'Computer\'s Turn';
      this.gameMessage.textContent = 'Computer is thinking...';
      
      setTimeout(() => {
        this.computerTurn();
      }, 1000);
    } else {
      // Player's turn
      this.isProcessingTurn = false;
      this.updateGameDisplay();
    }
  }

  computerTurn() {
    const coord = this.currentPlayer.smartAttack(this.opponent.gameboard);
    this.opponent.gameboard.receiveAttack(coord);
    
    const key = `${coord[0]},${coord[1]}`;
    const isHit = this.opponent.gameboard.shipPositions.has(key);
    
    if (isHit) {
      this.currentPlayer.addAdjacentTargets(coord);
      this.gameMessage.textContent = 'Computer hit your ship!';
    } else {
      this.gameMessage.textContent = 'Computer missed!';
    }
    
    // Update boards immediately
    this.renderGameBoards();
    
    // Check for game over
    if (this.opponent.gameboard.allShipsSunk()) {
      this.endGame();
      return;
    }
    
    // Switch back to player
    setTimeout(() => {
      this.isProcessingTurn = false;
      this.switchTurn();
    }, 1000);
  }

  updateGameDisplay() {
    if (this.gameMode === '2player') {
      const playerName = this.currentPlayer === this.player1 ? 'Player 1' : 'Player 2';
      const opponentName = this.opponent === this.player1 ? 'Player 1' : 'Player 2';
      this.turnIndicator.textContent = `${playerName}'s Turn`;
      this.playerLabel.textContent = `${playerName}'s Board`;
      this.enemyLabel.textContent = `${opponentName}'s Board`;
    } else {
      this.turnIndicator.textContent = 'Your Turn';
      this.playerLabel.textContent = 'Your Board';
      this.enemyLabel.textContent = 'Computer\'s Board';
    }
    
    this.gameMessage.textContent = 'Click on enemy board to attack!';
    this.renderGameBoards();
  }

  endGame() {
    this.gamePhase.classList.add('hidden');
    this.gameOverScreen.classList.remove('hidden');
    
    if (this.gameMode === '2player') {
      const winner = this.opponent === this.player1 ? 'Player 1' : 'Player 2';
      this.winnerMessage.textContent = `🎉 ${winner} Wins!`;
    } else {
      if (this.opponent === this.player2) {
        this.winnerMessage.textContent = '🎉 You Win!';
      } else {
        this.winnerMessage.textContent = '💔 Computer Wins!';
      }
    }
  }

  resetGame() {
    // Hide all screens
    this.gameOverScreen.classList.add('hidden');
    this.gamePhase.classList.add('hidden');
    this.placementPhase.classList.add('hidden');
    this.passDeviceScreen.classList.add('hidden');
    
    // Show mode selection
    this.modeSelection.classList.remove('hidden');
    
    // Reset game state
    this.gameMode = null;
    this.player1 = null;
    this.player2 = null;
    this.currentPlayer = null;
    this.opponent = null;
    this.isPlacementPhase = true;
    this.currentShipIndex = 0;
    this.draggedShip = null;
    this.startGameBtn.classList.add('hidden');
  }

  showInfoModal() {
    this.infoModal.classList.remove('hidden');
  }

  hideInfoModal() {
    this.infoModal.classList.add('hidden');
  }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BattleshipGame();
});
