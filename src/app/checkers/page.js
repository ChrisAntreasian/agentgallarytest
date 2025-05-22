"use client";

import { useState } from 'react';
import styles from './checkers.module.css';

const createInitialBoard = () => {
  const board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  for (let row = 0; row < 3; row++) {
    for (let col = (row % 2 === 0 ? 1 : 0); col < 8; col += 2) {
      board[row][col] = { color: 'black', king: false };
    }
  }

  for (let row = 5; row < 8; row++) {
    for (let col = (row % 2 === 0 ? 1 : 0); col < 8; col += 2) {
      board[row][col] = { color: 'red', king: false };
    }
  }

  return board;
};

const isValidMove = (fromRow, fromCol, toRow, toCol, board, currentPlayer) => {
  console.log(`Validating move from row: ${fromRow}, col: ${fromCol} to row: ${toRow}, col: ${toCol}`);
  const piece = board[fromRow][fromCol];
  const target = board[toRow][toCol];

  if (target) {
    console.log('Target cell is not empty');
    return false;
  }
  if (!piece) {
    console.log('No piece at the starting cell');
    return false;
  }
  if (piece.color !== currentPlayer) {
    console.log(`Piece color (${piece.color}) does not match current player (${currentPlayer})`);
    return false;
  }

  const rowDiff = toRow - fromRow;
  const colDiff = Math.abs(toCol - fromCol);
  console.log(`rowDiff: ${rowDiff}, colDiff: ${colDiff}`);

  if (!piece.king) {
    const direction = piece.color === 'red' ? -1 : 1; // Adjusted direction for red pieces to move upward
    console.log(`Piece is not a king. Expected direction: ${direction}`);

    if (Math.abs(rowDiff) === 1 && colDiff === 1 && rowDiff === direction) {
      console.log('Valid regular move');
      return true;
    }

    if (
      Math.abs(rowDiff) === 2 &&
      colDiff === 2 &&
      rowDiff === 2 * direction &&
      board[fromRow + direction][(fromCol + toCol) / 2]?.color !== currentPlayer
    ) {
      console.log('Valid capture move');
      return true;
    }

    if (Math.abs(rowDiff) === 2 && colDiff === 2 && rowDiff === 2 * direction) {
      const capturedRow = fromRow + direction;
      const capturedCol = (fromCol + toCol) / 2;
      const capturedPiece = board[capturedRow]?.[capturedCol];

      if (capturedPiece && capturedPiece.color !== currentPlayer) {
        return true;
      }
    }
  }

  if (piece.king) {
    console.log('Piece is a king');
    if (Math.abs(rowDiff) === 1 && colDiff === 1) {
      console.log('Valid king move');
      return true;
    }

    if (
      Math.abs(rowDiff) === 2 &&
      colDiff === 2 &&
      board[(fromRow + toRow) / 2][(fromCol + toCol) / 2]?.color !== currentPlayer
    ) {
      console.log('Valid king capture move');
      return true;
    }

    if (Math.abs(rowDiff) === 2 && colDiff === 2) {
      const capturedRow = (fromRow + toRow) / 2;
      const capturedCol = (fromCol + toCol) / 2;
      const capturedPiece = board[capturedRow]?.[capturedCol];

      if (capturedPiece && capturedPiece.color !== currentPlayer) {
        return true;
      }
    }
  }

  console.log('Move is invalid');
  return false;
};

export default function Checkers() {
  const [board, setBoard] = useState(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [selectedPiece, setSelectedPiece] = useState(null);

  const handleCellClick = (row, col) => {
    console.log(`Cell clicked at row: ${row}, col: ${col}`);
    const piece = board[row][col];

    if (selectedPiece) {
      const { row: fromRow, col: fromCol } = selectedPiece;
      console.log(`Selected piece at row: ${fromRow}, col: ${fromCol}`);

      if (fromRow === row && fromCol === col) {
        console.log('Deselecting the piece');
        setSelectedPiece(null);
        return;
      }

      if (isValidMove(fromRow, fromCol, row, col, board, currentPlayer)) {
        console.log(`Moving piece from row: ${fromRow}, col: ${fromCol} to row: ${row}, col: ${col}`);
        const newBoard = board.map((r) => r.map((c) => c));
        newBoard[fromRow][fromCol] = null;
        newBoard[row][col] = { ...board[fromRow][fromCol] }; // Preserve the original piece properties

        if (Math.abs(row - fromRow) === 2) {
          const capturedRow = (fromRow + row) / 2;
          const capturedCol = (fromCol + col) / 2;
          newBoard[capturedRow][capturedCol] = null;

          // Check for additional jumps if the piece is not a king
          if (!newBoard[row][col].king) {
            const additionalJumps = [
              [row - 2, col - 2],
              [row - 2, col + 2],
              [row + 2, col - 2],
              [row + 2, col + 2],
            ];

            for (const [nextRow, nextCol] of additionalJumps) {
              if (isValidMove(row, col, nextRow, nextCol, newBoard, currentPlayer)) {
                setSelectedPiece({ row, col });
                setBoard(newBoard);
                return;
              }
            }
          }
        }

        // Prevent deselection or invalid moves during a multi-jump
        if (selectedPiece && Math.abs(row - selectedPiece.row) === 2) {
          console.log('Multi-jump in progress. You cannot deselect or make an invalid move.');
          return;
        }

        if ((currentPlayer === 'red' && row === 0) || (currentPlayer === 'black' && row === 7)) {
          console.log(`Promoting piece to king at row: ${row}, col: ${col}`);
          newBoard[row][col].king = true;
        }

        setBoard(newBoard);
        setSelectedPiece(null);
        setCurrentPlayer(currentPlayer === 'red' ? 'black' : 'red');
        return;
      } else {
        console.log('Invalid move attempted');
      }
    }

    if (piece && piece.color === currentPlayer) {
      console.log(`Selecting piece at row: ${row}, col: ${col}`);
      setSelectedPiece({ row, col });
    }
  };

  return (
    <div className={styles.checkersContainer}>
      <p>Current Player: {currentPlayer}</p>
      <div className={styles.board}>
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className={styles.row}>
            {row.map((cell, colIndex) => {
              const isPossibleMove = selectedPiece && isValidMove(selectedPiece.row, selectedPiece.col, rowIndex, colIndex, board, currentPlayer);
              const isCompulsoryMove = selectedPiece && Math.abs(rowIndex - selectedPiece.row) === 2 && Math.abs(colIndex - selectedPiece.col) === 2 && isValidMove(selectedPiece.row, selectedPiece.col, rowIndex, colIndex, board, currentPlayer);

              return (
                <div
                  key={colIndex}
                  className={
                    `${styles.cell} ${
                      (rowIndex + colIndex) % 2 === 0 ? styles.light : styles.dark
                    } ${
                      selectedPiece &&
                      selectedPiece.row === rowIndex &&
                      selectedPiece.col === colIndex
                        ? styles.selectedCell
                        : ''
                    } ${isPossibleMove ? styles.possibleMove : ''} ${isCompulsoryMove ? styles.compulsoryMove : ''}`
                  }
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell && (
                    <div
                      className={
                        `${styles.piece} ${
                          cell.color === 'red' ? styles.redPiece : styles.blackPiece
                        } ${cell.king ? styles.king : ''} ${
                          selectedPiece &&
                          selectedPiece.row === rowIndex &&
                          selectedPiece.col === colIndex
                            ? styles.selected
                            : ''
                        }`
                      }
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}