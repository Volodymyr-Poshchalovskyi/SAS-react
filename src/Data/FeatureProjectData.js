// src/Data/FeatureProjectData.js

export const featureProjectData = {
  // --- 1. Дані для сторінки /feature (відео-прев'ю) ---
  previewVideo: {
    src: 'front-end/05-Feature film packaging/01-lana del rey - ride/TRANSCODED/Ride -Preview/master.m3u8',
    preview_src:
      'front-end/05-Feature film packaging/01-lana del rey - ride/VIDEO_PREVIEW/Ride -Preview/Ride -Preview.jpg',
  },

  // --- 2. Дані для сторінки проекту (/projects/lana-del-rey-ride) ---
  id: 99, // Унікальний ID
  projectSlug: 'lana-del-rey-ride', // Унікальний слаг для URL
  title: 'RIDE',
  client: 'LANA DEL REY',
  featuring: 'LANA DEL REY',
  director: 'ANTHONY MANDLER',
  executiveProducers: 'HEATHER HELLER',
  description:
    'A striking visual narrative exploring themes of freedom, identity, and rebellion, set to the evocative music of Lana Del Rey. "Ride" is a cinematic journey that blurs the line between a music video and a short film, capturing the essence of a nomadic spirit.',

  // Повне відео для сторінки проекту
  src: 'front-end/05-Feature film packaging/01-lana del rey - ride/TRANSCODED/Ride/master.m3u8',
  preview_src:
    'front-end/05-Feature film packaging/01-lana del rey - ride/VIDEO_PREVIEW/Ride/Ride.jpg',
  startTime: 0, // Починаємо з 0
};