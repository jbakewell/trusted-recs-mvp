import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: {
          page: "var(--color-bg-page)",
          surface: "var(--color-bg-surface)",
          muted: "var(--color-bg-muted)",
          inset: "var(--color-bg-inset)",
        },
        surface: {
          soft: "var(--surface-translucent-soft)",
          DEFAULT: "var(--surface-translucent)",
          strong: "var(--surface-translucent-strong)",
          header: "var(--surface-header)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
          placeholder: "var(--color-text-placeholder)",
          inverse: "var(--color-text-inverse)",
        },
        border: {
          subtle: "var(--color-border-subtle)",
          strong: "var(--color-border-strong)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          soft: "var(--color-accent-soft)",
          teal: "var(--color-accent-teal)",
          green: "var(--color-accent-green)",
          orange: "var(--color-accent-orange)",
          purple: "var(--color-accent-purple)",
          olive: "var(--color-accent-olive)",
        },
        avatar: {
          rose: "var(--avatar-rose)",
          teal: "var(--avatar-teal)",
          green: "var(--avatar-green)",
          orange: "var(--avatar-orange)",
          purple: "var(--avatar-purple)",
          olive: "var(--avatar-olive)",
          charcoal: "var(--avatar-charcoal)",
          paper: "var(--avatar-paper-muted)",
        },
        chip: {
          rose: "var(--chip-soft-rose)",
          teal: "var(--chip-soft-teal)",
          green: "var(--chip-soft-green)",
          orange: "var(--chip-soft-orange)",
          purple: "var(--chip-soft-purple)",
          olive: "var(--chip-soft-olive)",
        },
        reaction: {
          want: "var(--reaction-want)",
          maybe: "var(--reaction-maybe)",
          seen: "var(--reaction-seen)",
          loved: "var(--reaction-loved)",
          notForMe: "var(--reaction-not-for-me)",
        },
        status: {
          success: "var(--color-success)",
          warning: "var(--color-warning)",
          error: "var(--color-error)",
          info: "var(--color-info)",
        },
        focus: {
          ring: "var(--color-focus-ring)",
        },
      },
      fontFamily: {
        ui: "var(--font-ui)",
        display: "var(--font-display)",
        serifAccent: "var(--font-serif-accent)",
      },
      fontSize: {
        "display-lg": ["var(--font-size-display-lg)", { lineHeight: "var(--line-height-display)" }],
        "display-md": ["var(--font-size-display-md)", { lineHeight: "var(--line-height-display)" }],
        "page-title": ["var(--font-size-page-title)", { lineHeight: "var(--line-height-title)" }],
        "section-title": ["var(--font-size-section-title)", { lineHeight: "var(--line-height-title)" }],
        "card-title": ["var(--font-size-card-title)", { lineHeight: "1.3" }],
        body: ["var(--font-size-body)", { lineHeight: "var(--line-height-body)" }],
        "body-sm": ["var(--font-size-body-sm)", { lineHeight: "1.45" }],
        caption: ["var(--font-size-caption)", { lineHeight: "var(--line-height-caption)" }],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        card: "var(--radius-card)",
        button: "var(--radius-button)",
      },
      boxShadow: {
        subtle: "var(--shadow-subtle)",
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        8: "var(--space-8)",
        10: "var(--space-10)",
        12: "var(--space-12)",
      },
    },
  },
  plugins: [],
};

export default config;
