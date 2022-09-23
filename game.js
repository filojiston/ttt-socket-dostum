class Game {
  constructor(player1, player2) {
    this.player1 = player1;
    this.player2 = player2;
    this.turn = player1.id;
    this.board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', ''],
    ];
    this.winner = undefined;
  }

  makeMove(x, y, playerId) {
    if (this.turn !== playerId) {
      return;
    }

    if (!this.isValidMove(x, y)) {
      return;
    }

    this.board[x][y] = this.turn === this.player1.id ? 'X' : 'O';

    if (this.checkWin()) {
      this.winner = this.turn;
      return;
    }

    if (this.checkTie()) {
      this.winner = 'tie';
      return;
    }

    this.toggleTurn();
  }

  isValidMove(x, y) {
    return this.board[x][y] === '';
  }

  toggleTurn() {
    this.turn === this.player1.id
      ? (this.turn = this.player2.id)
      : (this.turn = this.player1.id);
  }

  checkWin() {
    const checkHorizontal = () => {
      for (let i = 0; i < 3; i++) {
        if (
          this.board[i][0] !== '' &&
          this.board[i][0] === this.board[i][1] &&
          this.board[i][1] === this.board[i][2]
        ) {
          return true;
        }
      }
      return false;
    };

    const checkVertical = () => {
      for (let i = 0; i < 3; i++) {
        if (
          this.board[0][i] !== '' &&
          this.board[0][i] === this.board[1][i] &&
          this.board[1][i] === this.board[2][i]
        ) {
          return true;
        }
      }
      return false;
    };

    const checkDiagonal = () => {
      return (
        (this.board[0][0] !== '' &&
          this.board[0][0] === this.board[1][1] &&
          this.board[1][1] === this.board[2][2]) ||
        (this.board[0][2] !== '' &&
          this.board[0][2] === this.board[1][1] &&
          this.board[0][2] === this.board[2][0])
      );
    };

    return checkHorizontal() || checkVertical() || checkDiagonal();
  }

  checkTie() {
    return this.board.every((row) => row.every((cell) => cell !== ''));
  }
}

exports.Game = Game;
