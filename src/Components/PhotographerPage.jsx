import React, { useLayoutEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { photographersData } from '../Data/PhotographersData';

export default function PhotographerPage() {
  const { photographerSlug } = useParams();
  
  const photographer = photographersData.find((p) => p.slug === photographerSlug);

  const galleryImages = Array(8).fill(photographer?.coverImage);
  
  const sliderRef = useRef(null);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  return (
    <div className="bg-white">
      {/* Секція 1: Заголовок з кнопкою "назад" (без змін) */}
      <section className="bg-white text-black h-[40vh] flex items-center justify-center pt-20 md:pt-28">
        <div className="relative w-full flex items-center justify-center">
          <div className="absolute left-0 h-full flex items-center pl-12 md:pl-32">
            <Link
              to="/photographers"
              className="flex items-center justify-center w-16 h-16 text-black rounded-full transition-colors group" 
            >
              <svg 
                  className="h-12 w-12 transition-colors "
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          </div>
          <h1 className="text-[120px] font-chanel font-semibold uppercase text-center px-4 flex-grow">
            {photographer.name}
          </h1>
        </div>
      </section>

      {/* Секція з великим фото (без змін) */}
      <section className="w-full h-screen">
        <img
          src={photographer.coverImage}
          alt={`Cover for ${photographer.name}`}
          className="w-full h-full object-cover"
        />
      </section>
      
      {/* Секція: Заголовок та опис (без змін) */}
      <section className="bg-white py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-[20px] font-semibold uppercase mb-4">
            Lorem Ipsum
          </h2>
          <p className="text-[12px] leading-relaxed text-gray-700 text-justify">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua, et quidem faciunt, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.
          </p>
        </div>
      </section>

      {/* ОНОВЛЕНА СЕКЦІЯ: Галерея-слайдер */}
      <section className="bg-white pl-2 md:pl-5 overflow-hidden relative group">
        
        {/* ✨ ЗМІНЕНО: Кнопка "Назад" без фону */}
        <button
          onClick={handlePrev}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Previous image"
        >
          <svg className="w-12 h-12 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* ✨ ЗМІНЕНО: Кнопка "Вперед" без фону */}
        <button
          onClick={handleNext}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Next image"
        >
          <svg className="w-12 h-12 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div 
          ref={sliderRef}
          className="flex flex-row gap-24 h-[100vh] overflow-x-auto scrollbar-hide"
        >
          {galleryImages.map((imageSrc, index) => (
            <div 
              key={index}
              className={`flex-shrink-0 ${
                index % 3 === 0 ? 'md:w-[39.5%]' : 'md:w-[35%]'
              }`}
            >
              <img
                src={imageSrc}
                alt={`Gallery view ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Секція біографії (без змін) */}
      <section className="relative w-full">
        <img
          src={photographer.profilePhoto}
          alt={photographer.name}
          className="w-full h-auto block"
        />
        <div className="absolute inset-x-0 bottom-[40%] h-[40%] bg-gradient-to-t from-black to-transparent flex items-end justify-center pb-8">
          <div className="text-center">
            <p className="text-white text-xl mb-7">{photographer.category}</p>
            <h2 className="font-normal text-white text-[80px] leading-none tracking-[-0.15em]">
              {photographer.name}
            </h2>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-black"></div>
        <div className="absolute inset-x-0 bottom-0 h-[40%] flex justify-center pt-28">
          <p
            className="w-2/5 font-semibold text-white text-justify text-xs leading-[36px] tracking-[-0.09em]"
            style={{ wordSpacing: '0.25em' }}
          >
            {photographer.bio}
          </p>
        </div>
      </section>
    </div>
  );
}