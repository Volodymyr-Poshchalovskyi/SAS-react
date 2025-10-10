// src/pages/Team.js

import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
// ✨ КРОК 1: Імпортуємо useOutletContext для доступу до даних з Layout
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import { X } from 'lucide-react';
import { teamData } from '../Data/TeamData';
import sinnersLogoBlack from '../assets/Logo/Sinners logo black.png';

// --- Анімації (без змін) ---
const titleAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.4, ease: 'easeIn' } },
};

const contentAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, delay: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

// --- Дані для вкладок (без змін) ---
const tabsData = [
  { id: 'team', label: 'TEAM', title: 'MEET THE TEAM' },
  { id: 'contact', label: 'CONTACT', title: 'CONNECT WITH US' },
];

// ===================================
// ✨ ОНОВЛЕНО: Модальне вікно учасника команди
// ===================================
// ===================================
// ✨ ОНОВЛЕНО: Модальне вікно учасника команди (з подвійним регулюванням шрифтів)
// ===================================
const TeamMemberModal = ({ member, onClose }) => {
  // Створюємо refs для імені та біографії
  const nameRef = useRef(null);
  const bioRef = useRef(null); // ✨ НОВИЙ REF

  // Ефект для закриття модалки і блокування скролу (без змін)
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // ✨ ОНОВЛЕНИЙ ЕФЕКТ: Динамічно змінює розмір шрифту імені
  useLayoutEffect(() => {
    const adjustNameFontSize = () => {
      const element = nameRef.current;
      if (!element) return;
      const container = element.parentElement;
      if (!container) return;

      const containerStyle = window.getComputedStyle(container);
      const paddingLeft = parseFloat(containerStyle.paddingLeft);
      const paddingRight = parseFloat(containerStyle.paddingRight);
      const availableWidth = container.clientWidth - paddingLeft - paddingRight;

      const maxFontSize = window.innerWidth < 768 ? 60 : 120;
      const minFontSize = 24;
      let currentFontSize = maxFontSize;
      element.style.fontSize = `${currentFontSize}px`;

      while (
        element.scrollWidth > availableWidth && // ✨ ВИПРАВЛЕНА УМОВА
        currentFontSize > minFontSize
      ) {
        currentFontSize--;
        element.style.fontSize = `${currentFontSize}px`;
      }
    };
    adjustNameFontSize();
    window.addEventListener('resize', adjustNameFontSize);
    return () => window.removeEventListener('resize', adjustNameFontSize);
  }, [member]);

  // ✨ НОВИЙ ЕФЕКТ: Динамічно змінює розмір шрифту біографії
  useLayoutEffect(() => {
    const adjustBioFontSize = () => {
      const element = bioRef.current;
      if (!element) return;
      
      // Скидаємо стиль, щоб правильно розрахувати початкову висоту
      element.style.fontSize = '';
      const initialFontSize = parseFloat(window.getComputedStyle(element).fontSize);
      let currentFontSize = initialFontSize;
      const minFontSize = 10; // Мінімальний розмір шрифту для біографії

      // Зменшуємо шрифт, поки висота контенту більша за висоту блоку
      while (
        element.scrollHeight > element.clientHeight &&
        currentFontSize > minFontSize
      ) {
        currentFontSize -= 0.5; // Зменшуємо плавно
        element.style.fontSize = `${currentFontSize}px`;
      }
    };
    adjustBioFontSize();
    window.addEventListener('resize', adjustBioFontSize);
    return () => window.removeEventListener('resize', adjustBioFontSize);
  }, [member]);

  const modalVariants = {
    hidden: { x: '-100%', opacity: 0.8 },
    visible: {
      x: '0%',
      opacity: 1,
      transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] },
    },
    exit: {
      x: '-100%',
      opacity: 0.8,
      transition: { duration: 0.4, ease: [0.5, 0, 0.75, 0] },
    },
  };

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-start bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-[90vw] h-full bg-white dark:bg-black text-black dark:text-white shadow-2xl flex flex-col"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex-shrink-0 p-8 grid grid-cols-3 items-center z-20">
          <div />
          <img
            src={sinnersLogoBlack}
            alt="Sinners and Saints Logo"
            className="h-6 justify-self-center"
          />
          <button
            onClick={onClose}
            className="text-black dark:text-white hover:opacity-70 transition-opacity justify-self-end"
            aria-label="Close"
          >
            <X size={32} />
          </button>
        </header>

        <div className="flex-grow flex flex-col px-8 md:px-16 pb-12 overflow-hidden">
          <h1
            ref={nameRef}
            className="flex-shrink-0 text-center font-chanel font-semibold uppercase mb-9 -mt-5 leading-none"
            style={{ whiteSpace: 'nowrap' }}
          >
            {member.firstName} {member.lastName}
          </h1>
          <div className="flex-grow flex flex-col md:flex-row gap-12 md:gap-16 min-h-0">
            <div className="w-full md:w-2/5 flex-shrink-0">
              {member.photoSrc ? (
                <img
                  src={member.photoSrc}
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-full aspect-square object-cover"
                />
              ) : (
                <div className="w-full aspect-square bg-gray-200 dark:bg-gray-800" />
              )}
            </div>
            <div className="w-full md:w-3/5 flex flex-col justify-center">
              <div>
                <h2 className="text-3xl font-bold uppercase tracking-widest mb-4">
                  {member.role}
                </h2>
                {/* ✨ ЗМІНЕНО: Додано ref та прибрано overflow-y-auto */}
                <p
                  ref={bioRef}
                  className="text-base leading-relaxed whitespace-pre-line max-h-[40vh] md:max-h-full"
                >
                  {member.bio}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


// ===================================
// Сітка з учасниками команди (без змін)
// ===================================
const TeamGrid = ({ teamMembers, onSelectMember }) => {
  return (
    <motion.div
      variants={contentAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-white dark:bg-black text-black dark:text-white"
    >
      <div>
        {teamMembers.map((member, index) => {
          const isReversed = index % 2 !== 0;
          return (
            <div key={member.id} className="grid grid-cols-1 md:grid-cols-2">
              <div
                className={`w-full h-[50vw] ${
                  isReversed ? 'md:order-last' : ''
                }`}
              >
                {member.photoSrc ? (
                  <img
                    src={member.photoSrc}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-800" />
                )}
              </div>
              <div className="w-full flex flex-col items-center justify-center text-center p-8">
                <p className="text-sm uppercase tracking-[0.2em] mb-3">
                  {member.category}
                </p>
                <h2 className="text-4xl font-chanel font-semibold uppercase mb-6">{`${member.firstName} ${member.lastName}`}</h2>
                <button
                  onClick={() => onSelectMember(member)}
                  className="px-6 py-2 border border-black dark:border-white text-xs font-semibold uppercase tracking-widest hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                >
                  See More
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

// ===================================
// Компонент секції контактів (без змін)
// ===================================
const ContactInfoSection = () => {
  const contactDetails = [
    { label: 'PHONE', value: '+1 (000) 123-4567' },
    {
      label: 'ADDRESS',
      value: ['7080 Hollywood Boulevard, LOS ANGELES,', 'CA 90028'],
    },
    { label: 'EMAIL', value: 'ROST@SINNERSANDSAINTS.LA' },
    {
      label: 'FACILITIES / OFFICES',
      value: [
        'MAIN CAMPUS – LUX ANGELES STUDIOS',
        'TUNNEL POST ANNEX – SANTA MONICA',
      ],
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
      <div className="max-w-2xl mx-auto text-center pt-12 pb-20 px-4">
        {contactDetails.map((item) => (
          <div key={item.label} className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black dark:text-white mb-2">
              {item.label}
            </h3>
            <div className="text-lg tracking-wider font-normal">
              {Array.isArray(item.value) ? (
                item.value.map((line, index) => <p key={index}>{line}</p>)
              ) : (
                <p>{item.value}</p>
              )}
            </div>
          </div>
        ))}
        <hr className="my-12 border-black dark:border-gray-700 w-full mx-auto" />
        <h2 className="text-4xl font-chanel font-semibold uppercase tracking-[0.15em] mb-12">
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

// ===================================
// ✨ ОНОВЛЕНО: ГОЛОВНИЙ КОМПОНЕНТ СТОРІНКИ
// ===================================
export default function Team() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();
  const [activeTab, setActiveTab] = useState(tabsData[0].id);
  const [selectedMember, setSelectedMember] = useState(null);

  // ✨ КРОК 2: Отримуємо висоту хедера з контексту
  const { headerHeight } = useOutletContext();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      isPreloaderActive || selectedMember ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreloaderActive, selectedMember]);

  const handleBannerAnimationComplete = () => setIsPreloaderActive(false);
  const handleOpenModal = (member) => setSelectedMember(member);
  const handleCloseModal = () => setSelectedMember(null);

  const bannerTitle =
    'VISIONARY STORYTELLERS. COMMERCIAL REBELS. GLOBAL CREATORS.';
  const bannerDescription =
    'From award-winning filmmakers to fashion-forward image makers, our directors and hybrid talent deliver world-class content across commercials, music videos, branded series, and global campaigns.';

  const currentTabData = tabsData.find((tab) => tab.id === activeTab);
  
  // ✨ КРОК 3: Розраховуємо загальний відступ. До висоти хедера додаємо невеликий проміжок (24px).
  // Надаємо запасний варіант (150px) на випадок, якщо headerHeight ще не визначено.
  const topPadding = headerHeight ? `${headerHeight}px` : '150px';

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

      <AnimatePresence>
        {selectedMember && (
          <TeamMemberModal
            member={selectedMember}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>

      {/* ✨ КРОК 4: Замінюємо клас pt-[150px] на динамічний стиль */}
      <header
        className="bg-white dark:bg-black pb-16 text-center"
        style={{ paddingTop: topPadding }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center justify-center">
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
                      transition={{
                        type: 'spring',
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </nav>

          <div className="mt-12"> {/* Додано невеликий відступ для заголовка */}
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

      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'team' ? (
            <TeamGrid
              key="team-content"
              teamMembers={teamData}
              onSelectMember={handleOpenModal}
            />
          ) : (
            <ContactInfoSection key="contact-content" />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}