import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// --- Static Assets (для заглушки) ---
import directorPhoto from '../assets/Photos/Director.jpg';

// --- Компоненти, що залишилися без змін ---
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

// --- Основний компонент сторінки ---
export default function PublicReelPage() {
    const { reelId } = useParams(); // Отримуємо short_link з URL
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(0);
  
    useEffect(() => {
      const fetchReelData = async () => {
        if (!reelId) return;
        setLoading(true);
        setError(null);
        try {
          const response = await fetch(`http://localhost:3001/reels/public/${reelId}`);
          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.details || 'Reel not found or is not active.');
          }
          const reelData = await response.json();
          setData(reelData);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchReelData();
      window.scrollTo(0, 0);
    }, [reelId]);
  
    // --- Обробка станів завантаження та помилок ---
    if (loading) {
      return <div className="h-screen w-full bg-white dark:bg-black flex items-center justify-center text-black dark:text-white">Loading...</div>;
    }
    if (error) {
        return <div className="h-screen w-full bg-white dark:bg-black flex items-center justify-center text-red-500 text-center p-8">Error: {error}</div>;
    }

    // ✨ --- НОВИЙ ЗАХИСНИЙ БЛОК --- ✨
    // Перевіряємо, чи існують дані та чи є в них медіа-айтеми
    if (!data || !data.mediaItems || data.mediaItems.length === 0) {
        return (
            <div className="h-screen w-full bg-white dark:bg-black flex flex-col items-center justify-center text-center p-8">
                <h1 className="text-3xl font-bold text-black dark:text-white mb-4">Reel is Empty</h1>
                <p className="text-slate-500 dark:text-slate-400">This reel does not contain any videos or may have been deleted.</p>
            </div>
        );
    }
    
    // --- Логіка слайдера ---
    const hasMultipleSlides = data.mediaItems.length > 1;
    const nextSlide = () => setCurrentSlide((prev) => (prev === data.mediaItems.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? data.mediaItems.length - 1 : prev - 1));
    
    const currentMediaItem = data.mediaItems[currentSlide];

    // Додаткова перевірка на випадок асинхронних проблем
    if (!currentMediaItem) {
        return <div className="h-screen w-full bg-white dark:bg-black flex items-center justify-center text-black dark:text-white">Loading media...</div>;
    }

    return (
      <div className="bg-white dark:bg-black text-black dark:text-white">
        {/* 1. Hero Section with Video Slider */}
        <section className="relative w-full h-screen overflow-hidden">
          <AnimatePresence initial={false}>
            <motion.video
              key={currentSlide}
              src={currentMediaItem.videoUrl}
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
            <div className="w-full h-full flex justify-center items-start pt-[15vh]">
              <h1 className="text-3xl md:text-4xl font-bold uppercase font-montserrat text-center [text-shadow:0_2px_6px_rgb(0_0_0_/_0.6)] tracking-widest md:tracking-[0.2em]">
                {data.reelTitle}
              </h1>
            </div>

            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 font-montserrat [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">
                <p className="text-xl md:text-2xl font-semibold">{currentMediaItem.client || 'Client Name'}</p>
                <p className="text-md md:text-lg opacity-80">{currentMediaItem.title || 'Spot Name'}</p>
            </div>

            <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 font-montserrat text-right [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">
                <p className="text-sm md:text-md uppercase opacity-80">Artist</p>
                <p className="text-lg md:text-xl font-semibold">{currentMediaItem.artists || 'Artist Name'}</p>
            </div>
          </div>
        </section>
  
        {/* 2. Work Grid Section */}
        <section className="pt-20 pb-10 md:pt-32 md:pb-16 px-6 lg:px-8 bg-white dark:bg-black">
          <div className="max-w-screen-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold uppercase mb-16 text-center md:text-left font-montserrat">Work</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {data.mediaItems.map((item) => (
                <div key={item.id} className="group relative cursor-pointer overflow-hidden">
                  <img src={item.previewUrl} alt={`${item.client} - ${item.title}`} className="w-full h-auto object-cover aspect-video transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute top-0 left-0 p-4 w-full">
                      <p className="font-semibold text-base text-white uppercase font-montserrat [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">{item.client || 'Client Name'}</p>
                      <p className="text-xs text-white/90 uppercase font-montserrat [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">{item.title || 'Spot Name'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
  
        {/* 3. Director Bio Section (Заглушка, як ви просили) */}
        <section className="pt-10 pb-20 md:pt-16 md:pb-32 px-8 sm:px-12 lg:px-16 bg-white dark:bg-black">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
              <div className="md-col-span-1">
                  <img src={directorPhoto} alt="Director Name" className="w-full h-auto object-cover" />
              </div>
              <div className="md-col-span-1 flex flex-col">
                  <h2 className="text-3xl md:text-4xl font-bold uppercase mb-6 font-montserrat">JESSY TERRERO</h2>
                  <p className="font-semibold text-base leading-[28.4px] tracking-[-0.09em] text-[#1D1D1D] dark:text-white/90">
                    Is a Dominican-American director, producer, and founder of the production company Cinema Giants. With a career spanning over two decades, he has become one of the most influential music video directors in Latin and American culture. Terrero has directed iconic music videos for global superstars...
                  </p>
              </div>
          </div>
        </section>
      </div>
    );
  }