module.exports = {
      content: ['./index.html', './app.js', './floral.js', './music.js', './motion.js'],
      theme: {
        extend: {
          colors: {
            parchment: '#FAF6EE',
            envelope: '#F4EFE6',
            ink: '#2B2625',
            mutedInk: '#68615E',
            faintInk: '#8E8682',
            powder: {
              50: '#F0F6F9',
              100: '#E2ECF2',
              200: '#C7DAE6',
              400: '#8FAFC3',
              500: '#5A8BAE',
              600: '#3B7097',
              700: '#2A5574'
            },
            blush: {
              50: '#FAF0F2',
              100: '#F6E5E8',
              200: '#E8C7CD',
              400: '#D49FA9',
              600: '#9E5B68'
            }
          },
          fontFamily: {
            serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
            sans: ['"Montserrat"', 'sans-serif'],
            script: ['"Alex Brush"', 'cursive'],
          },
          letterSpacing: {
            'widest-xl': '0.3em',
            'widest-2xl': '0.45em'
          }
        }
      }
    };
