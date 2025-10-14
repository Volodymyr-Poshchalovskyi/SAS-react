// src/Data/PhotographersData.js

import gridPreviewPhoto from '../assets/Photos/DirectorPhoto.png';

const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

const section1_title = 'Lorem Ipsum';
const section1_text =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, et quidem faciunt, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.';

const section2_title = 'Vestibulum Ante';
const section2_text =
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit asnatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.';

const placeholderCollagePhotos = Array(9).fill(gridPreviewPhoto);
const placeholderGalleryPhotos = Array.from({ length: 8 }, (_, i) => ({
  id: `p-placeholder-${i}`,
  title: `Placeholder Image ${i + 1}`,
  src: gridPreviewPhoto,
}));

export const photographersData = [
  // --- Lorenzo Agius (з реальними фото і текстами) ---
  {
    id: 1,
    name: 'Lorenzo Agius',
    slug: 'lorenzo-agius',
    category: 'Editorial, Youth Campaigns',
    coverImage: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-Main%20Image-i.php-66.jpeg`,
    profilePhotoSrc: 'front-end/artists/photographers/1-Lorenzo%20Agius.png',
    // ✅ ЗМІНА: біографія оновлена з секції "Intro / Hero Section"
    bio: `British-born, Maltese in spirit — Lorenzo Agius is a portrait photographer whose images have become part of our visual landscape.
With a fine art foundation and cinematic eye, Agius treats photography not as mere documentation but as a conversation: between subject and lens, between light and feeling. His portraits are grounded in sincerity, trust, and precision — allowing moments of humour, vulnerability, and quiet power to surface.
Whether capturing celebrities amid grandeur or stillness, Agius avoids spectacle in favor of resonance. His work invites us beyond fame toward something timeless and human.
From his breakthrough portraits on Trainspotting to iconic covers like Liam Gallagher & Patsy Kensit for Vanity Fair, Agius’s imagery has shaped cultural memory. Across decades he has collaborated with leading editorial and commercial clients worldwide, crafting images that linger in both memory and gallery halls.`,
    // ✅ ЗМІНА: заголовок і текст оновлені з секції "Bottom Bio Section"
    section1_title: 'About Lorenzo',
    section1_text: `Lorenzo Agius (b. 1962) is a British-born photographer of Maltese heritage whose career spans film, fashion, editorial, and portraiture. Drawing from his fine art and art-history education, Agius brings a refined yet intuitive sensibility to every image. His early acclaim came from his distinctive Trainspotting portraits, and soon after he captured the spirit of Cool Britannia with Liam Gallagher & Patsy Kensit for Vanity Fair. Over the years, he has photographed the world’s most luminous figures — always with the ambition to reveal their humanity rather than their celebrity.
Agius’s work is held in prominent collections, and his exhibitions have spanned London, Moscow, Paris, Abu Dhabi, and Malta. Trusted by top film, fashion, and editorial clients, he continues to evolve his practice — and is currently at work on his first retrospective monograph.`,
    // ✅ ЗМІНА: заголовок і текст оновлені з секції "Exhibitions & Clients Section"
    section2_title: 'Exhibitions & Clients',
    section2_text: `Exhibitions & Collections
- 2009: Solo, Getty Gallery, London
- 2009: Exhibition, Alon Zakaim Gallery, London
- 2009: Commissioned by BMW for “Art Car” project, Russia
- 2010: Solo, Red October Art Gallery / BMW, Moscow
- 2010: Open-air exhibitions, Stoleshnikov Lane, Moscow
- 2010: Exhibition (with British Fashion Council), Natural History Museum, London
- 2010: Images displayed across Cannes for 63rd Festival
- 2011: Solo, Palais Chaumet Museum, Paris (for “Les César”)
- 2012: Solo, Alon Zakaim Gallery, London
- 2017: Solo, Xposure Festival, Sharjah (opened by Sultan Bin Muhammad Al-Qasimi)
- 2025: Retrospective, Spazju Kreattiv Gallery, Malta
- 2025: Retrospective, Abu Dhabi
- 2026: Retrospective, London Corinthia

Institutional Collections & Recognition
- Six images in the permanent collection, National Portrait Gallery, London
- Works held in the Victoria & Albert Museum (UK)
- Works in Malta’s MUZA National Gallery & Spazju Kreattiv Archive
- Canon Ambassador since 2008

Clients & Editorial Collaborations
Warner Bros · Netflix · Disney · 20th Century Fox · HBO · Lionsgate · Sony Pictures · Universal · CW · Starz · CBS · Paramount
Vogue · Elle · Harper’s Bazaar · GQ · Esquire · Town & Country · The Face · ID`,
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
    photos: [
      {
        id: 'la-s1',
        title: 'Gallery Photo 1',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00%20-%20Galleryi.php-51.jpeg`,
      },
      {
        id: 'la-s2',
        title: 'Gallery Photo 2',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-gallery%20i.php-41.jpeg`,
      },
      {
        id: 'la-s3',
        title: 'Gallery Photo 3',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-gallery%20i.php-69.jpeg`,
      },
      {
        id: 'la-s4',
        title: 'Gallery Photo 4',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-gallery%20i.php-87.jpeg`,
      },
      {
        id: 'la-s5',
        title: 'Gallery Photo 5',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-107.jpeg`,
      },
      {
        id: 'la-s6',
        title: 'Gallery Photo 6',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-13.jpeg`,
      },
      {
        id: 'la-s7',
        title: 'Gallery Photo 7',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-57.jpeg`,
      },
      {
        id: 'la-s8',
        title: 'Gallery Photo 8',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-82.jpeg`,
      },
      {
        id: 'la-s9',
        title: 'Gallery Photo 9',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-90.jpeg`,
      },
      {
        id: 'la-s10',
        title: 'Gallery Photo 10',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-97.jpeg`,
      },
      {
        id: 'la-s11',
        title: 'Gallery Photo 11',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-galleryi.php-99.jpeg`,
      },
      {
        id: 'la-s12',
        title: 'Gallery Photo 12',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/10i.php-112.jpeg`,
      },
      {
        id: 'la-s13',
        title: 'Gallery Photo 13',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/11i.php-93.jpeg`,
      },
      {
        id: 'la-s14',
        title: 'Gallery Photo 14',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/12i.php-73.jpeg`,
      },
      {
        id: 'la-s15',
        title: 'Gallery Photo 15',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/13i.php-9.jpeg`,
      },
      {
        id: 'la-s16',
        title: 'Gallery Photo 16',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/14i.php-2.jpeg`,
      },
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
    section1_title: 'Lorem Ipsum',
    section1_text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, et quidem faciunt, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
    section2_title: 'Vestibulum Ante',
    section2_text:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit asnatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
    collagePhotos: placeholderCollagePhotos,
    photos: placeholderGalleryPhotos,
  },
  {
    id: 3,
    name: 'Janelle Shirtcliff',
    slug: 'janelle-shirtcliff',
    category: 'Editorial, Youth Campaigns',
    // Cover should be the specified 00-main Image .jpg.webp
    coverImage: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/00-main%20Image%20.jpg.webp`,
    profilePhotoSrc: 'front-end/artists/photographers/3-JANELLE SHIRTCLIFF.png',
    bio: 'Is a Dominican-American director, producer, and founder of the production company Cinema Giants...lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    section1_title: 'Lorem Ipsum',
    section1_text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, et quidem faciunt, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
    section2_title: 'Vestibulum Ante',
    section2_text:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit asnatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
    // Collage should be the first 9 images starting with 01..09
    collagePhotos: [
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/01-Collective%2BProduct_011719-844-Edit.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/02-DSC_7052.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/03-HERO-IMG_9373.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/04-DweWgPDVAAIast_.png`,
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/05-People_michelle-rodriguez_02-48f709d3c92d4b96b231508e98d88a1d.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/06-MayerHawthorne-photo-JanellShirtcliff_214e_1_t610.png.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/07-image5-1.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/08-ioanna-gika-janell-shirtcliff-web.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/09-js-entertainment-right-07.jpg`,
    ],
    // Remaining images (excluding coverImage and collage) go to the carousel/gallery slider
    photos: [
      {
        id: 'js-1',
        title: 'Gallery1471903219961',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/00-Gallery1471903219961.jpeg`,
      },
      {
        id: 'js-2',
        title: 'Gallery2022_08_30',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/00-Gallery2022_08_30_JanelleShirtcliff_JennaOrtega_0005%201-Edit-2-2.jpg`,
      },
      {
        id: 'js-3',
        title: 'GalleryDtHq',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/00-GalleryDtHq-FqXoAEv26e.jpg`,
      },
      {
        id: 'js-4',
        title: 'GalleryJanell',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/00-GalleryJanell-Shirtcliff-P1-R3-11.jpg`,
      },
      {
        id: 'js-5',
        title: 'LADYGUNN LAVERNE COX',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/00-GalleryLADYGUNN-LAVERNE-COX-91.jpg`,
      },
      {
        id: 'js-6',
        title: 'GalleryMain-1808',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/00-GalleryMain-1808.jpg`,
      },
      {
        id: 'js-7',
        title: 'Galleryrosemcg',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/00-Galleryrosemcg.jpg`,
      },
      {
        id: 'js-8',
        title: '10-VgP...',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/10-VgP-bTDRjZWzMpfKh0vtOZC2ePYyf5ORBApMBq6iGrE.jpg.webp`,
      },
      {
        id: 'js-9',
        title: 'Screen Shot 2020',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/11-Screen%2BShot%2B2020-10-01%2Bat%2B4.43.48%2BPM.png`,
      },
      {
        id: 'js-10',
        title: 'Screenshot 2024-10-03 11.28.12',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/12-Screenshot%202024-10-03%20at%2011.28.12%20PM.png`,
      },
      {
        id: 'js-11',
        title: 'Screenshot 2024-10-03 11.28.26',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/13-Screenshot%202024-10-03%20at%2011.28.26%20PM.png`,
      },
      {
        id: 'js-12',
        title: 'thehabit022421',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/14-thehabit022421_1.372.1.jpg`,
      },
    ],
  },
  {
    id: 5,
    name: 'Janette Beckman',
    slug: 'janette-beckman',
    category: 'Editorial, Youth Campaigns',
    coverImage: gridPreviewPhoto,
    profilePhotoSrc: 'front-end/artists/photographers/4-Janette+Beckman.png',
    bio: 'Is a Dominican-American director, producer, and founder of the production company Cinema Giants...',
    section1_title: 'Lorem Ipsum',
    section1_text:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, et quidem faciunt, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.',
    section2_title: 'Vestibulum Ante',
    section2_text:
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit asnatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
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