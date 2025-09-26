import React, { useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { photographersData } from '../Data/PhotographersData';

export default function PhotographerPage() {
  const { photographerSlug } = useParams();
  
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
      {/* Секція 1: Заголовок з кнопкою "назад" (без змін) */}
      <section className="bg-white text-black h-[40vh] flex items-center justify-center pt-20 md:pt-28">
        <div className="relative w-full flex items-center justify-center">
          <div className="absolute left-0 h-full flex items-center pl-12 md:pl-32">
            <Link
              to="/photographers"
              className="flex items-center justify-center 
                         w-16 h-16 text-black rounded-full 
                          transition-colors group" 
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

      <section className="w-full h-screen">
        <img
          src={photographer.coverImage}
          alt={`Cover for ${photographer.name}`}
          className="w-full h-full object-cover"
        />
      </section>
      {/* ✨ НОВА СЕКЦІЯ ТУТ: Галерея з трьох зображень */}
      {/* ✨ НОВА СЕКЦІЯ ТУТ: Галерея з трьох зображень */}


      <section className="bg-white pl-2 md:pl-5 py-24 overflow-hidden">
        {/*
          Key Changes on this <section> element:
          1.  py-24: Додано значні вертикальні відступи (padding) зверху та знизу.
        */}
        <div className="flex flex-row gap-24 h-[100vh]">
          {/*
            Key Changes on this <div> element:
            1.  gap-12: Збільшено відстань між зображеннями (було gap-8).
            2.  З батьківського <div> видалено клас ширини (md:w-[130%]).
          */}

          {/* Перше зображення */}
          <div className="flex-shrink-0 md:w-[39.5%]">
            {/*
              Key Changes on this <div> element:
              1.  flex-shrink-0: Забороняє елементу стискатися.
              2.  md:w-[35%]: Встановлює конкретну ширину для елемента (35% від ширини батька).
                  Це робить його вужчим, ніж у попередній версії.
              3.  Клас flex-1 видалено.
            */}
            <img
              src={photographer.coverImage}
              alt="Gallery view 1"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Друге зображення */}
          <div className="flex-shrink-0 md:w-[35%]">
            <img
              src={photographer.coverImage}
              alt="Gallery view 2"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Третє зображення */}
          <div className="flex-shrink-0 md:w-[35%]">
            <img
              src={photographer.coverImage}
              alt="Gallery view 3"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Секція біографії (без змін) */}
      <section className="relative w-full">
        <img
          src={photographer.profilePhoto}
          alt={photographer.name}
          className="w-full h-auto block"
        />

        {/* ---------- Верхній блок з іменем фотографа ---------- */}
        <div className="absolute inset-x-0 bottom-[40%] h-[40%] bg-gradient-to-t from-black to-transparent flex items-end justify-center pb-8">
          <div className="text-center">
            <p className="text-white text-xl mb-7">{photographer.category}</p>
            <h2 className="font-normal text-white text-[80px] leading-none tracking-[-0.15em]">
              {photographer.name}
            </h2>
          </div>
        </div>

        {/* ---------- Нижній суцільний чорний блок ---------- */}
        <div className="absolute inset-x-0 bottom-0 h-[40%] bg-black"></div>

        {/* ---------- Блок для біографії ---------- */}
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