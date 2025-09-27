// src/pages/Team.js

import React, {useState, useLayoutEffect, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import { X } from 'lucide-react';
import placeholderPhoto from '../assets/Photos/Director.jpg';

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
  { id: 'team', label: 'TEAM', title: 'MEET THE TEAM' },
  { id: 'contact', label: 'CONTACT', title: 'CONTACT' },
];

// --- Плейсхолдери ---
const teamMembersData = Array.from({ length: 5 }, (_, i) => ({
  id: i + 1,
  name: `JANETTE BECKMAN ${i + 1}`,
  category: 'MUSIC & CULTURE',
  bio: 'IS A DOMINICAN-AMERICAN DIRECTOR, PRODUCER, AND FOUNDER OF THE PRODUCTION COMPANY CINEMA GIANTS. WITH A CAREER SPANNING OVER TWO DECADES, HE HAS BECOME ONE OF THE MOST INFLUENTIAL VISUAL STORYTELLERS IN LATIN AND URBAN MUSIC CULTURE. TERERO HAS DIRECTED ICONIC MUSIC VIDEOS FOR GLOBAL SUPERSTARS INCLUDING 50 CENT, JENNIFER LOPEZ, MALUMA, BAD BUNNY, DADDY YANKEE, AND J BALVIN—COLLECTIVELY EARNING BILLIONS OF VIEWS AND REDEFINING THE AESTHETIC OF CONTEMPORARY MUSIC VISUALS.\n\nHE MADE HIS FEATURE FILM DEBUT WITH THE CULT COMEDY SOUL PLANE (2004), AND LATER DIRECTED THE CRIME DRAMA FREELANCERS (2012), STARRING ROBERT DE NIRO AND FOREST WHITAKER. HIS TELEVISION WORK INCLUDES THE NETFLIX BIOPIC SERIES NICKY JAM: EL GANADOR AND THE YOUTUBE ORIGINALS DOCUMENTARY MALUMA: LO QUE ERA, LO QUE SOY, LO QUE SERÉ.\n\nTHROUGH CINEMA GIANTS, TERRERO CHAMPIONS LATINX STORYTELLING ACROSS FILM, TV, AND BRANDED CONTENT, PUSHING BOUNDARIES WHILE UPLIFTING DIVERSE VOICES AND CULTURES.',
}));

// ===================================
// ✨ MODIFIED: Модальне вікно учасника команди
// ===================================
const TeamMemberModal = ({ member, onClose }) => {
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const modalVariants = {
    hidden: { x: '-100%', opacity: 0.8 },
    visible: { x: '0%', opacity: 1, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } },
    exit: { x: '-100%', opacity: 0.8, transition: { duration: 0.4, ease: [0.5, 0, 0.75, 0] } },
  };

  return (
    // --- ЗМІНЕНО: justify-start та z-[100] для перекриття хедера ---
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-start bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* --- ЗМІНЕНО: w-[90vw], max-w-screen-xl та h-full --- */}
      <motion.div
        className="relative w-[90vw] max-w-screen-xl h-full bg-white dark:bg-black text-black dark:text-white shadow-2xl flex"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <button
  onClick={onClose}
  className="absolute top-[120px] right-[10px] z-10 text-black dark:text-white hover:opacity-70 transition-opacity"
  aria-label="Close"
>
          <X size={32} />
        </button>

        {/* --- ЗМІНЕНО: overflow-y-auto для внутрішнього скролу --- */}
        <div className="w-full h-full flex flex-col md:flex-row items-center p-8 md:p-16 overflow-y-auto">
          <div className="w-full md:w-2/5 flex-shrink-0 mb-8 md:mb-0 md:mr-16">
            <h1 className="text-4xl lg:text-6xl font-chanel font-semibold uppercase mb-8 leading-none">
              {member.name}
            </h1>
            <img
              src={placeholderPhoto}
              alt={member.name}
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="w-full md:w-3/5">
            <h2 className="text-lg font-semibold uppercase tracking-widest mb-4">
              CO-FOUNDER/CEO
            </h2>
            <p className="text-base leading-relaxed whitespace-pre-line">
              {member.bio}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};


// ===================================
// Сітка з учасниками команди
// ===================================
const TeamGrid = ({ onSelectMember }) => {
  return (
    <motion.div
      variants={contentAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-white dark:bg-black text-black dark:text-white"
    >
      <div className="max-w-7xl mx-auto py-20 px-4 space-y-24">
        {teamMembersData.map((member, index) => {
          const isReversed = index % 2 !== 0;
          return (
            <div
              key={member.id}
              className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center"
            >
              <div className={`w-full ${isReversed ? 'md:order-last' : ''}`}>
                <img
                  src={placeholderPhoto}
                  alt={member.name}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-sm uppercase tracking-[0.2em] mb-3">{member.category}</p>
                <h2 className="text-4xl font-chanel font-semibold uppercase mb-6">{member.name}</h2>
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
            <div className="text-lg tracking-wider">
              {Array.isArray(item.value) ? (
                item.value.map((line, index) => <p key={index}>{line}</p>)
              ) : (
                <p>{item.value}</p>
              )}
            </div>
          </div>
        ))}
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


// ===================================
// ГОЛОВНИЙ КОМПОНЕНТ СТОРІНКИ
// ===================================
export default function Team() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();
  const [activeTab, setActiveTab] = useState(tabsData[0].id);
  const [selectedMember, setSelectedMember] = useState(null);

  useLayoutEffect(() => { window.scrollTo(0, 0); }, []);
  useEffect(() => {
    document.body.style.overflow = isPreloaderActive || selectedMember ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isPreloaderActive, selectedMember]);

  const handleBannerAnimationComplete = () => setIsPreloaderActive(false);
  
  const handleOpenModal = (member) => setSelectedMember(member);
  const handleCloseModal = () => setSelectedMember(null);

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
      
      <AnimatePresence>
        {selectedMember && (
          <TeamMemberModal member={selectedMember} onClose={handleCloseModal} />
        )}
      </AnimatePresence>


      <header className="bg-white dark:bg-black pt-[150px] pb-16 text-center">
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
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>
          </nav>

          <div className="mt-12">
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
             <TeamGrid key="team-content" onSelectMember={handleOpenModal} />
          ) : (
            <ContactInfoSection key="contact-content" />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}