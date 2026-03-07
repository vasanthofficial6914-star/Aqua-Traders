/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                ocean: {
                    900: '#020617',
                    800: '#0c4a6e',
                    700: '#022c43',
                },
                sea: {
                    500: '#0284c7',
                },
                aqua: {
                    400: '#22d3ee',
                },
                neon: {
                    400: '#00f5ff',
                }
            },
            fontFamily: {
                sans: ['Poppins', 'Inter', 'sans-serif'],
            },
            animation: {
                'glow-pulse': 'glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
            },
            keyframes: {
                glow: {
                    '0%, 100%': { boxShadow: '0 0 10px #00f5ff55' },
                    '50%': { boxShadow: '0 0 20px #00f5ffaa' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
