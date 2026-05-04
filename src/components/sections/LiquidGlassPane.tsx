import {
  ComponentPropsWithoutRef,
  ElementType,
  ForwardedRef,
  forwardRef,
} from "react";
import { cn } from "@/lib/utils";

type LiquidGlassPaneProps<T extends ElementType> = {
  as?: T;
  interactive?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

const assignRef = <T,>(ref: ForwardedRef<T>, value: T | null) => {
  if (typeof ref === "function") {
    ref(value);
    return;
  }

  if (ref) {
    ref.current = value;
  }
};

const LiquidGlassPane = forwardRef<HTMLElement, LiquidGlassPaneProps<ElementType>>(
  (
    {
      as,
      className,
      children,
      interactive = false,
      style,
      ...props
    },
    forwardedRef,
  ) => {
    const Component = as || "div";

    return (
      <Component
        ref={(node: HTMLElement | null) => {
          assignRef(forwardedRef, node);
        }}
        className={cn(
          "surface-card",
          interactive && "surface-card-hover",
          className,
        )}
        style={style}
        {...props}
      >
        {children}
      </Component>
    );
  },
);

LiquidGlassPane.displayName = "LiquidGlassPane";

export default LiquidGlassPane;
