import { useMemo, useState } from "react";
import { Linking, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { BreakoutGame } from "../games/BreakoutGame";
import { ChessGame } from "../games/ChessGame";
import { GAME_CATALOG, type GameId } from "../games/catalog";
import { Game2048 } from "../games/Game2048";
import { PongGame } from "../games/PongGame";
import { SnakeGame } from "../games/SnakeGame";
import { TetrisGame } from "../games/TetrisGame";
import { GlassPanel } from "../components/GlassPanel";
import { PressableCard } from "../components/PressableCard";
import { ScreenShell } from "../components/ScreenShell";
import { spacing, useTheme } from "../theme";

/** Desktop / USB — optional tiny pure-JS 2D games (chess first). One mount at a time. */
export function GamesScreen() {
  const { colors } = useTheme();
  const [active, setActive] = useState<GameId | null>("chess");
  const def = useMemo(
    () => GAME_CATALOG.find((g) => g.id === active) ?? null,
    [active],
  );

  if (Platform.OS !== "web") {
    return (
      <ScreenShell>
        <GlassPanel title="Games">
          <Text style={{ color: colors.fgDim, lineHeight: 20 }}>
            Mini-games ship with the Windows / Mac / USB desktop companion to
            keep phone memory light. Open the desktop app for Chess and the tiny
            classics.
          </Text>
        </GlassPanel>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell>
      <GlassPanel title="Games · low memory">
        <Text style={{ color: colors.fgDim, lineHeight: 20, marginBottom: spacing.md }}>
          Optional extras for desktop / portable Companion. Pure JS boards —
          no engines, no GPU stacks. Only one game mounts at a time. Chess is
          first-class.
        </Text>
        <View style={styles.grid}>
          {GAME_CATALOG.map((g) => {
            const selected = active === g.id;
            return (
              <PressableCard
                key={g.id}
                selected={selected}
                onPress={() => setActive(g.id)}
                style={styles.card}
              >
                <Text
                  style={{
                    color: selected ? colors.accent : colors.fg,
                    fontWeight: "800",
                    marginBottom: 4,
                  }}
                >
                  {g.label}
                </Text>
                <Text style={{ color: colors.fgDim, fontSize: 12, lineHeight: 16 }}>
                  {g.blurb}
                </Text>
                <Text
                  style={{
                    color: colors.purple,
                    fontSize: 10,
                    marginTop: 6,
                    fontWeight: "700",
                    letterSpacing: 1,
                  }}
                >
                  {g.weight.toUpperCase()}
                </Text>
              </PressableCard>
            );
          })}
        </View>
      </GlassPanel>

      {def && active ? (
        <GlassPanel title={def.label} accent="purple">
          <View style={styles.playHead}>
            <Text style={{ color: colors.fgDim, flex: 1, fontSize: 12 }}>
              {def.credit}
            </Text>
            <Pressable
              onPress={() => Linking.openURL(def.creditUrl)}
              style={[styles.linkBtn, { borderColor: colors.border }]}
            >
              <Text style={{ color: colors.accent, fontSize: 12 }}>Credit</Text>
            </Pressable>
            <Pressable
              onPress={() => setActive(null)}
              style={[styles.linkBtn, { borderColor: colors.border }]}
            >
              <Text style={{ color: colors.fgDim, fontSize: 12 }}>Unload</Text>
            </Pressable>
          </View>
          <View style={styles.stage}>
            {active === "chess" ? <ChessGame /> : null}
            {active === "snake" ? <SnakeGame /> : null}
            {active === "pong" ? <PongGame /> : null}
            {active === "breakout" ? <BreakoutGame /> : null}
            {active === "tetris" ? <TetrisGame /> : null}
            {active === "g2048" ? <Game2048 /> : null}
          </View>
        </GlassPanel>
      ) : (
        <GlassPanel title="Idle">
          <Text style={{ color: colors.fgDim }}>
            Pick a game above. Unload frees the board from memory.
          </Text>
        </GlassPanel>
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  card: {
    minWidth: 140,
    flexGrow: 1,
    flexBasis: "30%",
    maxWidth: 220,
  },
  playHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: "wrap",
  },
  linkBtn: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stage: {
    alignItems: "center",
    minHeight: 200,
  },
});
