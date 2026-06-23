/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        clay: {
          50: '#FBF5F0',
          100: '#F5E8DC',
          200: '#E9CDB3',
          300: '#DCAE85',
          400: '#CC8C5C',
          500: '#B86F42',
          600: '#995735',
          700: '#7A452C',
          800: '#5C3422',
          900: '#3D2317',
        },
        sage: {
          50: '#F2F5EE',
          100: '#E2E9D8',
          200: '#C7D5B3',
          300: '#A8BE8A',
          400: '#8AA869',
          500: '#6F8F4F',
          600: '#58723E',
          700: '#445830',
          800: '#303F22',
          900: '#202B17',
        },
        ink: {
          50: '#F7F6F4',
          100: '#EAE7E2',
          800: '#3A3530',
          900: '#241F1A',
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      borderRadius: {
        'xl2': '1.25rem',
      }
    },
  },
  plugins: [],
}
