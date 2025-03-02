/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Modern Framer-inspired color palette
        'background-dark': '#0F0F12', // Deep space black with slight purple tint
        'background-dark-secondary': '#16161D', // Slightly lighter for layering
        'text-primary': '#FFFFFF',
        'text-secondary': '#E2E2EC', // Soft white with purple tint
        'text-tertiary': '#9D9DAF', // Muted lavender-gray
        'accent-primary': '#7C3AED', // Vibrant purple (primary brand color)
        'accent-secondary': '#3ABFF8', // Bright blue
        'accent-tertiary': '#F471B5', // Pink accent
        'accent-quaternary': '#0AC5B3', // Teal accent
        'accent-amber': '#FBBF24', // Warm amber for contrast
        'ui-dark': '#1E1E2A', // Dark purple-gray for UI elements
        'ui-dark-elevated': '#2A2A3A', // Slightly lighter for layering
        
        // Legacy color mappings for backward compatibility
        'accent-red': '#F471B5', // Map to pink
        'accent-cyan': '#3ABFF8', // Map to blue
        'accent-purple': '#7C3AED', // Map to primary purple
        'accent-blue': '#3ABFF8', // Map to blue
        
        // Light theme colors
        'background-light': '#F8F8FC', // Very light purple tint
        'background-light-secondary': '#FFFFFF',
        'text-dark-primary': '#1A1A27', // Dark purple-black
        'text-dark-secondary': '#4A4A65', // Dark purple-gray
      },
      fontFamily: {
        story: ['Georgia', 'serif'],
        ui: ['Inter', 'system-ui', 'sans-serif'], // Modern UI font
        mono: ['JetBrains Mono', 'monospace'], // Modern code font
      },
      backgroundImage: {
        'gradient-accent': 'linear-gradient(to right, var(--tw-gradient-stops))',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'tech-grid': 'linear-gradient(to right, #2A2A3A 1px, transparent 1px), linear-gradient(to bottom, #2A2A3A 1px, transparent 1px)',
        'noise': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
      },
      gradientColorStops: {
        'accent-start': '#7C3AED', // Purple
        'accent-end': '#3ABFF8', // Blue
        'cyber-start': '#3ABFF8', // Blue
        'cyber-end': '#0AC5B3', // Teal
        'warm-start': '#F471B5', // Pink
        'warm-end': '#FBBF24', // Amber
      },
      boxShadow: {
        'glow': '0 0 20px rgba(124, 58, 237, 0.6)', // Purple glow
        'glow-soft': '0 0 15px rgba(124, 58, 237, 0.3)', // Soft purple glow
        'glow-blue': '0 0 20px rgba(58, 191, 248, 0.6)', // Blue glow
        'glow-pink': '0 0 20px rgba(244, 113, 181, 0.6)', // Pink glow
        'glow-teal': '0 0 20px rgba(10, 197, 179, 0.6)', // Teal glow
        'glow-amber': '0 0 20px rgba(251, 191, 36, 0.6)', // Amber glow
        'inner-glow': 'inset 0 0 10px rgba(124, 58, 237, 0.3)', // Inner purple glow
        'inner-glow-blue': 'inset 0 0 10px rgba(58, 191, 248, 0.3)', // Inner blue glow
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'pulse-fast': 'pulse 1.5s infinite',
        'scale': 'scale 0.2s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 6s linear infinite',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'glitch': 'glitch 3s infinite',
        'border-flow': 'borderFlow 2s linear infinite',
        'text-shimmer': 'textShimmer 2s infinite',
        'ripple': 'ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite',
        'morph': 'morph 8s ease-in-out infinite alternate',
        'grain': 'grain 8s steps(10) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scale: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.98)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        borderFlow: {
          '0%': { backgroundPosition: '0% 0%' },
          '100%': { backgroundPosition: '100% 0%' },
        },
        textShimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
        morph: {
          '0%': { borderRadius: '40% 60% 60% 40% / 60% 30% 70% 40%' },
          '100%': { borderRadius: '40% 60% 30% 70% / 50% 60% 40% 50%' },
        },
        grain: {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '10%': { transform: 'translate(-5%, -10%)' },
          '20%': { transform: 'translate(-15%, 5%)' },
          '30%': { transform: 'translate(7%, -25%)' },
          '40%': { transform: 'translate(-5%, 25%)' },
          '50%': { transform: 'translate(-15%, 10%)' },
          '60%': { transform: 'translate(15%, 0%)' },
          '70%': { transform: 'translate(0%, 15%)' },
          '80%': { transform: 'translate(3%, 35%)' },
          '90%': { transform: 'translate(-10%, 10%)' },
        },
      },
      backgroundSize: {
        'tech-grid': '30px 30px',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
} 