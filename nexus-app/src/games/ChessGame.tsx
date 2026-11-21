import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { spacing, useTheme } from "../theme";
import {
  GLYPH,
  applyMove,
  inCheck,
  legalMoves,
  parseFen,
  randomCpuMove,
  type Board,
  type Color,
  allLegalMoves,
} from "./chessLogic";

type Mode = "pvp" | "cpu";

export function ChessGame() {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const size = Math.min(360, Math.max(280, width - 48));
  const cell = size / 8;

  const start = useMemo(() => parseFen(), []);
  const [board, setBoard] = useState<Board>(start.board);
  const [turn, setTurn] = useState<Color>(start.turn);
  const [sel, setSel] = useState<number | null>(null);
  const [mode, setMode] = useState<Mode>("cpu");
  const [status, setStatus] = useState("White to move");

  const highlights = useMemo(() => {
    if (sel == null) return new Set<number>();
    return new Set(legalMoves(board, sel, turn));
  }, [board, sel, turn]);

  const finishTurn = useCallback(
    (next: Board, nextTurn: Color) => {
      setBoard(next);
      setTurn(nextTurn);
      setSel(null);
      const moves = allLegalMoves(next, nextTurn);
      if (!moves.length) {
        if (inCheck(next, nextTurn)) {
          setStatus(nextTurn === "w" ? "Checkmate — Black wins" : "Checkmate — White wins");
        } else {
          setStatus("Stalemate");
        }
        return;
      }
      const check = inCheck(next, nextTurn) ? " — check" : "";
      setStatus(`${nextTurn === "w" ? "White" : "Black"} to move${check}`);
    },
    [],
  );

  const playCpu = useCallback(
    (afterBoard: Board) => {
      const mv = randomCpuMove(afterBoard, "b");
      if (!mv) {
        finishTurn(afterBoard, "b");
        return;
      }
      const next = applyMove(afterBoard, mv.from, mv.to);
      finishTurn(next, "w");
    },
    [finishTurn],
  );

  function onSquare(i: number) {
    if (status.includes("wins") || status === "Stalemate") return;
    if (mode === "cpu" && turn === "b") return;

    if (sel != null && highlights.has(i)) {
      const next = applyMove(board, sel, i);
      if (mode === "cpu") {
        setBoard(next);
        setSel(null);
        setStatus("Black thinking…");
        setTimeout(() => playCpu(next), 180);
      } else {
        finishTurn(next, turn === "w" ? "b" : "w");
      }
      return;
    }

    const p = board[i];
    if (p && ((turn === "w" && p === p.toUpperCase()) || (turn === "b" && p === p.toLowerCase()))) {
      setSel(i);
    } else {
      setSel(null);
    }
  }

  function reset() {
    const s = parseFen();
    setBoard(s.board);
    setTurn(s.turn);
    setSel(null);
    setStatus("White to move");
  }

  return (
    <View>
      <View style={styles.toolbar}>
        <Pressable
          onPress={() => {
            setMode("cpu");
            reset();
          }}
          style={[
            styles.chip,
            {
              borderColor: mode === "cpu" ? colors.accent : colors.border,
              backgroundColor: mode === "cpu" ? colors.accentSoft : "transparent",
            },
          ]}
        >
          <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 12 }}>
            vs CPU
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setMode("pvp");
            reset();
          }}
          style={[
            styles.chip,
            {
              borderColor: mode === "pvp" ? colors.accent : colors.border,
              backgroundColor: mode === "pvp" ? colors.accentSoft : "transparent",
            },
          ]}
        >
          <Text style={{ color: colors.accent, fontWeight: "700", fontSize: 12 }}>
            2 players
          </Text>
        </Pressable>
        <Pressable
          onPress={reset}
          style={[styles.chip, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.fg, fontWeight: "700", fontSize: 12 }}>
            New game
          </Text>
        </Pressable>
      </View>

      <Text style={{ color: colors.fgDim, marginBottom: spacing.sm }}>{status}</Text>

      <View
        style={{
          width: size,
          height: size,
          borderWidth: 1,
          borderColor: colors.border,
          alignSelf: "center",
        }}
      >
        {Array.from({ length: 64 }, (_, i) => {
          const r = Math.floor(i / 8);
          const c = i % 8;
          const light = (r + c) % 2 === 0;
          const selected = sel === i;
          const hi = highlights.has(i);
          const p = board[i];
          return (
            <Pressable
              key={i}
              onPress={() => onSquare(i)}
              style={{
                position: "absolute",
                left: c * cell,
                top: r * cell,
                width: cell,
                height: cell,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: selected
                  ? colors.accentSoft
                  : hi
                    ? "rgba(57,255,20,0.22)"
                    : light
                      ? "#1a2e1a"
                      : "#0a120a",
              }}
            >
              {p ? (
                <Text style={{ fontSize: cell * 0.62, color: colors.fg }}>
                  {GLYPH[p]}
                </Text>
              ) : hi ? (
                <View
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: colors.accent,
                    opacity: 0.55,
                  }}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>
      <Text
        style={{
          color: colors.fgDim,
          fontSize: 11,
          marginTop: spacing.sm,
          lineHeight: 16,
        }}
      >
        Lightweight local chess — no online engine. CPU picks a random legal
        move (tiny RAM).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  chip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
});
