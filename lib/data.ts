import { SA_PROVINCES } from './locations';
import { CATEGORIES as ALL_CATS } from './categories';

export const PROVINCES = SA_PROVINCES;
export const CATEGORIES = ALL_CATS;

export const MOCK_USERS = [
  {
    id: 'u1',
    email: 'nicholauscostochetty@gmail.com',
    role: 'ADMIN',
    plan: 'PREMIUM',
    joined: '2026-01-01',
    lastLoginIP: '102.132.89.44',
    device: 'MacBook Pro / Chrome',
    location: 'Durban, KZN'
  },
  {
    id: 'u2',
    email: 'john.smith@example.co.za',
    role: 'USER',
    plan: 'FREE',
    joined: '2026-05-12',
    lastLoginIP: '41.13.120.11',
    device: 'iPhone 14 / Safari',
    location: 'Umkomaas, KZN'
  },
  {
    id: 'u3',
    email: 'sarah.jones@example.co.za',
    role: 'USER',
    plan: 'PREMIUM',
    joined: '2026-06-01',
    lastLoginIP: '197.80.12.99',
    device: 'Windows 11 / Edge',
    location: 'Sandton, Gauteng'
  }
];

export const MOCK_ADS = [
  {
    id: 'ad1',
    userId: 'u2',
    title: 'Professional Plumbing Services Umkomaas',
    category: 'Plumbers',
    location: 'umkomaas',
    description: '24/7 plumbing services in Umkomaas area. Quality guaranteed.',
    verified: false,
    isPremium: false,
    isSponsor: false,
    image: null
  },
  {
    id: 'ad2',
    userId: 'u3',
    title: "Sarah's Digital Marketing Agency",
    category: 'Digital Marketing',
    location: 'sandton',
    description: 'Grow your business with specialized digital marketing. Over 10 years experience.',
    verified: true,
    isPremium: true,
    isSponsor: true,
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'ad3',
    userId: 'u1',
    title: "Eco Auto Solutions - Car Wash & Valet",
    category: 'Cleaning Services',
    location: 'durban',
    description: 'Mobile eco-friendly car wash. We come to you anywhere in Durban.',
    verified: true,
    isPremium: true,
    isSponsor: false,
    image: 'https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&auto=format&fit=crop&q=60'
  },
  {
    id: 'ad4',
    userId: 'u3',
    title: "Sandton Legal Consultants",
    category: 'Attorneys & Lawyers',
    location: 'sandton',
    description: 'Expert corporate legal advice and consultation.',
    verified: true,
    isPremium: true,
    isSponsor: false,
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=60'
  }
];
