import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const colors = {
    border: 'var(--color-border)',
    input: 'var(--color-input)',
    ring: 'var(--color-ring)',
    background: 'var(--color-background)',
    foreground: 'var(--color-foreground)',
    primary: {
        DEFAULT: 'var(--color-primary)',
        foreground: 'var(--color-primary-foreground)',
    },
    secondary: {
        DEFAULT: 'var(--color-secondary)',
        foreground: 'var(--color-secondary-foreground)',
    },
    destructive: {
        DEFAULT: 'var(--color-destructive)',
        foreground: 'var(--color-destructive-foreground)',
    },
    muted: {
        DEFAULT: 'var(--color-muted)',
        foreground: 'var(--color-muted-foreground)',
    },
    accent: {
        DEFAULT: 'var(--color-accent)',
        foreground: 'var(--color-accent-foreground)',
    },
    popover: {
        DEFAULT: 'var(--color-popover)',
        foreground: 'var(--color-popover-foreground)',
    },
    card: {
        DEFAULT: 'var(--color-card)',
        foreground: 'var(--color-card-foreground)',
    },
    sidebar: {
        DEFAULT: 'var(--color-sidebar)',
        foreground: 'var(--color-sidebar-foreground)',
        primary: {
            DEFAULT: 'var(--color-sidebar-primary)',
            foreground: 'var(--color-sidebar-primary-foreground)',
        },
        accent: {
            DEFAULT: 'var(--color-sidebar-accent)',
            foreground: 'var(--color-sidebar-accent-foreground)',
        },
        border: 'var(--color-sidebar-border)',
        ring: 'var(--color-sidebar-ring)',
    },
    chart: {
        1: 'var(--color-chart-1)',
        2: 'var(--color-chart-2)',
        3: 'var(--color-chart-3)',
        4: 'var(--color-chart-4)',
        5: 'var(--color-chart-5)',
    },
};

export default {
    darkMode: 'class',
    content: [
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
        './resources/js/**/*.ts',
    ],
    theme: {
        extend: {
            colors,
            fontFamily: {
                sans: [
                    '"Instrument Sans"',
                    'ui-sans-serif',
                    'system-ui',
                    'sans-serif',
                    'Apple Color Emoji',
                    'Segoe UI Emoji',
                    'Segoe UI Symbol',
                    'Noto Color Emoji',
                ],
            },
            borderRadius: {
                lg: 'var(--radius-lg)',
                md: 'var(--radius-md)',
                sm: 'var(--radius-sm)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
            },
        },
    },
    plugins: [animate],
} satisfies Config;
