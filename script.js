tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Tajawal', 'sans-serif'],
            },
            colors: {
                brand: {
                    red: '#e63946',
                    orange: '#f4a261',
                    gradientStart: '#ff4b4b',
                    gradientEnd: '#ff8f3d'
                }
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #ff4b4b 0%, #ff8f3d 100%)',
                'soft-warm': 'linear-gradient(135deg, #fdfbf7 0%, #fff0e6 50%, #ffe6e6 100%)',
                'dotted-pattern': 'radial-gradient(rgba(0, 0, 0, 0.05) 1px, transparent 1px)'
            }
        }
    }
};