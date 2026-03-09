export type Island = 'grande-comore' | 'anjouan' | 'moheli';

export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'sold';

export type BoostType = 'vedette' | 'remontee' | 'urgent' | null;

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'KMF' | 'EUR';
  category: Category;
  island: Island;
  city: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  status: ListingStatus;
  boost: BoostType;
  userId: string;
  userName: string;
  userPhone?: string;
  userAvatarUrl?: string;
  views: number;
  isSold: boolean;
}

export const ISLANDS: { value: Island; label: string; cities: string[] }[] = [
  { 
    value: 'grande-comore', 
    label: 'Grande Comore',
    cities: ['Moroni', 'Mitsamiouli', 'Mbeni', 'Itsandra', 'Iconi', 'Foumbouni', 'Hahaya']
  },
  { 
    value: 'anjouan', 
    label: 'Anjouan',
    cities: ['Mutsamudu', 'Domoni', 'Ouani', 'Sima', 'Moya', 'Bambao']
  },
  { 
    value: 'moheli', 
    label: 'Mohéli',
    cities: ['Fomboni', 'Nioumachoua', 'Wanani', 'Hoani', 'Miringoni']
  },
];

export const CATEGORIES: Category[] = [
  { id: '1', name: 'Véhicules', icon: '🚗', slug: 'vehicules' },
  { id: '2', name: 'Immobilier', icon: '🏠', slug: 'immobilier' },
  { id: '3', name: 'Électronique', icon: '📱', slug: 'electronique' },
  { id: '4', name: 'Mode', icon: '👕', slug: 'mode' },
  { id: '5', name: 'Maison', icon: '🛋️', slug: 'maison' },
  { id: '6', name: 'Services', icon: '🔧', slug: 'services' },
  { id: '7', name: 'Emploi', icon: '💼', slug: 'emploi' },
  { id: '8', name: 'Loisirs', icon: '⚽', slug: 'loisirs' },
];

export const SUBCATEGORIES: Record<string, string[]> = {
  'vehicules': [
    'Voitures',
    'Motos & Scooters',
    'Camions & Utilitaires',
    'Pièces & Accessoires',
    'Bateaux & Nautisme',
    'Vélos',
    'Autres véhicules'
  ],
  'immobilier': [
    'Appartements',
    'Maisons & Villas',
    'Terrains',
    'Locaux commerciaux',
    'Bureaux',
    'Colocations',
    'Location vacances',
    'Location longue durée'
  ],
  'electronique': [
    'Téléphones & Tablettes',
    'Ordinateurs & Portables',
    'TV & Home Cinéma',
    'Consoles & Jeux vidéo',
    'Photo & Vidéo',
    'Audio & Casques',
    'Accessoires électroniques'
  ],
  'mode': [
    'Vêtements homme',
    'Vêtements femme',
    'Vêtements enfant',
    'Chaussures',
    'Sacs & Accessoires',
    'Montres & Bijoux',
    'Beauté & Cosmétiques'
  ],
  'maison': [
    'Meubles',
    'Électroménager',
    'Décoration',
    'Jardin & Extérieur',
    'Bricolage & Outillage',
    'Linge de maison',
    'Cuisine & Arts de la table'
  ],
  'services': [
    'Cours & Formation',
    'Réparation & Dépannage',
    'Travaux & Construction',
    'Transport & Déménagement',
    'Événementiel & Traiteur',
    'Informatique & Web',
    'Autres services'
  ],
  'emploi': [
    'Offres d\'emploi',
    'Recherche d\'emploi',
    'Freelance & Missions',
    'Stages & Alternances',
    'Babysitting & Garde',
    'Aide à domicile'
  ],
  'loisirs': [
    'Sports & Fitness',
    'Instruments de musique',
    'Livres & BD',
    'Jeux & Jouets',
    'Collections & Art',
    'Animaux & Accessoires',
    'Voyages & Billetterie'
  ]
};

export const VEHICLE_BRANDS = [
  'Toyota', 'Nissan', 'Honda', 'Suzuki', 'Hyundai', 'Kia', 'Mitsubishi',
  'Mercedes-Benz', 'BMW', 'Audi', 'Volkswagen', 'Renault', 'Peugeot', 'Citroën',
  'Ford', 'Chevrolet', 'Mazda', 'Isuzu', 'Land Rover', 'Jeep', 'Autre'
];

export const VEHICLE_YEARS = Array.from({ length: 35 }, (_, i) => (new Date().getFullYear() - i).toString());

export const MILEAGE_RANGES = [
  '0 - 10 000 km',
  '10 000 - 50 000 km',
  '50 000 - 100 000 km',
  '100 000 - 150 000 km',
  '150 000 - 200 000 km',
  '+ 200 000 km'
];

export const ROOM_COUNTS = ['1', '2', '3', '4', '5', '6', '7', '8+'];
