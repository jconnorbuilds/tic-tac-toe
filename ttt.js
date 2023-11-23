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
    let order;
    const setOrder = (playerOrder) => (order = playerOrder);
    const getOrder = () => order;

    return {
        name,
        isCurrentPlayer,
        setTurn,
        getMarker,
        setOrder,
        getOrder,
    };
}

const Display = (() => {
    const readyBtns = document.querySelectorAll(".player button.ready");
    const nameInputs = document.querySelectorAll(".player input.name");
    const p1NameInput = document.querySelector("input#p1-name");
    const p2NameInput = document.querySelector("input#p2-name");
    const gameMsg = document.querySelector(".game-messages > p");
    const p1ReadyBtn = document.querySelector("button.p1-ready");
    const p2ReadyBtn = document.querySelector("button.p2-ready");

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

    const setReadyMsgDivs = (player) => {
        const isPlayer1 = player.getOrder() === 1;
        const readyMsgSelector = isPlayer1 ? ".p1.is-ready" : ".p2.is-ready";
        const initMsgSelector = isPlayer1
            ? ".container-left div.player"
            : ".container-right div.player";

        return {
            readyMsgDiv: document.querySelector(readyMsgSelector),
            initialMsgDiv: document.querySelector(initMsgSelector),
        };
    };

    const showReadyMsg = (initMsgDiv, rdyMsgDiv) => {
        initMsgDiv.classList.remove("hidden");
        rdyMsgDiv.classList.add("hidden");
    };

    const setReadyMsgText = (div, player) => {
        div.querySelector("h2").textContent = `${
            player.name
        } is ${player.getMarker()}`;
    };

    const displayReadyMsg = (player) => {
        let { readyMsgDiv, initialMsgDiv } = setReadyMsgDivs(player);
        setReadyMsgText(readyMsgDiv, player);
        showReadyMsg(readyMsgDiv, initialMsgDiv);
    };

    const enableDisableBtn = (input, btn) => {
        if (input.value.length >= 3) {
            btn.removeAttribute("disabled");
        } else {
            btn.setAttribute("disabled", "");
        }
    };

    const player1Ready = (player) => {
        Game.setPlayer1(player);
        displayReadyMsg(Game.getPlayer1());
    };

    function player2Ready(player) {
        Game.setPlayer2(player);
        displayReadyMsg(Game.getPlayer2());
    }

    function setPlayerReady(btn, player) {
        btn.classList.contains("p1-ready")
            ? player1Ready(player)
            : player2Ready(player);
        console.log(Game.getPlayer1());
        console.log(Game.getPlayer2());
    }

    const setPlayerOrder = (player, isPlayer1) => {
        const playerOrder = isPlayer1 ? 1 : 2;
        player.setOrder(playerOrder);
    };

    const handleReadyBtn = (btn) => () => {
        const isPlayer1 = btn.classList.contains("p1-ready");
        console.log({ isPlayer1 });
        const nameInput = isPlayer1 ? p1NameInput : p2NameInput;
        const marker = isPlayer1 ? "X" : "O";
        const player = createPlayer(nameInput.value, marker);
        console.log({ player });

        setPlayerOrder(player, isPlayer1);
        setPlayerReady(btn, player);
        displayReadyMsg(player, isPlayer1);

        if (Game.getPlayer1() && Game.getPlayer2()) Game.startGame();
    };

    readyBtns.forEach((btn) => {
        btn.addEventListener("click", handleReadyBtn(btn));
    });

    p1NameInput.addEventListener("input", () =>
        enableDisableBtn(p1NameInput, p1ReadyBtn)
    );
    p2NameInput.addEventListener("input", () =>
        enableDisableBtn(p2NameInput, p2ReadyBtn)
    );

    return {
        drawBoard,
        setGameMessage,
        displayReadyMsg,
    };
})();

const Game = (() => {
    const boardDisplay = document.querySelector(".gameboard");

    let player1;
    let player2;

    const getPlayer1 = () => player1;
    const getPlayer2 = () => player2;
    const setPlayer1 = (player) => {
        console.log("setp1 has been called");
        player1 = player;
    };
    const setPlayer2 = (player) => {
        console.log("setp2 has been called");
        player2 = player;
    };

    const getCurrentPlayer = () =>
        player1.isCurrentPlayer() ? player1 : player2;

    const nextPlayer = (players) => {
        players.forEach((p) => {
            p.isCurrentPlayer() === false ? p.setTurn(true) : p.setTurn(false);
        });
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

    const winnerSequence = () => {
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
                winnerSequence();
            } else if (GameBoard.isFull()) {
                tieSequence();
            }
        } else {
            Display.setGameMessage("invalidMove");
        }
    };

    const playerTurn = (e) => {
        if (e.target.classList.contains("space")) {
            const position = e.target.dataset.space;
            const playerMove = GameBoard.makeMove(getCurrentPlayer(), position);
            handleTurnResult(playerMove);
        }
    };

    const startGame = () => {
        console.log({ player1 });
        console.log({ player2 });
        GameBoard.reset();
        player1.setTurn(true);
        boardDisplay.addEventListener("click", playerTurn);
        Display.setGameMessage("playerTurn");
    };

    return {
        getCurrentPlayer,
        getPlayer1,
        getPlayer2,
        setPlayer1,
        setPlayer2,
        startGame,
    };
})();
