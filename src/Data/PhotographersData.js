// src/Data/PhotographersData.js

import gridPreviewPhoto from '../assets/Photos/DirectorPhoto.png';

const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

const section1_title = 'Lorem Ipsum';
const section1_text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, et quidem faciunt, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.';

const section2_title = 'Vestibulum Ante';
const section2_text = 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit asnatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.';

const placeholderCollagePhotos = Array(9).fill(gridPreviewPhoto);
const placeholderGalleryPhotos = Array.from({ length: 8 }, (_, i) => ({
  id: `p-placeholder-${i}`,
  title: `Placeholder Image ${i + 1}`,
  src: gridPreviewPhoto,
}));


export const photographersData = [
  // --- Lorenzo Agius (з реальними фото) ---
  {
    id: 1,
    name: 'Lorenzo Agius',
    slug: 'lorenzo-agius',
    category: 'Editorial, Youth Campaigns',
    // ✅ ЗМІНА: пробіли замінено на %20
    coverImage: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-Main%20Image-i.php-66.jpeg`,
    // ✅ ЗМІНА: пробіли замінено на %20
    profilePhotoSrc: 'front-end/artists/photographers/1-Lorenzo%20Agius.png',
    bio: 'Is a Dominican-American director, producer, and founder of the production company Cinema Giants...lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    section1_title,
    section1_text,
    section2_title,
    section2_text,
    // ✅ ЗМІНА: пробіли замінено на %20 у шляху до папки
    collagePhotos: [
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/01-.php-3.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/02.php-32.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/03i.php-98.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/04i.php-103.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/06i.php-102.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/06i.php-91.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/07i.php-101.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/08i.php-111.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/09i.php-92.jpeg`,
    ],
    // ✅ ЗМІНА: пробіли замінено на %20 у шляхах
    photos: [
      { id: 'la-s1', title: 'Gallery Photo 1', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00%20-%20Galleryi.php-51.jpeg` },
      { id: 'la-s2', title: 'Gallery Photo 2', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-gallery%20i.php-41.jpeg` },
      { id: 'la-s3', title: 'Gallery Photo 3', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-gallery%20i.php-69.jpeg` },
      { id: 'la-s4', title: 'Gallery Photo 4', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-gallery%20i.php-87.jpeg` },
      { id: 'la-s5', title: 'Gallery Photo 5', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-107.jpeg` },
      { id: 'la-s6', title: 'Gallery Photo 6', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-13.jpeg` },
      { id: 'la-s7', title: 'Gallery Photo 7', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-57.jpeg` },
      { id: 'la-s8', title: 'Gallery Photo 8', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-82.jpeg` },
      { id: 'la-s9', title: 'Gallery Photo 9', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-90.jpeg` },
      { id: 'la-s10', title: 'Gallery Photo 10', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-97.jpeg` },
      { id: 'la-s11', title: 'Gallery Photo 11', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-99.jpeg` },
      { id: 'la-s12', title: 'Gallery Photo 12', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/10i.php-112.jpeg` },
      { id: 'la-s13', title: 'Gallery Photo 13', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/11i.php-93.jpeg` },
      { id: 'la-s14', title: 'Gallery Photo 14', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/12i.php-73.jpeg` },
      { id: 'la-s15', title: 'Gallery Photo 15', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/13i.php-9.jpeg` },
      { id: 'la-s16', title: 'Gallery Photo 16', src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/14i.php-2.jpeg` },

    ],
  },
  // --- Інші фотографи (без змін) ---
  {
    id: 2,
    name: 'Bud Force',
    slug: 'bud-force',
    category: 'Celebrity, Portraiture',
    coverImage: gridPreviewPhoto,
    profilePhotoSrc: 'front-end/artists/photographers/2-Bud Force.png',
    bio: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    section1_title,
    section1_text,
    section2_title,
    section2_text,
    collagePhotos: placeholderCollagePhotos,
    photos: placeholderGalleryPhotos,
  },
  {
    id: 3,
    name: 'Janelle Shirtcliff',
    slug: 'janelle-shirtcliff',
    category: 'Editorial, Youth Campaigns',
    coverImage: gridPreviewPhoto,
    profilePhotoSrc: 'front-end/artists/photographers/3-JANELLE SHIRTCLIFF.png',
    bio: 'Is a Dominican-American director, producer, and founder of the production company Cinema Giants...',
    section1_title,
    section1_text,
    section2_title,
    section2_text,
    collagePhotos: placeholderCollagePhotos,
    photos: placeholderGalleryPhotos,
  },
  {
    id: 5,
    name: 'Janette Beckman',
    slug: 'janette-beckman',
    category: 'Editorial, Youth Campaigns',
    coverImage: gridPreviewPhoto,
    profilePhotoSrc: 'front-end/artists/photographers/4-Janette+Beckman.png',
    bio: 'Is a Dominican-American director, producer, and founder of the production company Cinema Giants...',
    section1_title,
    section1_text,
    section2_title,
    section2_text,
    collagePhotos: placeholderCollagePhotos,
    photos: placeholderGalleryPhotos,
  },
  {
    id: 6,
    name: 'Vivienne & Tamas',
    slug: 'vivienne-tamas',
    category: 'Editorial, Youth Campaigns',
    coverImage: gridPreviewPhoto,
    profilePhotoSrc: 'front-end/artists/photographers/5-Vivienne and Tamas.png',
    bio: 'Is a Dominican-American director, producer, and founder of the production company Cinema Giants...',
    section1_title,
    section1_text,
    section2_title,
    section2_text,
    collagePhotos: placeholderCollagePhotos,
    photos: placeholderGalleryPhotos,
  },
];