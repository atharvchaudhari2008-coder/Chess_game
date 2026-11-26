$(function () {

    const game = new Chess();

    let selectedSquare = null;
    let legalMoves = [];
    let lastMove = null;

    let whitePlayerName = "White";
    let blackPlayerName = "Black";

    let gameStarted = false;

    

    // Create chessboard with click-to-move functionality

const board = Chessboard('board', {

    position: 'start',

    draggable: false,

    pieceTheme:
        'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'

});
    // Clear highlights

    function clearHighlights() {

        $('#board .square-55d63').removeClass(
            'highlight-legal highlight-capture highlight-selected highlight-last'
        );

    }


    // Highlight last move

    function drawLastMove() {

        if (!lastMove) {
            return;
        }

        $('#board .square-' + lastMove.from +
            ', #board .square-' + lastMove.to)
            .addClass('highlight-last');

    }


    // Select chess piece

    function selectSquare(square) {

        const piece = game.get(square);

        clearHighlights();

        selectedSquare = null;
        legalMoves = [];

        if (!piece || piece.color !== game.turn()) {

            $('#hint').text('Select one of your own pieces.');

            drawLastMove();

            return;

        }

        selectedSquare = square;

        legalMoves = game.moves({

            square: square,
            verbose: true

        });

        $('#board .square-' + square)
            .addClass('highlight-selected');

        legalMoves.forEach(function (move) {

            const target = $('#board .square-' + move.to);

            if (move.captured) {

                target.addClass('highlight-capture');

            } else {

                target.addClass('highlight-legal');

            }

        });

        $('#hint').text(
            legalMoves.length +
            ' legal moves highlighted. Click a destination.'
        );

        drawLastMove();

    }


    // Click to move

    $('#board').on('click', '.square-55d63', function () {

        if (!gameStarted || game.game_over()) {
            return;
        }

        const square = $(this).attr('data-square');

        if (!square) {
            return;
        }

        // Move selected piece

        if (
            selectedSquare &&
            legalMoves.some(function (move) {
                return move.to === square;
            })
        ) {

            const from = selectedSquare;

            const move = game.move({

                from: from,
                to: square,
                promotion: 'q'

            });

            if (move) {

                lastMove = {
                    from: from,
                    to: square
                };

                selectedSquare = null;
                legalMoves = [];

                clearHighlights();

                board.position(game.fen());

                updateGame();

                return;

            }

        }

        // Select another piece

        selectSquare(square);

    });


    // Update game status

    function updateGame() {

        board.position(game.fen());

        clearHighlights();

        drawLastMove();

        const currentPlayer =
            game.turn() === 'w'
                ? whitePlayerName
                : blackPlayerName;

        $('#turnLabel').text(
            currentPlayer.toUpperCase() + ' TO MOVE'
        );

        let message = currentPlayer + ' to move';

        let hint = 'Select a piece to view its legal moves.';


        // Checkmate

        if (game.in_checkmate()) {

            message = 'Checkmate!';

            const winner =
                game.turn() === 'w'
                    ? blackPlayerName
                    : whitePlayerName;

            hint = winner + ' wins!';

            $('#winnerText').text(winner + ' Wins!');

            $('#checkmateOverlay').addClass('show');

        }

        // Stalemate

        else if (game.in_stalemate()) {

            message = 'Draw by stalemate';

            hint = 'No legal moves remain.';

        }

        // Draw

        else if (game.in_draw()) {

            message = 'Game drawn';

            hint = 'The game has ended in a draw.';

        }

        // Check

        else if (game.in_check()) {

            message = currentPlayer + ' is in check!';

            hint = 'Your king is under attack. Protect your king.';

        }

        $('#status').text(message);

        $('#hint').text(hint);

        renderHistory();

    }


    // Render move history

    function renderHistory() {

        const history = game.history();

        $('#moveCount').text(
            history.length +
            (history.length === 1 ? ' move' : ' moves')
        );

        $('#history').empty();

        if (history.length === 0) {

            $('#history').append(
                '<li>No moves yet.</li>'
            );

            return;

        }

        for (let i = 0; i < history.length; i += 2) {

            const white = history[i] || '';

            const black = history[i + 1] || '';

            const li = $('<li>');

            li.text(
                white + (black ? '   ' + black : '')
            );

            $('#history').append(li);

        }

    }


    // Start game

    $('#startGameBtn').click(function () {

        whitePlayerName =
            $('#whitePlayer').val().trim() || 'White';

        blackPlayerName =
            $('#blackPlayer').val().trim() || 'Black';

        $('#whiteNameDisplay').text(whitePlayerName);

        $('#blackNameDisplay').text(blackPlayerName);

        $('#playerSetup').hide();

        $('#playerInfo').show();

        $('#board').addClass('game-active');

        gameStarted = true;

        $('#undoBtn').prop('disabled', false);

        $('#flipBtn').prop('disabled', false);

        $('#restartBtn').prop('disabled', false);

        board.position('start');

        updateGame();

    });


    // Undo last move

    $('#undoBtn').click(function () {

        if (!gameStarted || game.history().length === 0) {
            return;
        }

        game.undo();

        lastMove = null;

        selectedSquare = null;
        legalMoves = [];

        $('#checkmateOverlay').removeClass('show');

        board.position(game.fen());

        updateGame();

    });


    // Flip board

    $('#flipBtn').click(function () {

        if (!gameStarted) {
            return;
        }

        board.flip();

    });


    // Restart game

    function restartGame() {

        game.reset();

        selectedSquare = null;
        legalMoves = [];
        lastMove = null;

        clearHighlights();

        $('#checkmateOverlay').removeClass('show');

        board.position('start');

        updateGame();

    }


    $('#restartBtn').click(function () {

        if (!gameStarted) {
            return;
        }

        restartGame();

    });


    // Play again after checkmate

    $('#playAgainBtn').click(function () {

        restartGame();

    });


    // Initial setup

    board.position('start');

    $('#board').removeClass('game-active');

    $('#undoBtn').prop('disabled', true);

    $('#flipBtn').prop('disabled', true);

    $('#restartBtn').prop('disabled', true);

});
