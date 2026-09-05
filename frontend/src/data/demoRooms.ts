import type { Enquiry, Review, Room, User } from '../types';

/* ================================================================
   DEMO OWNERS
================================================================ */

const ownerA = {
  _id: 'owner-demo-1',
  name: 'Aarav Properties',
  phone: '+91 98765 43210',
  phoneVerified: true,
  propertyVerified: true,
  joinedAt: '2024-02-12',
};

const ownerB = {
  _id: 'owner-demo-2',
  name: 'Naina Rentals',
  phone: '+91 98765 00192',
  phoneVerified: true,
  propertyVerified: true,
  joinedAt: '2024-08-18',
};

const ownerC = {
  _id: 'owner-demo-3',
  name: 'Sharma Property Services',
  phone: '+91 98111 22334',
  phoneVerified: true,
  propertyVerified: false,
  joinedAt: '2025-01-10',
};

/* ================================================================
   DEMO ROOMS & FLATS
================================================================ */

export const demoRooms: Room[] = [
  {
    _id: 'room-demo-1',
    title: 'Bright Furnished Room near BBDITM',

    description:
      'A clean and peaceful independent room near BBDITM, suitable for students and working professionals. Easy access to shops, transport and daily essentials.',

    propertyType: 'room',
    roomType: 'single',

    monthlyRent: 6800,
    securityDeposit: 6800,

    address: 'Sector 3, Faizabad Road, Lucknow',
    city: 'Lucknow',
    area: 'Faizabad Road',
    landmark: 'Near BBDITM Gate 2',

    location: {
      type: 'Point',
      coordinates: [81.0258, 26.8494],
    },

    distance: 0.8,

    facilities: [
      'Wi-Fi',
      'AC',
      'Attached bathroom',
      'CCTV',
      'Washing machine',
      'Power backup',
    ],

    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1100&q=80',
    ],

    availabilityStatus: 'available',
    availableFrom: '2026-09-01',

    verificationStatus: 'verified',

    averageRating: 4.8,
    reviewCount: 36,

    genderPreference: 'any',

    furnishingStatus: 'furnished',

    occupancy: '1 person',

    owner: ownerA,

    createdAt: '2026-08-24T10:00:00.000Z',

    aiMatch: 94,

    minimumStayDays: 30,
  },

  {
    _id: 'room-demo-2',

    title: 'Fully Furnished Room in Gomti Nagar',

    description:
      'Fully furnished private room in a residential area of Gomti Nagar. Suitable for students, employees and people working nearby.',

    propertyType: 'room',
    roomType: 'single',

    monthlyRent: 7500,
    securityDeposit: 7500,

    address: 'Vibhuti Khand, Gomti Nagar, Lucknow',
    city: 'Lucknow',
    area: 'Gomti Nagar',
    landmark: 'Near Cyber Heights',

    location: {
      type: 'Point',
      coordinates: [81.0037, 26.8612],
    },

    distance: 1.6,

    facilities: [
      'Wi-Fi',
      'AC',
      'Attached bathroom',
      'CCTV',
      'Lift',
      'Washing machine',
    ],

    images: [
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=80',
    ],

    availabilityStatus: 'available',
    availableFrom: '2026-09-05',

    verificationStatus: 'verified',

    averageRating: 4.7,
    reviewCount: 24,

    genderPreference: 'any',

    furnishingStatus: 'furnished',

    occupancy: '1 person',

    owner: ownerB,

    createdAt: '2026-08-20T10:00:00.000Z',

    aiMatch: 91,

    minimumStayDays: 30,
  },

  {
    _id: 'room-demo-3',

    title: 'Independent Studio Room for Working Professionals',

    description:
      'A clean independent studio with a private kitchenette and balcony. Suitable for working professionals or anyone looking for privacy.',

    propertyType: 'room',
    roomType: 'other',

    monthlyRent: 12000,
    securityDeposit: 18000,

    address: 'Sushant Golf City, Lucknow',
    city: 'Lucknow',
    area: 'Sushant Golf City',
    landmark: 'Near Ekana Stadium',

    location: {
      type: 'Point',
      coordinates: [80.9805, 26.7933],
    },

    distance: 3.2,

    facilities: [
      'Wi-Fi',
      'AC',
      'Private kitchen',
      'Balcony',
      'Parking',
      'Power backup',
    ],

    images: [
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1100&q=80',
    ],

    availabilityStatus: 'limited',
    availableFrom: '2026-09-12',

    verificationStatus: 'verified',

    averageRating: 4.5,
    reviewCount: 12,

    genderPreference: 'any',

    furnishingStatus: 'semi-furnished',

    occupancy: '1 person',

    owner: ownerA,

    createdAt: '2026-08-14T10:00:00.000Z',

    aiMatch: 82,

    minimumStayDays: 30,
  },

  {
    _id: 'room-demo-4',

    title: 'Affordable Single Room near Charbagh',

    description:
      'Affordable independent room with good transport connectivity. Suitable for students, workers and job-going people who need a convenient location.',

    propertyType: 'room',
    roomType: 'single',

    monthlyRent: 5200,
    securityDeposit: 5000,

    address: 'Naka Hindola, Lucknow',
    city: 'Lucknow',
    area: 'Charbagh',
    landmark: '700m from Charbagh Railway Station',

    location: {
      type: 'Point',
      coordinates: [80.9214, 26.8317],
    },

    distance: 0.7,

    facilities: [
      'Wi-Fi',
      'CCTV',
      'Water supply',
      'Security',
      'Attached bathroom',
    ],

    images: [
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1100&q=80',
    ],

    availabilityStatus: 'available',
    availableFrom: '2026-09-01',

    verificationStatus: 'verified',

    averageRating: 4.3,
    reviewCount: 18,

    genderPreference: 'any',

    furnishingStatus: 'furnished',

    occupancy: '1 person',

    owner: ownerB,

    createdAt: '2026-08-08T10:00:00.000Z',

    aiMatch: 79,

    minimumStayDays: 30,
  },

  {
    _id: 'room-demo-5',

    title: 'Spacious 1 BHK Flat near Hazratganj',

    description:
      'Comfortable 1 BHK flat suitable for a small family, couple or working professional. Includes an independent kitchen and balcony.',

    propertyType: 'flat',
    roomType: '1bhk',

    monthlyRent: 16500,
    securityDeposit: 16500,

    address: 'Butler Colony, Hazratganj, Lucknow',
    city: 'Lucknow',
    area: 'Hazratganj',
    landmark: 'Near Janpath Market',

    location: {
      type: 'Point',
      coordinates: [80.9494, 26.8507],
    },

    distance: 1.1,

    facilities: [
      'Private kitchen',
      'Balcony',
      'Parking',
      'Water supply',
      'Power backup',
    ],

    images: [
      'https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1100&q=80',
    ],

    availabilityStatus: 'unavailable',
    availableFrom: '2026-10-01',

    verificationStatus: 'verified',

    averageRating: 4.9,
    reviewCount: 9,

    genderPreference: 'any',

    furnishingStatus: 'semi-furnished',

    occupancy: '2-3 people',

    owner: ownerA,

    createdAt: '2026-07-30T10:00:00.000Z',

    aiMatch: 74,

    minimumStayDays: 30,
  },

  {
    _id: 'room-demo-6',

    title: 'Affordable Shared Room in Indira Nagar',

    description:
      'Affordable shared room in a residential flat. A practical option for students, workers and job-going people looking for a lower monthly rent.',

    propertyType: 'room',
    roomType: 'double',

    monthlyRent: 6100,
    securityDeposit: 6100,

    address: 'B-Block, Indira Nagar, Lucknow',
    city: 'Lucknow',
    area: 'Indira Nagar',
    landmark: 'Near Bhootnath Market',

    location: {
      type: 'Point',
      coordinates: [80.9995, 26.8798],
    },

    distance: 2.4,

    facilities: [
      'Wi-Fi',
      'Kitchen',
      'Washing machine',
      'Water supply',
      'Parking',
    ],

    images: [
      'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1100&q=80',
    ],

    availabilityStatus: 'available',
    availableFrom: '2026-09-03',

    verificationStatus: 'verified',

    averageRating: 4.4,
    reviewCount: 16,

    genderPreference: 'any',

    furnishingStatus: 'furnished',

    occupancy: '2 people',

    owner: ownerB,

    createdAt: '2026-08-26T10:00:00.000Z',

    aiMatch: 88,

    minimumStayDays: 30,
  },

  {
    _id: 'room-demo-7',

    title: 'Family Friendly 2 BHK Flat in Aliganj',

    description:
      'Spacious 2 BHK residential flat in a peaceful locality. Suitable for families and working professionals looking for a long-term rental home.',

    propertyType: 'flat',
    roomType: '2bhk',

    monthlyRent: 19000,
    securityDeposit: 19000,

    address: 'Sector H, Aliganj, Lucknow',
    city: 'Lucknow',
    area: 'Aliganj',
    landmark: 'Near Kapoorthala',

    location: {
      type: 'Point',
      coordinates: [80.9462, 26.8915],
    },

    distance: 1.8,

    facilities: [
      'Parking',
      'Balcony',
      'Private kitchen',
      'Water supply',
      'Power backup',
      'Security',
    ],

    images: [
      'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1100&q=80',
    ],

    availabilityStatus: 'available',
    availableFrom: '2026-09-15',

    verificationStatus: 'verified',

    averageRating: 4.7,
    reviewCount: 21,

    genderPreference: 'any',

    furnishingStatus: 'unfurnished',

    occupancy: '3-5 people',

    owner: ownerC,

    createdAt: '2026-08-28T10:00:00.000Z',

    aiMatch: 86,

    minimumStayDays: 90,
  },

  {
    _id: 'room-demo-8',

    title: 'Fully Furnished 2 BHK near IT Office Area',

    description:
      'Move-in-ready furnished 2 BHK flat for working professionals, small families or people relocating for a job.',

    propertyType: 'flat',
    roomType: '2bhk',

    monthlyRent: 22000,
    securityDeposit: 22000,

    address: 'Vibhuti Khand, Gomti Nagar, Lucknow',
    city: 'Lucknow',
    area: 'Gomti Nagar',
    landmark: 'Near IT offices',

    location: {
      type: 'Point',
      coordinates: [81.0048, 26.8641],
    },

    distance: 1.2,

    facilities: [
      'Wi-Fi',
      'AC',
      'Furniture',
      'Kitchen',
      'Parking',
      'Lift',
      'Power backup',
    ],

    images: [
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1100&q=80',
    ],

    availabilityStatus: 'available',
    availableFrom: '2026-09-10',

    verificationStatus: 'verified',

    averageRating: 4.8,
    reviewCount: 31,

    genderPreference: 'any',

    furnishingStatus: 'furnished',

    occupancy: '3-4 people',

    owner: ownerA,

    createdAt: '2026-08-29T10:00:00.000Z',

    aiMatch: 92,

    minimumStayDays: 30,
  },
];

/* ================================================================
   DEMO REVIEWS
================================================================ */

export const demoReviews: Review[] = [
  {
    _id: 'review-1',
    rating: 5,
    comment:
      'Exactly as listed. The room was clean and the owner responded quickly.',

    createdAt: '2026-08-22T10:00:00.000Z',

    user: {
      _id: 'review-user-1',
      name: 'Priya S.',
    },
  },

  {
    _id: 'review-2',
    rating: 4,
    comment:
      'Clean room and a very short commute to the college. Good value for the rent.',

    createdAt: '2026-08-12T10:00:00.000Z',

    user: {
      _id: 'review-user-2',
      name: 'Rohan M.',
    },
  },

  {
    _id: 'review-3',
    rating: 5,
    comment:
      'The flat was exactly like the photos. Very useful for our family.',

    createdAt: '2026-08-05T10:00:00.000Z',

    user: {
      _id: 'review-user-3',
      name: 'Amit K.',
    },
  },
];

/* ================================================================
   DEMO ENQUIRIES
================================================================ */

export const demoEnquiries: Enquiry[] = [
  {
    _id: 'enquiry-1',

    room: demoRooms[0],

    message:
      'Hi, is this room still available from September? I would like to visit.',

    status: 'new',

    createdAt: '2026-08-28T08:30:00.000Z',
  },

  {
    _id: 'enquiry-2',

    room: demoRooms[2],

    message:
      'Could I arrange a visit this weekend? I am moving to Lucknow for work.',

    status: 'contacted',

    createdAt: '2026-08-26T12:15:00.000Z',
  },

  {
    _id: 'enquiry-3',

    room: demoRooms[6],

    message:
      'I am looking for a 2 BHK for my family. Can I schedule a property visit?',

    status: 'new',

    createdAt: '2026-08-29T09:15:00.000Z',
  },
];

/* ================================================================
   DEMO USERS
================================================================ */

export const demoUsers: User[] = [
  {
    _id: 'demo-user',

    name: 'Demo Tenant',

    email: 'tenant@demo.local',

    phone: '+91 90000 00001',

    role: 'user',

    phoneVerified: true,

    tenantType: 'student',
  },

  {
    _id: 'demo-owner',

    name: 'Demo Owner',

    email: 'owner@demo.local',

    phone: '+91 90000 00002',

    role: 'owner',

    phoneVerified: true,
  },

  {
    _id: 'demo-admin',

    name: 'Demo Admin',

    email: 'admin@demo.local',

    role: 'admin',

    phoneVerified: true,
  },
];