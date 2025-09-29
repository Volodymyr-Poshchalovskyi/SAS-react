// src/Data/AssignmentData.js

// Тепер цей файл містить шляхи до GCS, а не локальні файли
const placeholderPhoto = '/images/director_placeholder.jpg';

// Важливо: тут вказані шляхи до файлів *всередині* вашого GCS бакета.
export const assignmentData = [
  {
    id: 1,
    name: 'Francis Lawrence',
    slug: 'francis-lawrence',
    photoSrc: "back-end/artists/1-Francis-Lawrence.png.webp",
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [
      { title: 'L\'Oréal - Dream or Reality', src: "front-end/03-On Assigment/01-Francis Lawrence/01-The Hunger Games The Ballad of Songbirds & Snakes  - Official Trailer.mp4" },
      { title: 'L\'Oréal - Dream or Reality', src: "front-end/03-On Assigment/01-Francis Lawrence/02-Dior - Joy Feat. Jennifer Lawrence.mp4" },
        { title: 'L\'Oréal - Dream or Reality', src: "front-end/03-On Assigment/01-Francis Lawrence/03-I Am Legend - Official Trailer.mp4" },
        { title: 'L\'Oréal - Dream or Reality', src: "front-end/03-On Assigment/01-Francis Lawrence/04-Tiffany's - Believe In Dreams ft. Elle Fanning.mp4" },

    ],
  },
  {
    id: 2,
    name: 'Gene Stupnitsky',
    slug: 'gene-stupnitsky',
    photoSrc: "back-end/artists/2-Gene Stupinsly.jpg",
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [
      { title: 'L\'Oréal - Dream or Reality', src: "front-end/03-On Assigment/02-Gene Stupnitsky/1-No Hard Feelings - Trailer.mp4" },
      { title: 'L\'Oréal - Dream or Reality', src: "front-end/03-On Assigment/02-Gene Stupnitsky/2-Good Boys - Red Band Trailer.mp4" },
      { title: 'L\'Oréal - Dream or Reality', src: "front-end/03-On Assigment/02-Gene Stupnitsky/3-Bad Teacher - Trailer.mp4" },

    ],
  },
  {
    id: 3,
    name: 'Lisa joy',
    slug: 'lisa-joy',
    photoSrc: "back-end/artists/3-Lisa Joy.jpg",
    bio: 'Lorem ipsum dolor sit amet...',
        videos: [
          { title: 'UAE - Guardians of a Nation', src: "front-end/03-On Assigment/03-Lisa joy/1-Fallout - Official Trailer.mp4" },
          { title: 'UAE - Guardians of a Nation', src: "front-end/03-On Assigment/03-Lisa joy/2-Reminiscence - Official Trailer.mp4" },
          { title: 'UAE - Guardians of a Nation', src: "front-end/03-On Assigment/03-Lisa joy/3-Westworld Official Trailer.mp4" },

        ]
  },
  {
    id: 4,
    name: 'steve pink',
    slug: 'steve-pink',
    photoSrc: "back-end/artists/4-Steve Pink.jpg",
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [
      { title: 'Zegna', src: "front-end/03-On Assigment/04-steve pink/01-Cobra Kai  - Trim + Color.mp4" },
      { title: 'Zegna', src: "front-end/03-On Assigment/04-steve pink/02-New Girl - Schmidt Meet the Neighbours.mp4" },
      { title: 'Zegna', src: "front-end/03-On Assigment/04-steve pink/03-Santa Clarita Diet.mp4" },
      { title: 'Zegna', src: "front-end/03-On Assigment/04-steve pink/04-T-Mobile - Team Anthony Anderson vs Team Mama (Superbowl Commercial.mp4" },
      

    ],
  },
  {
    id: 5,
    name: 'ARIELL VROMMAN',
    slug: 'ariell-vromman',
    photoSrc: "back-end/artists/5-Ariel Vromen.jpg",
    bio: 'Lorem ipsum dolor sit amet...',
    videos: [
      { title: 'Skyworth - See The Wonder', src: "front-end/03-On Assigment/05-ARIELL VROMMAN/The Iceman - Official Trailer.mp4" },
      
    ],
  }
];