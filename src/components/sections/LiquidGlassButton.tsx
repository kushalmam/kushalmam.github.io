import { AnchorHTMLAttributes, ReactNode } from "react";
import LiquidGlass from "@nkzw/liquid-glass";
import { cn } from "@/lib/utils";

type LiquidGlassButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: "primary" | "ghost";
};

const buttonPresets = {
  ghost: {
    displacementScale: 18,
    saturation: 124,
  },
  primary: {
    displacementScale: 14,
    saturation: 116,
  },
};

function LiquidGlassButton({
  children,
  className,
  variant = "ghost",
  ...props
}: LiquidGlassButtonProps) {
  const preset = buttonPresets[variant];

  return (
    <span className={cn("nkzw-liquid-button-shell", `nkzw-liquid-button-${variant}`)}>
      <span className="nkzw-liquid-button-backdrop" aria-hidden="true">
        <LiquidGlass
          aberrationIntensity={0.15}
          blurAmount={0.025}
          borderRadius={999}
          className="nkzw-liquid-button-fill"
          displacementScale={preset.displacementScale}
          elasticity={0}
          mode="standard"
          padding="0"
          saturation={preset.saturation}
          style={{
            inset: 0,
            pointerEvents: "none",
            position: "absolute",
          }}
        >
          <span className="nkzw-liquid-measure" />
        </LiquidGlass>
      </span>
      <a
        className={cn(
          variant === "primary" ? "btn-primary" : "btn-ghost",
          "nkzw-liquid-button-link",
          className,
        )}
        {...props}
      >
        {children}
      </a>
    </span>
  );
}

export default LiquidGlassButton;
