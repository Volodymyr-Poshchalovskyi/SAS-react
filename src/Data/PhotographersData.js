// src/Data/PhotographersData.js

import gridPreviewPhoto from '../assets/Photos/DirectorPhoto.png';

const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

const PLACEHOLDER_SECTION1_TITLE = 'Lorem Ipsum';
const PLACEHOLDER_SECTION1_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

const PLACEHOLDER_SECTION2_TITLE = 'Vestibulum Ante';
const PLACEHOLDER_SECTION2_TEXT =
  'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.';

const placeholderCollagePhotos = Array(14).fill(gridPreviewPhoto);
const placeholderGalleryPhotos = Array.from({ length: 8 }, (_, i) => ({
  id: `p-placeholder-${i}`,
  title: `Placeholder Image ${i + 1}`,
  src: gridPreviewPhoto,
}));

export const photographersData = [
  {
    id: 1,
    name: 'Lorenzo Agius',
    slug: 'lorenzo-agius',
    category: 'Editorial, Youth Campaigns',
    coverImage: `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/00-Main%20Image-i.php-66.jpeg`,
    profilePhotoSrc: 'front-end/artists/photographers/1-Lorenzo%20Agius.png',
    bio: `British-born, Maltese in spirit — Lorenzo Agius is a portrait photographer whose images have become part of our visual landscape.
With a fine art foundation and cinematic eye, Agius treats photography not as mere documentation but as a conversation: between subject and lens, between light and feeling. His portraits are grounded in sincerity, trust, and precision — allowing moments of humour, vulnerability, and quiet power to surface.
Whether capturing celebrities amid grandeur or stillness, Agius avoids spectacle in favor of resonance. His work invites us beyond fame toward something timeless and human.
From his breakthrough portraits on Trainspotting to iconic covers like Liam Gallagher & Patsy Kensit for Vanity Fair, Agius’s imagery has shaped cultural memory. Across decades he has collaborated with leading editorial and commercial clients worldwide, crafting images that linger in both memory and gallery halls.`,
    section1_title: 'About Lorenzo',
    section1_text: `Lorenzo Agius (b. 1962) is a British-born photographer of Maltese heritage whose career spans film, fashion, editorial, and portraiture. Drawing from his fine art and art-history education, Agius brings a refined yet intuitive sensibility to every image. His early acclaim came from his distinctive Trainspotting portraits, and soon after he captured the spirit of Cool Britannia with Liam Gallagher & Patsy Kensit for Vanity Fair. Over the years, he has photographed the world’s most luminous figures — always with the ambition to reveal their humanity rather than their celebrity.
Agius’s work is held in prominent collections, and his exhibitions have spanned London, Moscow, Paris, Abu Dhabi, and Malta. Trusted by top film, fashion, and editorial clients, he continues to evolve his practice — and is currently at work on his first retrospective monograph.`,
    section2_title: 'Exhibitions & Clients',
    section2_text: {
      exhibitions: [
        { year: 2009, description: 'Solo, Getty Gallery, London' },
        { year: 2009, description: 'Exhibition, Alon Zakaim Gallery, London' },
        {
          year: 2009,
          description: 'Commissioned by BMW for “Art Car” project, Russia',
        },
        {
          year: 2010,
          description: 'Solo, Red October Art Gallery / BMW, Moscow',
        },
        {
          year: 2010,
          description: 'Open-air exhibitions, Stoleshnikov Lane, Moscow',
        },
        {
          year: 2010,
          description:
            'Exhibition (with British Fashion Council), Natural History Museum, London',
        },
        {
          year: 2010,
          description: 'Images displayed across Cannes for 63rd Festival',
        },
        {
          year: 2011,
          description: 'Solo, Palais Chaumet Museum, Paris (for “Les César”)',
        },
        { year: 2012, description: 'Solo, Alon Zakaim Gallery, London' },
        {
          year: 2017,
          description:
            'Solo, Xposure Festival, Sharjah (opened by Sultan Bin Muhammad Al-Qasimi)',
        },
        {
          year: 2025,
          description: 'Retrospective, Spazju Kreattiv Gallery, Malta',
        },
        { year: 2025, description: 'Retrospective, Abu Dhabi' },
        { year: 2026, description: 'Retrospective, London Corinthia' },
      ],
      institutional: [
        'Six images in the permanent collection, National Portrait Gallery, London',
        'Works held in the Victoria & Albert Museum (UK)',
        'Works in Malta’s MUZA National Gallery & Spazju Kreattiv Archive',
        'Canon Ambassador since 2008',
      ],
      clients: [
        'Warner Bros',
        'Netflix',
        'Disney',
        '20th Century Fox',
        'HBO',
        'Lionsgate',
        'Sony Pictures',
        'Universal',
        'CW',
        'Starz',
        'CBS',
        'Paramount',
        'Vogue',
        'Elle',
        'Harper’s Bazaar',
        'GQ',
        'Esquire',
        'Town & Country',
        'The Face',
        'ID',
      ],
    },
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
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/10i.php-112.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/11i.php-93.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/12i.php-73.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/13i.php-9.jpeg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/01-Lorenzo%20Agius/14i.php-2.jpeg`,
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
    ],
  },
  {
    id: 2,
    name: 'Bud Force',
    slug: 'bud-force',
    category: 'Celebrity, Portraiture',
    coverImage: gridPreviewPhoto,
    profilePhotoSrc: 'front-end/artists/photographers/2-Bud Force.png',
    bio: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    section1_title: PLACEHOLDER_SECTION1_TITLE,
    section1_text: PLACEHOLDER_SECTION1_TEXT,
    section2_title: PLACEHOLDER_SECTION2_TITLE,
    section2_text: PLACEHOLDER_SECTION2_TEXT,
    collagePhotos: placeholderCollagePhotos,
    photos: placeholderGalleryPhotos,
  },
  {
    id: 3,
    name: 'Janelle Shirtcliff',
    slug: 'janelle-shirtcliff',
    category: 'Editorial, Youth Campaigns',
    coverImage: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/00-main%20Image%20.jpg.webp`,
    profilePhotoSrc: 'front-end/artists/photographers/3-JANELLE SHIRTCLIFF.png',
    bio: 'Born in Texas and now based in Los Angeles, Janell Shirtcliff began her career in front of the camera as a model for brands like Levi’s and Urban Outfitters before transitioning into directing, writing, and photography. Her diverse creative background — spanning performance, fashion, and narrative storytelling — informs a deeply collaborative approach and a distinctive visual signature. Across mediums, Janell’s work continues to celebrate individuality, challenge convention, and capture the spirit of contemporary culture.',
    section1_title: 'About Janell',
    section1_text:
      'Janell Shirtcliff is a multidisciplinary visual artist whose work lives at the intersection of fashion, film, and pop culture. Known for a bold visual language and instinctive storytelling, she crafts imagery that’s as emotionally resonant as it is visually striking — blending cinematic mood with a modern, irreverent edge. Whether shooting stills or directing moving images, Janell builds worlds that feel at once nostalgic and new, authentic yet dreamlike.Her photography first took shape as part of a creative extension of her vintage shop, quickly gaining attention for its effortless cool and subcultural sensitivity. Today, her images appear in leading publications including Variety, Billboard, Nylon, and Teen Vogue, and often explore themes of identity, intimacy, and transformation.',
    section2_title: 'Exhibitions & Clients',
    section2_text:
      'As a director, Janell’s storytelling expands into music videos, feature films, and documentaries. She’s created visual narratives for artists like The Band Perry, Bethany Cosentino, Mayer Hawthorne, and Tashaki Miyaki — projects that showcase her gift for translating emotion into unforgettable frames. In 2021, she made her feature debut with Habit, followed by the documentary Mother of the Dawn, and is currently developing the fantasy-horror project Triton.',
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
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/10-VgP-bTDRjZWzMpfKh0vtOZC2ePYyf5ORBApMBq6iGrE.jpg.webp`,
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/00-Gallery2022_08_30_JanelleShirtcliff_JennaOrtega_0005%201-Edit-2-2.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/12-Screenshot%202024-10-03%20at%2011.28.12%20PM.png`,
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/13-Screenshot%202024-10-03%20at%2011.28.26%20PM.png`,
      `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/14-thehabit022421_1.372.1.jpg`,
    ],
    photos: [
      {
        id: 'js-1',
        title: 'Gallery1471903219961',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/00-Gallery1471903219961.jpeg`,
      },
      {
        id: 'js-2',
        title: 'Gallery2022_08_30',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/04-Janelle%20Shirtcliff/11-Screen%2BShot%2B2020-10-01%2Bat%2B4.43.48%2BPM.png`,
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
    ],
  },
  {
    id: 5,
    name: 'Janette Beckman',
    slug: 'janette-beckman',
    category: 'Editorial, Youth Campaigns',
    coverImage: `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/00-HERO-IMAGE-Screenshot%202024-10-01%20at%204.27.55%20PM.png`,
    profilePhotoSrc: 'front-end/artists/photographers/4-Janette+Beckman.png',
    bio: 'Is a Dominican-American director, producer, and founder of the production company Cinema Giants...',
    section1_title: PLACEHOLDER_SECTION1_TITLE,
    section1_text: PLACEHOLDER_SECTION1_TEXT,
    section2_title: PLACEHOLDER_SECTION2_TITLE,
    section2_text: PLACEHOLDER_SECTION2_TEXT,
    collagePhotos: [
      `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/1-Big-Daddy-Kane-1831x1900.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/2-CHAKA-web-2252x1900.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/3-LL-COOL-J_-NY-1985-1413x1900.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/4-Dorothee-shcumacher-2-3693x1900-1.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/5-joe-strummer-backstage%C2%A9j-beckman-2779x1900.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/6-BEASTIE-1889x1900.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/7Latifah--1720x1900.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/8-Mod-twins-London-1979-3-1231x1900.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/9-Pubic-Enemy-Flava-flav--1467x1900.jpg`,
    ],
    photos: [
      {
        id: 'jb-g1',
        title: 'Gallery ANDRE 3000',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/00-galleryANDRE-3000-NYC-2003-1537x1900.jpg`,
      },
      {
        id: 'jb-g2',
        title: 'Gallery DEBBIE HARRY',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/00-galleryDEBBIE-HARRY_London-1979-1261x1900.jpg`,
      },
      {
        id: 'jb-g3',
        title: 'Gallery Dr Dre',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/00-galleryDr-Dre--1452x1900.jpg`,
      },
      {
        id: 'jb-g4',
        title: 'Gallery KEITH HARING PRINT',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/05-Janette%20Beckman/04-Janette%20Beckman/00-galleryKEITH-HARING-PRINT-1638x1900.jpg`,
      },
    ],
  },
  {
    id: 6,
    name: 'Vivienne & Tamas',
    slug: 'vivienne-tamas',
    category: 'Editorial, Youth Campaigns',
    coverImage: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-MainImage.png`,
    profilePhotoSrc: 'front-end/artists/photographers/5-Vivienne and Tamas.png',
    bio: 'Is a Dominican-American director, producer, and founder of the production company Cinema Giants...',
    section1_title: PLACEHOLDER_SECTION1_TITLE,
    section1_text: PLACEHOLDER_SECTION1_TEXT,
    section2_title: PLACEHOLDER_SECTION2_TITLE,
    section2_text: PLACEHOLDER_SECTION2_TEXT,
    // Collage: use images numbered 01..09
    collagePhotos: [
      `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/01-7-6556Vivien02%2Bcopy.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/02-Chanel_Haya_Jewellery26103.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/03-Chanel_HC_Jewellery2707.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/04-Chanel%2BMan%2Bx%2BElle10677.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/05-KaDeWe0991.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/06-109%2BHB%2B7%2BOktobar%2B2023.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/07-z0D6A6870_1.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/08-z0D6A7131_1.jpg`,
      `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/09-Turnt_719379.jpg`,
    ],

    // Gallery carousel: include all remaining 00-* gallery images
    photos: [
      {
        id: 'vt-1',
        title: 'Gallery Photo 1',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-Gallery%20KaDeWe0811.jpg`,
      },
      {
        id: 'vt-2',
        title: 'Gallery Photo 2',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-Gallery%20Turnt_Chapter_Four0372.jpg`,
      },
      {
        id: 'vt-3',
        title: 'Gallery Photo 3',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-Gallery12-6556Vivien01%2Bcopy.jpg`,
      },
      {
        id: 'vt-4',
        title: 'Gallery Photo 4',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-Gallery290421_JLD_VIVIENNETAMAS_0424_Boption.jpg`,
      },
      {
        id: 'vt-5',
        title: 'Gallery Photo 5',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-GalleryChanel%2Bx%2BLaha21959.jpg`,
      },
      {
        id: 'vt-6',
        title: 'Gallery Photo 6',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-galeryChanel%2BMan%2Bx%2BElle10896.jpg`,
      },
      {
        id: 'vt-7',
        title: 'Gallery Photo 7',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-gallery%2001%2BSorbet%2Bx%2BChanel2243.jpg`,
      },
      {
        id: 'vt-8',
        title: 'Gallery Photo 8',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-gallery%20CHANEL_THE_WINGS_SET_0070.jpg`,
      },
      {
        id: 'vt-9',
        title: 'Gallery Photo 9',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-gallery-DSCF1542.jpg`,
      },
      {
        id: 'vt-10',
        title: 'Gallery Photo 10',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-gallery20231010_Douglas_MUP_Neuheiten_Still_Look_02_Megan_575.jpg`,
      },
      {
        id: 'vt-11',
        title: 'Gallery Photo 11',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-gallery20231010_Douglas_MUP_Neuheiten_Still_Look_03_double_803.jpg`,
      },
      {
        id: 'vt-12',
        title: 'Gallery Photo 12',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-gallery20231011_Douglas_MUP_Neuheiten_Still_02_Look_07_Stella_332.jpg`,
      },
      {
        id: 'vt-13',
        title: 'Gallery Photo 13',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-galleryCHANEL_THE_COMET_SET_0282_bw.jpg`,
      },
      {
        id: 'vt-14',
        title: 'Gallery Photo 14',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-galleryCHANEL_THE_LION_SET_0089_bw.jpg`,
      },
      {
        id: 'vt-15',
        title: 'Gallery Photo 15',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-galleryChanel%2Bx%2BLaha22115.jpg`,
      },
      {
        id: 'vt-16',
        title: 'Gallery Photo 16',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-galleryChanel_Hia4472_1.jpg`,
      },
      {
        id: 'vt-17',
        title: 'Gallery Photo 17',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-galleryHarpers_Bazaar_Serbia5367.jpg`,
      },
      {
        id: 'vt-18',
        title: 'Gallery Photo 18',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-galleryHarpers_Bazaar_Serbia5438-3.jpg`,
      },
      {
        id: 'vt-19',
        title: 'Gallery Photo 19',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-galleryTurnt_Chapter_Four0586.jpg`,
      },
      {
        id: 'vt-20',
        title: 'Gallery Photo 20',
        src: `${CDN_BASE_URL}/front-end/02-Photographers/06-Vivienne%20%26%20Tamas/00-gallryChanel-Haute-Couture--Sorbet-fashion-editorial-VivienneandTamas-12%2Bcopy.jpg`,
      },
    ],
  },
];
