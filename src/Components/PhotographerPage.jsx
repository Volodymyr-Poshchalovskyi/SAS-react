import React, { useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// ✨ Зміна тут: Імпортуємо дані фотографів
import { photographersData } from '../Data/PhotographersData';

export default function PhotographerPage() {
  const { photographerSlug } = useParams();
  
  // ✨ Зміна тут: Шукаємо фотографа за slug
  const photographer = photographersData.find((p) => p.slug === photographerSlug);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!photographer) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <h2 className="text-4xl font-chanel">Photographer Not Found</h2>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Секція 1: Заголовок з кнопкою "назад" (як у DirectorPage) */}
      <section className="bg-white text-black h-[40vh] flex items-center justify-center relative pt-20 md:pt-28">
        <Link
          to="/photographers" // ✨ Зміна тут: Повертаємось на сторінку фотографів
          className="absolute left-8 md:left-20 top-1/2 -translate-y-1/2 flex items-center justify-center 
                     w-12 h-12 border-2 border-black text-black 
                     hover:bg-black hover:text-white transition-colors"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-chanel font-semibold uppercase text-center px-4">
          {photographer.name}
        </h1>
      </section>

      {/* ✨ Зміна тут: Замість блоку з відео, тепер галерея фото */}
      <div className="bg-white">
        {photographer.photos.map((photo) => (
          <section key={photo.id} className="py-8 px-4 md:px-16">
            <div className="max-w-7xl mx-auto flex flex-col items-center">
              <img 
                src={photo.src} 
                alt={photo.title}
                className="w-full h-auto object-contain max-h-[90vh]"
              />
              <p className="mt-4 text-center text-sm text-gray-600">{photo.title}</p>
            </div>
          </section>
        ))}
      </div>

      {/* Секція 3: Біографія фотографа (як у DirectorPage) */}
      <section className="w-full bg-white text-black py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
          <div className="w-full max-w-md md:w-[450px] flex-shrink-0">
            <img
              src={photographer.profilePhoto} // ✨ Зміна тут: Фото самого фотографа з даних
              alt={photographer.name}
              className="w-full h-auto object-cover aspect-square"
            />
          </div>
          <div className="w-full md:w-1/2 text-center md:text-left">
            <h2 className="text-4xl font-chanel font-semibold uppercase mb-6">
              {photographer.name}
            </h2>
            <p className="text-sm font-helvetica leading-relaxed">
              {photographer.bio}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}