import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
    darkMode: false,
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			// subtle thin glow for cards/buttons
  			glow: "0 1px 2px rgba(2, 6, 23, 0.04), 0 2px 8px rgba(2, 132, 199, 0.06)",
  			"glow-lg": "0 2px 4px rgba(2, 6, 23, 0.06), 0 8px 24px rgba(59, 130, 246, 0.18)",
  		},
  		dropShadow: {
  			// gradient-ish hover halo (bluish)
  			glow: "0 6px 12px rgba(59,130,246,0.25)",
  			"glow-pink": "0 6px 12px rgba(236,72,153,0.25)",
  		},
  		backgroundImage: {
  			// AWS-style top-to-bottom blue gradient overlay
  			"aws-header": "linear-gradient(to bottom, rgba(239,246,255,0.95), rgba(219,234,254,0.75), rgba(191,219,254,0.55))",
  			"pink-blue": "linear-gradient(135deg, rgba(236,72,153,0.25), rgba(59,130,246,0.25))",
  			"primary-gradient": "linear-gradient(135deg, #2B3A67, #3A53A5)",
  		},
  		keyframes: {
  			float: {
  				'0%, 100%': { transform: 'translateY(0)' },
  				'50%': { transform: 'translateY(-4px)' },
  			},
  			tap: {
  				'0%': { transform: 'scale(1)' },
  				'50%': { transform: 'scale(0.98)' },
  				'100%': { transform: 'scale(1)' },
  			},
  		},
  		animation: {
  			float: 'float 6s ease-in-out infinite',
  			tap: 'tap 180ms ease-out',
  		},
  	}
  },
  plugins: [animate],
};
export default config;
