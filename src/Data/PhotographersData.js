// src/Data/PhotographersData.js

import gridPreviewPhoto from '../assets/Photos/DirectorPhoto.png';
import DirectorPhoto from '../assets/Photos/Director.jpg';

export const photographersData = [
  {
    id: 1,
    name: 'Shelby Duncan',
    slug: 'shelby-duncan',
    category: 'Editorial, Youth Campaigns',
    // Головне фото для сторінки-списку
    coverImage: gridPreviewPhoto,
    // Фото самого фотографа для його сторінки
    profilePhoto: DirectorPhoto,
    bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    // Галерея робіт для детальної сторінки
    photos: [
      { id: 'p1', title: 'Vogue Editorial', src: gridPreviewPhoto },
      { id: 'p2', title: 'Street Style', src: gridPreviewPhoto },
      { id: 'p3', title: 'Campaign', src: gridPreviewPhoto },
    ],
  },
  {
    id: 2,
    name: 'Lorenzo Agius',
    slug: 'lorenzo-agius',
    category: 'Celebrity, Portraiture',
    coverImage: gridPreviewPhoto,
    profilePhoto: 'https://source.unsplash.com/random/800x800?photographer,man',
    bio: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    photos: [
      { id: 'p4', title: 'Actor Headshot', src: gridPreviewPhoto },
      { id: 'p5', title: 'Musician Cover', src: gridPreviewPhoto },
    ],
  },
  // Додайте більше фотографів сюди
];