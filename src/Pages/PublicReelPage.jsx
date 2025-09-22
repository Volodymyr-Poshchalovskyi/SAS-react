// src/Pages/PublicReelPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// --- Static Assets ---
const videoPath = '/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4';
import gridPreviewPhoto from '../assets/Photos/DirectorPhoto.png';
import directorPhoto from '../assets/Photos/Director.jpg';

// --- Mock Data ---
const mockReelData = {
  id: 'some-unique-id',
  reelTitle: 'TITLE OF A REEL',
  clientName: 'CLIENT NAME',
  spotName: 'TITLE NAME - SPOT NAME',
  directorName: 'JESSY TERRERO',
  directorBio: `Is a Dominican-American director, producer, and founder of the production company Cinema Giants. With a career spanning over two decades, he has become one of the most influential music video directors in Latin and American culture. Terrero has directed iconic music videos for global superstars including 50 Cent, Jennifer Lopez, Maluma, Bad Bunny, Daddy Yankee, and J Balvin-collectively earning billions of views and redefining the aesthetic of contemporary music visuals. He made his feature film debut with the cult comedy Soul Plane (2004), and later directed the crime drama Freelancers (2012), starring Robert De Niro and Forest Whitaker. His television work includes the Netflix biopic series Nicky Jam: El Ganador and the YouTube Originals documentary Maluma: Lo que era, lo que soy, lo que seré. Through Cinema Giants, Terrero champions Latinx storytelling across film, TV, and branded content, pushing boundaries while uplifting diverse voices and cultures.`,
  heroVideos: [
    { id: 1, src: videoPath },
    { id: 2, src: videoPath },
    { id: 3, src: videoPath },
    { id: 4, src: videoPath },
  ],
  workGrid: [
    { id: 1, client: 'CLIENT NAME', spot: 'TITLE NAME - SPOT NAME', preview: gridPreviewPhoto },
    { id: 2, client: 'CLIENT NAME', spot: 'TITLE NAME - SPOT NAME', preview: gridPreviewPhoto },
    { id: 3, client: 'CLIENT NAME', spot: 'TITLE NAME - SPOT NAME', preview: gridPreviewPhoto },
    { id: 4, client: 'CLIENT NAME', spot: 'TITLE NAME - SPOT NAME', preview: gridPreviewPhoto },
    { id: 5, client: 'CLIENT NAME', spot: 'TITLE NAME - SPOT NAME', preview: gridPreviewPhoto },
    { id: 6, client: 'CLIENT NAME', spot: 'TITLE NAME - SPOT NAME', preview: gridPreviewPhoto },
  ],
};

// --- Helper Components ---
const SliderArrow = ({ direction, onClick }) => (
    <button
      onClick={onClick}
      className={`absolute top-1/2 -translate-y-1/2 z-20 text-white transition-opacity hover:opacity-70 ${
        direction === 'left' ? 'left-4 md:left-8' : 'right-4 md:right-8'
      }`}
      aria-label={direction === 'left' ? 'Previous Slide' : 'Next Slide'}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-14 md:w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        {direction === 'left' ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
        )}
      </svg>
    </button>
  );

// --- Main Page Component ---
export default function PublicReelPage() {
    const { reelId } = useParams();
    const [data, setData] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
  
    useEffect(() => {
      console.log('Fetching data for reelId:', reelId);
      setData(mockReelData);
      window.scrollTo(0, 0);
    }, [reelId]);
  
    if (!data) {
      return <div className="h-screen w-full bg-white dark:bg-black flex items-center justify-center text-black dark:text-white">Loading...</div>;
    }
    
    const hasMultipleSlides = data.heroVideos.length > 1;
  
    const nextSlide = () => setCurrentSlide((prev) => (prev === data.heroVideos.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? data.heroVideos.length - 1 : prev - 1));
    
    return (
      <div className="bg-white dark:bg-black text-black dark:text-white">
        {/* 1. Hero Section with Video Slider */}
        <section className="relative w-full h-screen overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.video
              key={currentSlide}
              src={data.heroVideos[currentSlide].src}
              autoPlay
              loop
              muted
              playsInline
              className="absolute top-0 left-0 w-full h-full object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </AnimatePresence>
  
          <div className="absolute inset-0 bg-black bg-opacity-30" />
          {hasMultipleSlides && <SliderArrow direction="left" onClick={prevSlide} />}
          {hasMultipleSlides && <SliderArrow direction="right" onClick={nextSlide} />}
  
          <div className="absolute inset-0 text-white pointer-events-none">
            {/* ✨ Змінено: Центральний заголовок - змінено позицію та стиль */}
            <div className="w-full h-full flex justify-center items-start pt-[15vh]">
              <h1 className="text-3xl md:text-4xl font-bold uppercase font-montserrat text-center [text-shadow:0_2px_6px_rgb(0_0_0_/_0.6)] tracking-widest md:tracking-[0.2em]">
                {data.reelTitle}
              </h1>
            </div>

            {/* Інформація зліва знизу */}
            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 font-montserrat [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">
                {/* ✨ Змінено: збільшено розмір шрифту */}
                <p className="text-xl md:text-2xl font-semibold">{data.clientName}</p>
                <p className="text-md md:text-lg opacity-80">{data.spotName}</p>
            </div>

            {/* Інформація справа знизу */}
            <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 font-montserrat text-right [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">
                <p className="text-sm md:text-md uppercase opacity-80">Director</p>
                <p className="text-lg md:text-xl font-semibold">{data.directorName}</p>
            </div>
          </div>
        </section>
  
        {/* 2. Work Grid Section */}
        <section className="pt-20 pb-10 md:pt-32 md:pb-16 px-6 lg:px-8 bg-white dark:bg-black">
          <div className="max-w-screen-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold uppercase mb-16 text-center md:text-left font-montserrat">Work</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {data.workGrid.map((item) => (
                <div key={item.id} className="group relative cursor-pointer overflow-hidden">
                  <img src={item.preview} alt={`${item.client} - ${item.spot}`} className="w-full h-auto object-cover aspect-video transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute top-0 left-0 p-4 w-full">
                      <p className="font-semibold text-base text-white uppercase font-montserrat [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">{item.client}</p>
                      <p className="text-xs text-white/90 uppercase font-montserrat [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">{item.spot}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* 3. Director Bio Section */}
        <section className="pt-10 pb-20 md:pt-16 md:pb-32 px-8 sm:px-12 lg:px-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
              <div className="md:col-span-1">
                  <img src={directorPhoto} alt={data.directorName} className="w-full h-auto object-cover" />
              </div>
              <div className="md:col-span-1 flex flex-col">
                  <h2 className="text-3xl md:text-4xl font-bold uppercase mb-6 font-montserrat">{data.directorName}</h2>
                  <p className="font-semibold text-base leading-[28.4px] tracking-[-0.09em] text-[#1D1D1D] dark:text-white/90">
                    {data.directorBio}
                  </p>
              </div>
          </div>
        </section>
      </div>
    );
  }