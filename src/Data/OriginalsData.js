// src/Data/OriginalsData.js

import gridPreviewPhoto from '../assets/Photos/DirectorPhoto.png';

export const originalsData = [
  {
    id: 1,
    slug: 'chanel-rouge-allure',
    title: 'CHANEL | ROUGE ALLURE VELVET NUIT BLANCHE',
    videoSrc: '/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4',
    featuring: 'MARGOT ROBBIE',
    director: 'KARIM SADLI',
    executiveProducers: 'HEATHER HELLER',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    relatedProjects: [
      {
        slug: 'tiffany-believe-in-dreams',
        title: 'TIFFANY & CO',
        subtitle: 'BELIEVE IN DREAMS',
        preview: gridPreviewPhoto,
      },
      {
        slug: 'dior-joy',
        title: 'DIOR',
        subtitle: 'JOY',
        preview: gridPreviewPhoto,
      },
      {
        slug: 'tiffany-believe-in-dreams-2', // Should be unique slug
        title: 'TIFFANY & CO',
        subtitle: 'BELIEVE IN DREAMS',
        preview: gridPreviewPhoto,
      },
      {
        slug: 'dior-joy-2', // Should be unique slug
        title: 'DIOR',
        subtitle: 'JOY',
        preview: gridPreviewPhoto,
      },
    ],
  },
  {
    id: 2,
    slug: 'dior-joy',
    title: 'DIOR | JOY',
    videoSrc: '/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4',
    featuring: 'JENNIFER LAWRENCE',
    director: 'FRANCIS LAWRENCE',
    executiveProducers: 'JANE DOE',
    description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    relatedProjects: [
        // ... add related projects for Dior here if needed
    ],
  },
  // Add other projects here
];