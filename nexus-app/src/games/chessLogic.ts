/** Tiny chess rules — low memory, no Stockfish. */

export type Color = "w" | "b";
export type Piece = "K" | "Q" | "R" | "B" | "N" | "P" | "k" | "q" | "r" | "b" | "n" | "p";
export type Board = (Piece | null)[];

export const START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export function emptyBoard(): Board {
  return Array(64).fill(null);
}

export function parseFen(fen = START_FEN): {
  board: Board;
  turn: Color;
} {
  const [placement, turn] = fen.split(" ");
  const board = emptyBoard();
  let i = 0;
  for (const ch of placement) {
    if (ch === "/") continue;
    if (ch >= "1" && ch <= "8") {
      i += Number(ch);
      continue;
    }
    board[i++] = ch as Piece;
  }
  return { board, turn: turn === "b" ? "b" : "w" };
}

export function isWhite(p: Piece | null): boolean {
  return !!p && p === p.toUpperCase();
}

export function pieceColor(p: Piece | null): Color | null {
  if (!p) return null;
  return isWhite(p) ? "w" : "b";
}

const DELTAS: Record<string, number[][]> = {
  N: [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ],
  K: [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ],
};

function onBoard(r: number, c: number) {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function idx(r: number, c: number) {
  return r * 8 + c;
}

function rc(i: number) {
  return [Math.floor(i / 8), i % 8] as const;
}

function slide(
  board: Board,
  from: number,
  turn: Color,
  dirs: number[][],
): number[] {
  const [r0, c0] = rc(from);
  const out: number[] = [];
  for (const [dr, dc] of dirs) {
    let r = r0 + dr;
    let c = c0 + dc;
    while (onBoard(r, c)) {
      const t = board[idx(r, c)];
      if (!t) out.push(idx(r, c));
      else {
        if (pieceColor(t) !== turn) out.push(idx(r, c));
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return out;
}

/** Pseudo-legal moves (ignores leaving own king in check — filtered later). */
export function rawMoves(board: Board, from: number, turn: Color): number[] {
  const p = board[from];
  if (!p || pieceColor(p) !== turn) return [];
  const kind = p.toUpperCase();
  const [r0, c0] = rc(from);
  const out: number[] = [];

  if (kind === "N" || kind === "K") {
    for (const [dr, dc] of DELTAS[kind]) {
      const r = r0 + dr;
      const c = c0 + dc;
      if (!onBoard(r, c)) continue;
      const t = board[idx(r, c)];
      if (!t || pieceColor(t) !== turn) out.push(idx(r, c));
    }
    return out;
  }

  if (kind === "P") {
    const dir = turn === "w" ? -1 : 1;
    const start = turn === "w" ? 6 : 1;
    const ahead = idx(r0 + dir, c0);
    if (onBoard(r0 + dir, c0) && !board[ahead]) {
      out.push(ahead);
      const two = idx(r0 + 2 * dir, c0);
      if (r0 === start && !board[two]) out.push(two);
    }
    for (const dc of [-1, 1]) {
      const r = r0 + dir;
      const c = c0 + dc;
      if (!onBoard(r, c)) continue;
      const t = board[idx(r, c)];
      if (t && pieceColor(t) !== turn) out.push(idx(r, c));
    }
    return out;
  }

  if (kind === "R" || kind === "Q") {
    out.push(
      ...slide(board, from, turn, [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]),
    );
  }
  if (kind === "B" || kind === "Q") {
    out.push(
      ...slide(board, from, turn, [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]),
    );
  }
  return out;
}

function findKing(board: Board, color: Color): number {
  const want = color === "w" ? "K" : "k";
  return board.findIndex((p) => p === want);
}

function attackedBy(board: Board, square: number, by: Color): boolean {
  for (let i = 0; i < 64; i++) {
    if (pieceColor(board[i]) !== by) continue;
    if (rawMoves(board, i, by).includes(square)) return true;
  }
  return false;
}

export function inCheck(board: Board, color: Color): boolean {
  const k = findKing(board, color);
  if (k < 0) return true;
  return attackedBy(board, k, color === "w" ? "b" : "w");
}

export function legalMoves(board: Board, from: number, turn: Color): number[] {
  return rawMoves(board, from, turn).filter((to) => {
    const next = board.slice() as Board;
    const piece = next[from]!;
    next[to] = piece;
    next[from] = null;
    // promote
    if (piece.toUpperCase() === "P") {
      const [r] = rc(to);
      if (r === 0 || r === 7) next[to] = (turn === "w" ? "Q" : "q") as Piece;
    }
    return !inCheck(next, turn);
  });
}

export function applyMove(
  board: Board,
  from: number,
  to: number,
): Board {
  const next = board.slice() as Board;
  const piece = next[from];
  if (!piece) return next;
  next[to] = piece;
  next[from] = null;
  if (piece.toUpperCase() === "P") {
    const [r] = rc(to);
    if (r === 0) next[to] = "Q";
    if (r === 7) next[to] = "q";
  }
  return next;
}

export function allLegalMoves(
  board: Board,
  turn: Color,
): { from: number; to: number }[] {
  const moves: { from: number; to: number }[] = [];
  for (let i = 0; i < 64; i++) {
    if (pieceColor(board[i]) !== turn) continue;
    for (const to of legalMoves(board, i, turn)) {
      moves.push({ from: i, to });
    }
  }
  return moves;
}

export function randomCpuMove(
  board: Board,
  turn: Color,
): { from: number; to: number } | null {
  const moves = allLegalMoves(board, turn);
  if (!moves.length) return null;
  return moves[Math.floor(Math.random() * moves.length)];
}

export const GLYPH: Record<Piece, string> = {
  K: "♔",
  Q: "♕",
  R: "♖",
  B: "♗",
  N: "♘",
  P: "♙",
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
  p: "♟",
};
