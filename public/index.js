const playerNameElement = document.getElementById('player_name');
const playerNameInputElement = document.getElementById('player_name_input');
const playerNameButtonElement = document.getElementById('player_name_button');
const waitingForPlayerElement = document.getElementById('waiting_for_player');
const boardElement = document.getElementById('board');
const cellElements = document.querySelectorAll('.cell');
const gameOverElement = document.getElementById('game_over');
const player1Element = document.getElementById('player1');
const player2Element = document.getElementById('player2');

waitingForPlayerElement.style.display = 'none';
boardElement.style.display = 'none';

function initializeGame() {
  function addClickEventToCells() {
    cellElements.forEach((cell) => {
      cell.addEventListener('click', () => {
        const [row, column] = cell.id.split('-');
        const player = socket.id;
        makeMove(row, column, player);
      });
    });
  }

  addClickEventToCells();
}

initializeGame();

function sendPlayerName() {
  let playerName = playerNameInputElement.value;
  if (playerName === null || playerName.trim() === '') {
    playerName = `Player ${Math.floor(Math.random() * 1000)}`;
  }
  playerNameElement.style.display = 'none';
  socket.emit('new_player', playerName);
}

function showCellsAsNotClickable() {
  cellElements.forEach((cell) => {
    cell.classList.add('unclickable');
    cell.classList.remove('clickable');
  });
}

function showCellsAsClickable() {
  cellElements.forEach((cell) => {
    if (cell.innerHTML === '') {
      cell.classList.add('clickable');
      cell.classList.remove('unclickable');
    }
  });
}

function makeMove(x, y, player) {
  const data = {
    row: x,
    col: y,
    player,
  };

  socket.emit('move_made', data);
}

function updateBoard(board) {
  board.forEach((row, x) => {
    row.forEach((cell, y) => {
      const cellElement = document.getElementById(`${x}-${y}`);
      cellElement.innerHTML = cell;
    });
  });
}

const socket = io();

socket.on('waiting_for_opponent', () => {
  waitingForPlayerElement.style.display = 'block';
});

socket.on('make_move', (move) => {
  waitingForPlayerElement.style.display = 'none';
  boardElement.style.display = 'block';
  player1Element.innerText = move.player1;
  player2Element.innerText = move.player2;
  updateBoard(move.board);
  if (move.turn === socket.id) {
    showCellsAsClickable();
  } else {
    showCellsAsNotClickable();
  }
});

socket.on('game_over', (data) => {
  updateBoard(data.board);
  showCellsAsNotClickable();
  const winner = data.winner;
  if (winner === socket.id) {
    gameOverElement.innerHTML = 'You won!';
  } else if (winner === 'tie') {
    gameOverElement.innerHTML = "It's a tie!";
  } else {
    gameOverElement.innerHTML = 'You lost!';
  }
});

socket.on('opponent_left', () => {
  showCellsAsNotClickable();
  gameOverElement.innerHTML = 'You Won! Your opponent left!';
});
