// src/Pages/PhotographerPage.jsx

import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { photographersData } from '../Data/PhotographersData';

const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

export default function PhotographerPage() {
  const { photographerSlug } = useParams();

  const photographer = photographersData.find(
    (p) => p.slug === photographerSlug
  );

  const sliderRef = useRef(null);
  const collageSectionRef = useRef(null);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const collageImagesData = [
    { width: 411, height: 732, left: 120, top: 2256 },
    { width: 363, height: 510, left: 710, top: 2271 },
    { width: 363, height: 491, left: 935, top: 2494 },
    { width: 461, height: 579, left: -55, top: 3240 },
    { width: 585, height: 732, left: 740, top: 3132 },
    { width: 446, height: 448, left: 523, top: 3921 },
    { width: 385, height: 441, left: 15, top: 4446 },
    { width: 343, height: 596, left: 301, top: 4510 },
    { width: 462, height: 580, left: 930, top: 4484 },
  ];

  const topOffset = 2150;

  const containerHeight = Math.max(
    ...collageImagesData.map((img) => img.top - topOffset + img.height)
  );

  const handlePrev = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  if (!photographer) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <h2 className="text-4xl font-chanel">Photographer Not Found</h2>
      </div>
    );
  }

  const publicPhotoUrl = photographer.profilePhotoSrc
    ? `${CDN_BASE_URL}/${photographer.profilePhotoSrc}`
    : '';

  return (
    <div className="bg-white">
      {/* ... (Секції заголовка, великого фото, опису та слайдера залишаються без змін) ... */}
      <section className="bg-white text-black flex items-center justify-center relative h-[100px] mt-[90px] md:mt-[117px]">
        <Link
          to="/photographers"
          className="absolute left-8 md:left-20 top-1/2 -translate-y-1/2 flex items-center justify-center w-12 h-12 border-2 border-black text-black hover:bg-black hover:text-white transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-chanel font-semibold uppercase text-center px-4">
          {photographer.name}
        </h1>
      </section>

      <section className="w-full h-screen">
        <img src={photographer.coverImage} alt={`Cover for ${photographer.name}`} className="w-full h-full object-cover" />
      </section>

      <section className="bg-white py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-[20px] font-semibold uppercase mb-4">{photographer.section1_title}</h2>
          <p className="text-[12px] leading-relaxed text-gray-700 text-justify">{photographer.section1_text}</p>
        </div>
      </section>

      <section className="bg-white pl-2 md:pl-5 overflow-hidden relative group">
        <button onClick={handlePrev} className="absolute left-5 top-1/2 -translate-y-1/2 z-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-label="Previous image">
          <svg className="w-12 h-12 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button onClick={handleNext} className="absolute right-5 top-1/2 -translate-y-1/2 z-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-label="Next image">
          <svg className="w-12 h-12 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <div ref={sliderRef} className="flex flex-row gap-24 h-[100vh] overflow-x-auto scrollbar-hide">
          {photographer.photos.map((photo, index) => (
            <div key={photo.id} className={`flex-shrink-0 ${index % 3 === 0 ? 'md:w-[39.5%]' : 'md:w-[35%]'}`}>
              <img src={photo.src} alt={`Gallery view ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* Секція: Колаж з зображень */}
      <section ref={collageSectionRef} className="w-full bg-white py-[50px] flex justify-center">
        <div className="relative" style={{ width: '1440px', height: `${containerHeight}px` }}>
          {collageImagesData.map((img, index) => {
            const collageImageSrc = photographer.collagePhotos?.[index] || photographer.coverImage;

            // ✅ ЗМІНА: Логіка для паралакс-зображень
            if (index === 2 || index === 6) {
              const parallaxStrength = 0.4; // Збільшимо силу ефекту, щоб він був помітнішим
              let parallaxY = 0;

              if (collageSectionRef.current) {
                const elementTop = collageSectionRef.current.offsetTop + (img.top - topOffset);
                const scrollRelativeToElement = scrollY - elementTop;
                parallaxY = scrollRelativeToElement * parallaxStrength;
              }
              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    width: `${img.width}px`,
                    height: `${img.height}px`,
                    left: `${img.left}px`,
                    top: `${img.top - topOffset}px`,
                    zIndex: index === 6 ? 2 : 0,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={collageImageSrc}
                    alt={`Collage parallax view ${index + 1}`}
                    style={{
                      // ✅ ЗМІНА: Ключова частина
                      position: 'absolute',
                      width: '100%',
                      height: '140%', // Робимо зображення на 40% вищим за контейнер
                      objectFit: 'cover', // Застосовуємо cover до цієї збільшеної області
                      top: '-20%', // Зміщуємо зображення вгору, щоб воно було по центру
                      transform: `translateY(${parallaxY}px)`,
                    }}
                  />
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-5xl font-bold bg-black bg-opacity-50 p-4 rounded-full z-10">
                    {index + 1}
                  </span>
                </div>
              );
            }

            // Стара логіка для звичайних зображень
            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  width: `${img.width}px`,
                  height: `${img.height}px`,
                  left: `${img.left}px`,
                  top: `${img.top - topOffset}px`,
                  zIndex: index === 7 ? 1 : 0,
                }}
              >
                <img src={collageImageSrc} alt={`Collage view ${index + 1}`} className="w-full h-full object-cover"/>
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-5xl font-bold bg-black bg-opacity-50 p-4 rounded-full">
                  {index + 1}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* ... (Секції опису 2 та біографії залишаються без змін) ... */}
      <section className="bg-white py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-[20px] font-semibold uppercase mb-4">{photographer.section2_title}</h2>
          <p className="text-[12px] leading-relaxed text-gray-700 text-justify">{photographer.section2_text}</p>
        </div>
      </section>
      <section className="relative w-full bg-black text-white pt-16">
        <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-black to-transparent z-10 pointer-events-none" />
          {publicPhotoUrl && (
            <div className="flex justify-center px-4">
              <div className="relative w-full md:w-1/2 lg:w-5/12">
                <img src={publicPhotoUrl} alt={photographer.name} className="w-full h-auto object-cover"/>
                <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black to-transparent pointer-events-none" />
              </div>
            </div>
          )}
        <div className="w-full bg-black">
          <div className="container mx-auto px-4 py-20 md:py-32 flex flex-col items-center text-center">
            <p className="text-white text-xl mb-7">{photographer.category}</p>
            <h2 className="font-normal text-[80px] leading-none tracking-[-0.15em] mb-8">{photographer.name}</h2>
            <p className="w-full max-w-3xl font-semibold text-justify text-xs leading-[36px] tracking-[-0.09em]" style={{ wordSpacing: '0.1em' }}>
              {photographer.bio}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}