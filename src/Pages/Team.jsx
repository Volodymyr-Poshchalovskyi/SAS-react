// src/pages/Team.js

import React, { useState, useLayoutEffect, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import VideoContainer from '../Components/VideoContainer';

// --- Анімації ---
const titleAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
  exit: { opacity: 0, y: -30, transition: { duration: 0.4, ease: 'easeIn' } },
};

const contentAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, delay: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

// --- Дані для вкладок ---
const tabsData = [
  {
    id: 'team',
    label: 'TEAM',
    title: 'MEET THE SINNERS',
  },
  {
    id: 'contact',
    label: 'CONTACT',
    title: 'CONTACT',
  },
];


const ContactInfoSection = () => {
  const contactDetails = [
    { label: 'PHONE', value: '+1 (000) 123-4567' },
    {
      label: 'ADDRESS',
      value: '1234 SUNSET BOULEVARD, LOS ANGELES, CA 90028',
    },
    { label: 'EMAIL', value: 'CONTACT@SINNERSANDSAINTS.COM' },
    {
      label: 'FACILITIES / OFFICES',
      value: ['MAIN CAMPUS – LUX ANGELES STUDIOS', 'TUNNEL POST ANNEX – SANTA MONICA'],
    },
  ];

  const salesContacts = [
    { name: 'ANN MCCALLIGAT', role: 'EAST COAST SALES' },
    { name: 'ESTELLE LEEDS', role: 'DIRECTOR MANAGEMENT' },
  ];

  return (
    <motion.div
      variants={contentAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-white dark:bg-black text-black dark:text-white"
    >
      <div className="max-w-2xl mx-auto text-center py-20 px-4">
        {contactDetails.map((item) => (
          <div key={item.label} className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black dark:text-white mb-2">
              {item.label}
            </h3>
            {/* ЗМІНЕНО: видалено клас 'font-medium' для зменшення жирності */}
            <div className="text-lg tracking-wider">
              {Array.isArray(item.value) ? (
                item.value.map((line, index) => <p key={index}>{line}</p>)
              ) : (
                <p>{item.value}</p>
              )}
            </div>
          </div>
        ))}

        {/* ЗМІНЕНО: лінія тепер на всю ширину контейнера */}
        <hr className="my-20 border-black dark:border-gray-700 w-full mx-auto" />

        <h2 className="text-3xl font-chanel font-semibold uppercase tracking-[0.15em] mb-14">
          SALES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8">
          {salesContacts.map((contact) => (
            <div key={contact.name}>
              <h3 className="text-base font-semibold tracking-[0.2em]">
                {contact.name}
              </h3>
              <p className="text-xs tracking-[0.2em] text-gray-500 dark:text-gray-400 mt-1">
                {contact.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// === ГОЛОВНИЙ КОМПОНЕНТ СТОРІНКИ ===
export default function Team() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();
  const videoURL = '/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4';
  const [activeTab, setActiveTab] = useState(tabsData[0].id);

  // ... (хуки useEffect та useLayoutEffect залишаються без змін)
  useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isPreloaderActive]);

  const handleBannerAnimationComplete = () => setIsPreloaderActive(false);

  const bannerTitle = 'VISIONARY STORYTELLERS. COMMERCIAL REBELS. GLOBAL CREATORS.';
  const bannerDescription = 'From award-winning filmmakers to fashion-forward image makers, our directors and hybrid talent deliver world-class content across commercials, music videos, branded series, and global campaigns.';

  const currentTabData = tabsData.find((tab) => tab.id === activeTab);

  return (
    <div className="bg-white dark:bg-black">
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            onAnimationComplete={handleBannerAnimationComplete}
            title={bannerTitle}
            description={bannerDescription}
          />
        )}
      </AnimatePresence>

      <header className="bg-white dark:bg-black pt-[150px] pb-16 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center justify-center">
            {/* ... (навігація залишається без змін) */}
            <div className="flex space-x-10 border-b border-gray-300 dark:border-gray-700">
              {tabsData.map((tab) => (
                <button
  key={tab.id}
  onClick={() => setActiveTab(tab.id)}
  className={`relative w-32 py-3 text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300 focus:outline-none ${
    activeTab === tab.id
      ? 'text-black dark:text-white'
      : 'text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white'
  }`}
>
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black dark:bg-white"
                      layoutId="underline"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </nav>

          <div className="mt-12">
            {/* ... (заголовок залишається без змін) */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={activeTab}
                className="text-black dark:text-white text-4xl sm:text-5xl md:text-6xl font-chanel font-semibold uppercase px-4"
                variants={titleAnimation}
                initial="hidden"
                animate={!isPreloaderActive ? 'visible' : 'hidden'}
                exit="exit"
              >
                {currentTabData.title}
              </motion.h1>
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* === ОСНОВНИЙ КОНТЕНТ З УМОВНИМ РЕНДЕРИНГОМ === */}
      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'team' ? (
            <motion.div
              key="team-content"
              variants={contentAnimation}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <div className="relative w-full h-[75vh] overflow-hidden bg-black">
                <VideoContainer
                  videoSrc={videoURL}
                  shouldPlay={!isPreloaderActive}
                />
              </div>
            </motion.div>
          ) : (
            <ContactInfoSection key="contact-content" />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}