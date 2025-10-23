// src/Pages/Team.js

// ! React & Router Imports
import React, { useState, useLayoutEffect, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom'; // * To get headerHeight

// ! Third-party Libraries
import { motion, AnimatePresence } from 'framer-motion'; // * For animations
import { X } from 'lucide-react'; // * Close icon

// ! Local Imports (Components, Context, Data, Assets)
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext'; // * Preloader context
import { teamData, contactDetails, salesContacts } from '../Data/TeamData'; // * Static data
import sinnersLogoBlack from '../assets/Logo/Sinners logo black.png'; // * Logo for modal

// ========================================================================== //
// ! ANIMATION VARIANTS
// ========================================================================== //

// * Animation for the main page title (e.g., "MEET THE TEAM")
const titleAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.4, ease: 'easeIn' } }, // * Animates out upwards
};

// * Animation for the content sections (TeamGrid, ContactInfoSection)
const contentAnimation = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.6, delay: 0.2 } }, // * Fade in with a slight delay
  exit: { opacity: 0, transition: { duration: 0.4 } }, // * Fade out
};

// ========================================================================== //
// ! TAB DATA
// ========================================================================== //

// * Configuration for the tabs (Team, Contact)
const tabsData = [
  { id: 'team', label: 'TEAM', title: 'MEET THE TEAM' },
  { id: 'contact', label: 'CONTACT', title: 'CONNECT WITH US' },
];

// ========================================================================== //
// ! HELPER COMPONENT: TeamMemberModal
// ========================================================================== //

/**
 * ? TeamMemberModal
 * Displays a full-screen modal with details about a team member.
 * Includes dynamic font sizing for the name and smooth animations.
 */
const TeamMemberModal = ({ member, onClose }) => {
  const nameRef = useRef(null); // * Ref for the name element (for font sizing)
  const bioRef = useRef(null); // * Ref for the bio element (optional, for future use)

  // ! Effect: Handle ESC key and body scroll lock
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden'; // * Disable scroll
    return () => { // * Cleanup
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = ''; // * Re-enable scroll
    };
  }, [onClose]);

  // ! Effect: Adjust name font size dynamically
  useLayoutEffect(() => {
    const adjustNameFontSize = () => {
      const element = nameRef.current;
      if (!element) return;
      const container = element.parentElement; // * Assuming parent provides padding
      if (!container) return;

      const containerStyle = window.getComputedStyle(container);
      const paddingLeft = parseFloat(containerStyle.paddingLeft);
      const paddingRight = parseFloat(containerStyle.paddingRight);
      const availableWidth = container.clientWidth - paddingLeft - paddingRight;

      // * Responsive max font size
      const maxFontSize = window.innerWidth < 768 ? 60 : 120;
      const minFontSize = 24;

      let currentFontSize = maxFontSize;
      element.style.fontSize = `${currentFontSize}px`;

      // * Reduce font size until it fits
      while (element.scrollWidth > availableWidth && currentFontSize > minFontSize) {
        currentFontSize--;
        element.style.fontSize = `${currentFontSize}px`;
      }
    };
    adjustNameFontSize(); // * Run on mount
    window.addEventListener('resize', adjustNameFontSize); // * Run on resize
    return () => window.removeEventListener('resize', adjustNameFontSize); // * Cleanup listener
  }, [member]); // * Rerun if member changes (unlikely while modal is open)

  // ! Modal Animation Variants
  const modalVariants = {
    hidden: { x: '-100%', opacity: 0.8 },
    visible: { x: '0%', opacity: 1, transition: { duration: 0.5, ease: [0.25, 1, 0.5, 1] } },
    exit: { x: '-100%', opacity: 0.8, transition: { duration: 0.4, ease: [0.5, 0, 0.75, 0] } },
  };

  return (
    // * Backdrop
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-start bg-black/70"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose} // * Close on backdrop click
    >
      {/* // * Modal Content */}
      <motion.div
        className="w-[90vw] h-full bg-white text-black shadow-2xl flex flex-col"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={(e) => e.stopPropagation()} // * Prevent closing on content click
      >
        {/* Header */}
        <header className="flex-shrink-0 p-8 grid grid-cols-3 items-center z-20">
          <div /> {/* Spacer */}
          <img src={sinnersLogoBlack} alt="Sinners and Saints Logo" className="h-6 justify-self-center" />
          <button onClick={onClose} className="text-black hover:opacity-70 transition-opacity justify-self-end" aria-label="Close member details">
            <X size={32} />
          </button>
        </header>

        {/* Body */}
        <div className="flex-grow flex flex-col px-8 md:px-16 pb-[70px] overflow-hidden min-h-0">
          {/* Name */}
          <h1
            ref={nameRef}
            className="flex-shrink-0 text-center font-chanel font-semibold uppercase mb-9 leading-none"
            style={{ whiteSpace: 'nowrap' }} // Keep on one line for sizing
          >
            {member.firstName} {member.lastName}
          </h1>
          {/* Photo & Bio Container */}
          <div className="flex-grow flex flex-col lg:flex-row gap-12 lg:gap-16 min-h-0">
            {/* Photo Column (Desktop) */}
            <div className="hidden lg:block w-full lg:w-2/5 flex-shrink-0">
              {member.photoSrc ? (
                <img
                  src={member.photoSrc} // * Assuming photoSrc is the full URL or needs CDN_BASE_URL prefix if it's just a path
                  alt={`${member.firstName} ${member.lastName}`}
                  className="w-full aspect-square object-cover" // Maintain aspect ratio
                />
              ) : (
                <div className="w-full aspect-square bg-gray-200" /> // Placeholder
              )}
            </div>
            {/* Bio Column */}
            <div className="w-full lg:w-3/5 flex flex-col min-h-0">
              {/* Role/Title */}
              <h2 className="text-xl md:text-2xl font-bold uppercase mb-4 flex-shrink-0">
                {member.role}
              </h2>
              {/* Bio Text (Scrollable) */}
              <p
                ref={bioRef}
                className="text-sm leading-relaxed whitespace-pre-line text-left lg:text-justify flex-grow overflow-y-auto pb-5 pr-1" // Allow scroll, preserve line breaks
              >
                {member.bio}
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ========================================================================== //
// ! HELPER COMPONENT: TeamGrid
// ========================================================================== //

/**
 * ? TeamGrid Component
 * Displays the team members in an alternating image/text grid layout.
 */
const TeamGrid = ({ teamMembers, onSelectMember }) => {
  return (
    <motion.div
      variants={contentAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-white text-black"
    >
      <div>
        {teamMembers.map((member, index) => {
          // * Determine if the layout should be reversed (image on right) for this row
          const isReversed = index % 2 !== 0;
          return (
            // * Grid layout, 1 column on mobile, 2 on desktop
            <div key={member.id} className="grid grid-cols-1 md:grid-cols-2">
              {/* Image Container */}
              <div
                className={`w-full h-[100vw] md:h-[50vw] ${ // * Full width viewport height on mobile, 50% viewport width on desktop
                  isReversed ? 'md:order-last' : '' // * Change order on desktop for alternating layout
                }`}
              >
                {member.photoSrc ? (
                  <img
                    src={member.photoSrc} // * Assuming photoSrc is the full URL
                    alt={`${member.firstName} ${member.lastName}`}
                    className="w-full h-full object-cover" // * Cover ensures image fills container
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" /> // * Placeholder
                )}
              </div>
              {/* Text Content Container */}
              <div className="w-full flex flex-col items-center justify-center text-center p-8">
                <p className="text-sm uppercase tracking-[0.2em] mb-3 text-gray-500"> {/* Added text-gray-500 */}
                  {member.category}
                </p>
                <h2 className="text-4xl font-chanel font-semibold uppercase mb-6">{`${member.firstName} ${member.lastName}`}</h2>
                {/* "See More" Button to open the modal */}
                <button
                  onClick={() => onSelectMember(member)}
                  className="px-6 py-2 border border-black text-xs font-semibold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                  aria-label={`See more about ${member.firstName} ${member.lastName}`}
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

// ========================================================================== //
// ! HELPER COMPONENT: ContactInfoSection
// ========================================================================== //

/**
 * ? ContactInfoSection Component
 * Displays contact details and sales representative information.
 */
const ContactInfoSection = () => {
  return (
    <motion.div
      variants={contentAnimation}
      initial="initial"
      animate="animate"
      exit="exit"
      className="bg-white text-black"
    >
      <div className="max-w-2xl mx-auto text-center pt-12 pb-20 px-4">
        {/* General Contact Details */}
        {contactDetails.map((item) => (
          <div key={item.label} className="mb-10">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-black mb-2">
              {item.label}
            </h3>
            <div className="text-lg tracking-wider font-normal text-gray-700"> {/* Adjusted text color */}
              {/* Handle potential array values (like address) */}
              {Array.isArray(item.value) ? (
                item.value.map((line, index) => <p key={index}>{line}</p>)
              ) : (
                <p>{item.value}</p>
              )}
            </div>
          </div>
        ))}

        <hr className="my-12 border-gray-300 w-full mx-auto" /> {/* Adjusted border color */}

        {/* Sales Contacts Section */}
        <h2 className="text-3xl sm:text-4xl font-chanel font-semibold uppercase tracking-[0.15em] mb-12">
          SALES
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8 text-left md:text-center"> {/* Aligned text */}
          {salesContacts.map((contact) => (
            <div key={contact.name}>
              <h3 className="text-base font-semibold tracking-[0.2em] uppercase"> {/* Made uppercase */}
                {contact.name}
              </h3>
              <p className="text-xs tracking-[0.2em] text-gray-500 mt-1 uppercase"> {/* Made uppercase */}
                {contact.role}
              </p>
              {/* // ? Add email/phone here if available in data */}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ========================================================================== //
// ! MAIN COMPONENT: Team Page
// ========================================================================== //

export default function Team() {
  // ! State & Context
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation(); // * Preloader state
  const [activeTab, setActiveTab] = useState(tabsData[0].id); // * Current active tab ('team' or 'contact')
  const [selectedMember, setSelectedMember] = useState(null); // * Holds data for the modal, null if closed
  const { headerHeight } = useOutletContext(); // * Get measured header height from Layout

  // ! Effects

  // * Effect: Scroll to top on mount
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // * Effect: Disable body scroll when preloader or modal is active
  useEffect(() => {
    document.body.style.overflow = (isPreloaderActive || selectedMember) ? 'hidden' : '';
    // * Cleanup function
    return () => { document.body.style.overflow = ''; };
  }, [isPreloaderActive, selectedMember]); // * Re-run if either state changes

  // ! Event Handlers
  const handleBannerAnimationComplete = () => setIsPreloaderActive(false);
  const handleOpenModal = (member) => setSelectedMember(member);
  const handleCloseModal = () => setSelectedMember(null);

  // ! Data & Variables
  const bannerTitle = 'VISIONARY STORYTELLERS. COMMERCIAL REBELS. GLOBAL CREATORS.'; // * Reused banner content
  const bannerDescription = 'From award-winning filmmakers to fashion-forward image makers, our directors and hybrid talent deliver world-class content across commercials, music videos, branded series, and global campaigns.';
  const currentTabData = tabsData.find((tab) => tab.id === activeTab) || tabsData[0]; // * Get data for the active tab
  // * Calculate top padding dynamically based on header height, with a fallback
  const topPadding = headerHeight !== null ? `${headerHeight}px` : '150px'; // * Use 150px as a fallback

  // ! Render Logic
  return (
    <div className="bg-white">
      {/* --- Preloader Banner --- */}
      <AnimatePresence>
        {isPreloaderActive && (
          <PreloaderBanner
            onAnimationComplete={handleBannerAnimationComplete}
            title={bannerTitle}
            description={bannerDescription}
          />
        )}
      </AnimatePresence>

      {/* --- Team Member Bio Modal --- */}
      <AnimatePresence>
        {selectedMember && (
          <TeamMemberModal member={selectedMember} onClose={handleCloseModal} />
        )}
      </AnimatePresence>

      {/* --- Page Header (Tabs & Title) --- */}
      <header className="bg-white pb-16 text-center sticky top-0 z-50" // * Make header sticky
              style={{ paddingTop: topPadding }}> {/* // * Apply dynamic top padding */}
        <div className="max-w-7xl mx-auto px-4">
          {/* Tab Navigation */}
          <nav className="flex items-center justify-center">
            <div className="flex space-x-6 sm:space-x-10 border-b border-gray-300">
              {tabsData.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative w-28 sm:w-32 py-4 text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300 focus:outline-none ${ // * Responsive width
                    activeTab === tab.id
                      ? 'text-black' // * Active tab style
                      : 'text-gray-500 hover:text-black' // * Inactive tab style
                  }`}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.label}
                  {/* // * Animated underline for active tab */}
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-black"
                      layoutId="underline" // * layoutId enables animation between tabs
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }} // * Spring animation
                    />
                  )}
                </button>
              ))}
            </div>
          </nav>

          {/* Animated Page Title */}
          <div className="mt-12 h-16"> {/* // * Set fixed height to prevent layout shift */}
            <AnimatePresence mode="wait"> {/* // * 'wait' ensures exit animation completes before enter */}
              <motion.h1
                key={activeTab} // * Key change triggers animation
                className="text-black text-4xl sm:text-5xl md:text-6xl font-chanel font-semibold uppercase px-4"
                variants={titleAnimation}
                initial="hidden"
                animate={!isPreloaderActive ? 'visible' : 'hidden'} // * Animate only after preloader
                exit="exit"
              >
                {currentTabData.title}
              </motion.h1>
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* --- Main Content Area --- */}
      <main>
        <AnimatePresence mode="wait">
          {/* // * Conditionally render TeamGrid or ContactInfoSection based on activeTab */}
          {activeTab === 'team' ? (
            <TeamGrid
              key="team-content" // * Key for AnimatePresence
              teamMembers={teamData}
              onSelectMember={handleOpenModal} // * Pass modal open handler
            />
          ) : (
            <ContactInfoSection key="contact-content" /> // * Key for AnimatePresence
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}