/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pastel: {
          blue:       '#DDE9F5',   // fondo azul claro (panel izquierdo)
          blueHover:  '#C8DAEE',
          blueBorder: '#A8C4DF',
          cream:      '#FAF4EC',   // fondo crema (panel derecho / contenido)
          creamHover: '#F2E8D8',
          rose:       '#F5D6D6',
          roseText:   '#C0444A',
          mint:       '#D4EDE1',
          mintText:   '#2A7A52',
          amber:      '#FAE9C8',
          amberText:  '#A0620A',
        },
        brand: {
          text:    '#2C3E50',   // texto principal oscuro
          muted:   '#6B7A8D',   // texto secundario
          border:  '#D8E3EC',   // bordes suaves
          white:   '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 2px 12px rgba(0,0,0,0.06)',
        card: '0 4px 20px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}