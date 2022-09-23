const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const path = require('path');
const { Game } = require('./game');
const { Player } = require('./player');

app.use('/', express.static(path.join(__dirname, 'public')));

const playerQueue = [];
const ongoingGames = {};

io.on('connection', (socket) => {
  socket.on('new_player', (playerName) => {
    console.log(
      `player connected with name: ${playerName} and id: ${socket.id}`
    );
    const playerWaiting = playerQueue.shift();
    if (!playerWaiting) {
      const player = new Player(socket.id, playerName, 'X');
      playerQueue.push(player);
      socket.emit('waiting_for_opponent');
    } else {
      const newPlayer = new Player(socket.id, playerName, 'O');
      const game = new Game(playerWaiting, newPlayer);
      ongoingGames[playerWaiting.id] = game;
      ongoingGames[newPlayer.id] = game;
      emitMakeMove(game);
    }
  });

  socket.on('move_made', (data) => {
    const game = ongoingGames[data.player];
    game.makeMove(data.row, data.col, data.player);
    if (game.winner !== undefined) {
      emitEndGame(game);
      return;
    }
    emitMakeMove(game);
  });

  socket.on('disconnect', () => {
    if (isPlayerInQueue(socket.id)) {
      playerQueue = playerQueue.filter((player) => player.id !== socket.id);
      return;
    }

    if (ongoingGames[socket.id]) {
      const game = ongoingGames[socket.id];
      const player =
        game.player1.id === socket.id ? game.player2 : game.player1;
      emitOpponentLeft(player.id);
      delete ongoingGames[socket.id];
    }

    console.log(`player disconnected with id: ${socket.id}`);
  });
});

const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`listening on *:${port}`);
});

function isPlayerInQueue(playerId) {
  return playerQueue.some((player) => player.id === playerId);
}

function emitMakeMove(game) {
  io.to(game.player1.id).emit('make_move', {
    board: game.board,
    turn: game.turn,
    player1: game.player1.name,
    player2: game.player2.name,
  });
  io.to(game.player2.id).emit('make_move', {
    board: game.board,
    turn: game.turn,
    player1: game.player1.name,
    player2: game.player2.name,
  });
}

function emitEndGame(game) {
  io.to(game.player1.id).emit('game_over', {
    board: game.board,
    winner: game.winner,
  });
  io.to(game.player2.id).emit('game_over', {
    board: game.board,
    winner: game.winner,
  });
}

function emitOpponentLeft(playerId) {
  io.to(playerId).emit('opponent_left');
}
