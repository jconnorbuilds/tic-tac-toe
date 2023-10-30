const GameBoard = (() => {
    // prettier-ignore
    let board = ["", "", "", "", "", "", "", "", ""]

    const reset = () => {
        board.forEach((_, index) => (board[index] = ""));
        Display.drawBoard();
    };

    const makeMove = function (player, position) {
        let marker = player.getMarker();
        response = { player, marker, position, board };
        if (!board[position].length) {
            board[position] = marker;
            Display.drawBoard();

            response.message = "Successful move";
            response.success = true;
            response.board = board;
            return response;
        }

        response.message = "please choose an unoccupied space";
        response.success = false;
        return response;
    };

    const getBoard = () => board;

    const checkForWinner = (theBoard, playerMarker) => {
        const winningPatterns = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [6, 4, 2],
        ];

        return winningPatterns.some((pattern) => {
            return pattern.every(
                (position) => theBoard[position] === playerMarker
            );
        });
    };

    const checkForFullBoard = (theBoard) => {
        return theBoard.every((space) => space.length > 0);
    };

    const hasWinner = () =>
        checkForWinner(board, Game.getCurrentPlayer().getMarker());
    const isFull = () => checkForFullBoard(board);

    return {
        makeMove,
        getBoard,
        hasWinner,
        isFull,
        reset,
    };
})();

function createPlayer(playerName, playerMarker) {
    const name =
        playerName.charAt(0).toUpperCase() + playerName.slice(1).toLowerCase();
    let marker = playerMarker.toUpperCase();
    let myTurn = false;
    const getMarker = () => marker;
    const setTurn = (bool) => (myTurn = bool === true ? true : false);
    const isCurrentPlayer = () => myTurn;

    return {
        name,
        isCurrentPlayer,
        setTurn,
        getMarker,
    };
}

const Display = (() => {
    const gameMsg = document.querySelector(".game-messages > p");

    const drawBoard = () => {
        const spaces = document.querySelectorAll(".gameboard .space");
        spaces.forEach(
            (space) =>
                (space.textContent = GameBoard.getBoard()[space.dataset.space])
        );
    };
    const setGameMessage = (messageKey) => {
        const player = Game.getCurrentPlayer();
        //prettier-ignore
        const messages = {
      initial: 'Please enter your names and click "Ready!"',
      playerTurn: `${player.name}'s turn. Place an '${player.getMarker()}'`,
      invalidMove: `You need to choose an empty space! ${player.name}, place an '${player.getMarker()}'.`,
      displayWinner: `${player.name} wins!! Click 'Start Over' to play again, or refresh the page to change players.`,
      tieGame: `It's a draw!! Click 'Start Over' to play again, or refresh the page to change players.`,
    };
        gameMsg.textContent = messages[messageKey];
    };

    return {
        drawBoard,
        setGameMessage,
    };
})();

const Game = (() => {
    const p1NameInput = document.querySelector("input#p1-name");
    const p2NameInput = document.querySelector("input#p2-name");

    const p1ReadyBtn = document.querySelector("button.p1-ready");
    const p2ReadyBtn = document.querySelector("button.p2-ready");

    const boardDisplay = document.querySelector(".gameboard");

    let player1;
    let player2;

    const readyBtns = document.querySelectorAll(".player button.ready");
    const nameInputs = document.querySelectorAll(".player input.name");

    const displayReadyMsg = (player) => {
        let initialMsg;
        let readyMsg;
        if (player === player1) {
            readyMsg = document.querySelector(".p1.is-ready");
            initialMsg = document.querySelector(".container-left div.player");
        } else {
            readyMsg = document.querySelector(".p2.is-ready");
            initialMsg = document.querySelector(".container-right div.player");
        }

        readyMsg.querySelector("h2").textContent = `${
            player.name
        } is ${player.getMarker()}`;
        initialMsg.classList.add("hidden");
        readyMsg.classList.remove("hidden");
        console.log(readyMsg.querySelector("h2").textContent);
    };

    readyBtns.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const nameInput = btn.classList.contains("p1-ready")
                ? p1NameInput
                : p2NameInput;
            const marker = btn.classList.contains("p1-ready") ? "X" : "O";
            const player = createPlayer(nameInput.value, marker);
            if (btn.classList.contains("p1-ready")) {
                player1 = player;
                displayReadyMsg(player1);
            } else {
                player2 = player;
                displayReadyMsg(player2);
            }
            if (player1 && player2) startGame();
        });
    });

    p1NameInput.addEventListener("input", () =>
        enableDisableBtn(p1NameInput, p1ReadyBtn)
    );
    p2NameInput.addEventListener("input", () =>
        enableDisableBtn(p2NameInput, p2ReadyBtn)
    );

    const enableDisableBtn = (input, btn) => {
        if (input.value.length >= 3) {
            btn.removeAttribute("disabled");
        } else {
            btn.setAttribute("disabled", "");
        }
    };

    const getCurrentPlayer = () => {
        return player1.isCurrentPlayer() ? player1 : player2;
    };

    const playersReady = () => {
        return p1IsReady && p2IsReady;
    };

    const nextPlayer = (players) => {
        for (const player of players) {
            player.isCurrentPlayer() === false
                ? player.setTurn(true)
                : player.setTurn(false);
        }
        Display.setGameMessage("playerTurn");
    };

    const getPlayers = () => [player1, player2];

    const resetGame = () => {
        if (player1 && player2) {
            player1.setTurn(true);
            Display.setGameMessage("playerTurn");
        }
        GameBoard.reset();
        Display.drawBoard();
        boardDisplay.addEventListener("click", playerTurn);
    };

    const winnerSequence = (player) => {
        boardDisplay.removeEventListener("click", playerTurn);
        Display.setGameMessage("displayWinner");
    };

    const tieSequence = () => {
        boardDisplay.removeEventListener("click", playerTurn);
        Display.setGameMessage("tieGame");
    };

    const restartBtn = document.querySelector(".reset-btn");
    restartBtn.addEventListener("click", resetGame);

    const handleTurnResult = (move) => {
        if (move.success) {
            if (!GameBoard.hasWinner() && !GameBoard.isFull()) {
                nextPlayer(getPlayers());
            } else if (GameBoard.hasWinner()) {
                winnerSequence(move.player);
            } else if (GameBoard.isFull()) {
                tieSequence();
            }
        } else {
            Display.setGameMessage("invalidMove");
        }
    };

    const playerTurn = (e) => {
        const currentPlayer = getCurrentPlayer();
        if (e.target.classList.contains("space")) {
            const position = e.target.dataset.space;
            const playerMove = GameBoard.makeMove(currentPlayer, position);
            handleTurnResult(playerMove);
        }
    };

    const startGame = () => {
        GameBoard.reset();
        player1.setTurn(true);
        boardDisplay.addEventListener("click", playerTurn);
        Display.setGameMessage("playerTurn");
        console.log("playing");
    };

    return {
        getCurrentPlayer,
        player1,
        player2,
    };
})();
