import { ReactNode } from "react";
import { type ViewStyle } from "react-native";
import { GlassPanel } from "./GlassPanel";

/** Alias — glass-aware panel used across screens */
export function GlowPanel({
  title,
  children,
  accent = "green",
  style,
}: {
  title?: string;
  children: ReactNode;
  accent?: "green" | "purple";
  style?: ViewStyle;
}) {
  return (
    <GlassPanel title={title} accent={accent} style={style}>
      {children}
    </GlassPanel>
  );
}
