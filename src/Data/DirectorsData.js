// src/Data/DirectorsData.js

// Тепер цей файл містить шляхи до GCS, а не локальні файли
const placeholderPhoto = '/images/director_placeholder.jpg';

// Важливо: тут вказані шляхи до файлів *всередині* вашого GCS бакета.
export const directorsData = [
  {
    id: 1,
    name: 'SUPERNOVA',
    slug: 'supernova',
    photoSrc: placeholderPhoto,
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [
      { title: 'L\'Oréal - Dream or Reality', src: "front-end/01-Directors/01-SUPERNOVA/01. L'Oréal - Dream or Reality.mp4" },
    ],
  },
  {
    id: 2,
    name: 'CHRISTOPHER SIMS',
    slug: 'christopher-sims',
    photoSrc: placeholderPhoto,
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [
      { title: 'Nike - Hyperboot Launch', src: "front-end/01-Directors/02-CHRISTOPHER SIMS/1-nike_-_hyperboot_launch (1440p).mp4" },
    ],
  },
  {
    id: 3,
    name: 'ANTONY HOFFMAN',
    slug: 'antony-hoffman',
    photoSrc: placeholderPhoto,
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [{ title: 'UAE - Guardians of a Nation', src: "front-end/01-Directors/03-ANTONY HOFFMAN/1-UAE - GAURDIANS OF A NATION.mov" }],
  },
  {
    id: 4,
    name: 'MATTIA BENETTI',
    slug: 'mattia-benetti',
    photoSrc: placeholderPhoto,
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [
      { title: 'Zegna', src: "front-end/01-Directors/04-MATTIA BENETTI/1-zegnaaaaaa.mp4" },
    ],
  },
  {
    id: 5,
    name: 'ELI SVERDLOV',
    slug: 'eli-sverdlov',
    photoSrc: placeholderPhoto,
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [{ title: 'Skyworth - See The Wonder', src: "front-end/01-Directors/05-ELI SVERDLOV/1-Skyworth - W81 Pro - See The Wonder.mp4" }],
  },
  {
    id: 6,
    name: 'JESSY TERRERO',
    slug: 'jessy-terrero',
    photoSrc: placeholderPhoto,
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [
      { title: 'Smirnoff Karol G', src: "front-end/01-Directors/06-jessy terrero/1 - Smirnoff Karol G - Poco Pico.mp4" },
    ],
  },
  {
    id: 7,
    name: 'VIVIENNE AND TAMAS',
    slug: 'vivienne-and-tamas',
    photoSrc: placeholderPhoto,
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [{ title: 'Kerastase - Emily Ratajkowski', src: "front-end/01-Directors/07-VIVIENNE AND TAMAS/01. Kerastase - Chroma- Emily Ratajkowski.mp4" }],
  },
  {
    id: 8,
    name: 'LORENZO CISI',
    slug: 'lorenzo-cisi',
    photoSrc: placeholderPhoto,
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [
      { title: 'Q225 Summer', src: "front-end/01-Directors/08-LORENZO CISI/1 - Q225_SUMMER_LONGFORM_60s_16x9_v13b_ONLINE.mp4" },
    ],
  },
  {
    id: 9,
    name: 'REMY CAYUELA',
    slug: 'remy-cayuela',
    photoSrc: placeholderPhoto,
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [{ title: 'McDonalds - Raise Your Eyebrows', src: "front-end/01-Directors/09-REMY CAYUELA/1 - Mcdonalds - Raise Your Eyebrows.mp4" }],
  },
  {
    id: 10,
    name: 'BEEDY',
    slug: 'beedy',
    photoSrc: placeholderPhoto,
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [
      { title: 'SA 2025 Launch', src: "front-end/01-Directors/10-Beedy/The-Dunkalatte----She-Loves-That-Coffee-Milk----ft-Kristen-Wiig.mp4" },
      { title: 'DunKings', src: "front-end/01-Directors/10-Beedy/The-Dunkalatte----She-Loves-That-Coffee-Milk----ft-Kristen-Wiig.mp4" } // Додав друге відео, хоча воно поки не використовується на цій сторінці
    ],
  },
  {
    id: 11,
    name: 'VICTOR HEINZ',
    slug: 'victor-heinz',
    photoSrc: placeholderPhoto,
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [{ title: 'Karl Kani - Pattern of the Street', src: "front-end/01-Directors/11-VICTOR HEINZ/1 - viktor_heinz__karl_kani__pattern_of_the_street_-_director (1080p).mp4" }],
  },
  {
    id: 12,
    name: 'JEAN CLAUDE THIBAUT',
    slug: 'jean-claude-thibaut',
    photoSrc: placeholderPhoto,
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [{ title: 'Kilian - Old Fashioned', src: "front-end/01-Directors/12-JEAN CLAUDE THIBAUT/1 - Kilian - Old Fashioned.mp4" }],
  },
];