import { Product, PickupSlot } from '../types'

export const WHATSAPP_NUMBER = '50672257606'
export const SINPE_NUMBER = '7225-7606'

export const LUNCH_SLOTS: PickupSlot[] = [
  ['12:00', '12:00 MD'], ['12:30', '12:30 PM'], ['13:00', '1:00 PM'], ['13:30', '1:30 PM'],
  ['14:00', '2:00 PM'], ['14:30', '2:30 PM'], ['15:00', '3:00 PM'], ['15:30', '3:30 PM'],
].map(([value, label]) => ({ value, label }))

export const EVENING_SLOTS: PickupSlot[] = [
  ['16:00', '4:00 PM'], ['16:30', '4:30 PM'], ['17:00', '5:00 PM'], ['17:30', '5:30 PM'],
  ['18:00', '6:00 PM'], ['18:30', '6:30 PM'], ['19:00', '7:00 PM'], ['19:30', '7:30 PM'],
].map(([value, label]) => ({ value, label }))

export const products: Product[] = [
  {
    id: 'banquete',
    name: 'Banquete Familiar Español',
    description: 'Experiencia gastronómica completa para 4 personas: Paella Mixta, Tortilla Española entera, 4 porciones de Tarta de Queso, Ensalada Mixta y Alioli de cortesía.',
    price: 45000,
    emoji: '👑',
    category: 'paella',
    people: '4 personas',
    image: '/assets/banquete-familiar.png',
    imageAlt: 'Banquete Familiar Español de El Lingote Español'
  },
  {
    id: 'pollo',
    name: 'Paella Tradicional de Pollo',
    description: 'Bocaditos jugosos de pechuga de pollo deshuesada, sofrito artesanal con pimentón dulce, caldo concentrado y tiras de pimiento rojo asado.',
    price: 23000,
    emoji: '🍗',
    category: 'paella',
    people: '4 personas',
    image: '/assets/paella-pollo.png',
    imageAlt: 'Paella tradicional de pollo deshuesado de El Lingote Español'
  },
  {
    id: 'mixta',
    name: 'Paella Mixta Tradicional',
    description: 'Pechuga de pollo deshuesada, fina posta de cerdo, calamar y camarón limpio, cocinados sobre sofrito artesanal y fondo concentrado de mar y montaña.',
    price: 25000,
    emoji: '🥘',
    category: 'paella',
    people: '4 personas',
    image: '/assets/paella-mixta.png',
    imageAlt: 'Paella mixta tradicional de El Lingote Español'
  },
  {
    id: 'camarones',
    name: 'Paella de Camarones',
    description: 'Camarones grandes limpios y jugosos, sofrito artesanal con pimentón dulce, fumet concentrado de mariscos y un toque de alioli de la casa.',
    price: 29000,
    emoji: '🦐',
    category: 'paella',
    people: '4 personas',
    image: '/assets/paella-camarones.png',
    imageAlt: 'Paella de camarones de El Lingote Español'
  },
  {
    id: 'senyoret',
    name: 'Arroz del Senyoret',
    description: 'Camarón pelado, calamar tierno, mejillón sin concha y lonjas de corvina al vapor, preparado con fumet concentrado para disfrutar sin ensuciarse las manos.',
    price: 33000,
    emoji: '🌊',
    category: 'paella',
    people: '4 personas',
    image: '/assets/arroz-senyoret.png',
    imageAlt: 'Arroz del Senyoret de El Lingote Español'
  },
  {
    id: 'tortilla',
    name: 'Tortilla Española · La Clásica',
    description: 'Patata seleccionada, huevo fresco, cebolla pochada a fuego lento y aceite de oliva, con el punto meloso y jugoso tradicional de la casa.',
    price: 8000,
    emoji: '🥔',
    category: 'tortilla',
    people: '4 personas',
    image: '/assets/tortilla.png',
    imageAlt: 'Tortilla española clásica de El Lingote Español'
  },
  {
    id: 'tarta',
    name: 'Tarta cremosa de queso con plátano maduro',
    description: 'Porción individual de tarta cremosa de queso artesanal, horneada a alta temperatura y caramelizada al revés con plátano maduro.',
    price: 3000,
    priceDetail: 'Porción individual',
    emoji: '🍌',
    category: 'postre',
    people: '1 porción',
    image: '/assets/tarta.webp',
    imageAlt: 'Porción individual de tarta cremosa de queso con plátano maduro'
  },
  {
    id: 'ensalada',
    name: 'Ensalada Mixta Familiar',
    description: 'Mezcla fresca de lechuga, tomate, cebolla crujiente y zanahoria rallada, acompañada de nuestro aderezo casero de mostaza y miel.',
    price: 4000,
    emoji: '🥗',
    category: 'extra',
    people: '4 personas',
    image: '/assets/ensalada_mixta.png',
    imageAlt: 'Ensalada mixta familiar de El Lingote Español'
  },
  {
    id: 'alioli',
    name: 'Alioli Artesanal',
    description: 'Salsa cremosa tradicional elaborada al momento con ajo fresco y aceite, ideal para acompañar tu paella o tortilla española.',
    price: 2000,
    emoji: '🧄',
    category: 'extra',
    people: '4 personas',
    image: '/assets/ali-oli.png',
    imageAlt: 'Salsa alioli artesanal de El Lingote Español'
  },
]

export const formatCRC = (value: number) => `₡${value.toLocaleString('es-CR')}`
