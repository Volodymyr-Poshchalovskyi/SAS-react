import React, { useLayoutEffect, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PreloaderBanner from '../Components/PreloaderBanner';
import { useAnimation } from '../context/AnimationContext';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import bicPdf from '../assets/pdf/BIC_ChrisSims_SNS_12.pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

const nameAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut' },
  },
};

// --- Анімація для слайдера ---
const sliderVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
  exit: (direction) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 0,
    transition: { duration: 0.4, ease: 'easeIn' },
  }),
};


export default function Feature() {
  const { isPreloaderActive, setIsPreloaderActive } = useAnimation();
  const [numPages, setNumPages] = useState(null);
  
  // 1. Стан для поточної сторінки та напрямку анімації
  const [[currentPage, direction], setCurrentPage] = useState([1, 0]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  // 2. Функції для навігації
  const paginate = (newDirection) => {
    // Перевірка, щоб не вийти за межі документа
    if (currentPage + newDirection > 0 && currentPage + newDirection <= numPages) {
      setCurrentPage([currentPage + newDirection, newDirection]);
    }
  };

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isPreloaderActive ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPreloaderActive]);
  
  const bannerTitle = 'From Script to Screen.';
  const bannerDescription =
    'Our feature film division specializes in packaging commercially viable projects with top-tier talent, financing strategies, and distribution plans. Whether building a festival hit or a streamer-ready series, we develop narratives with lasting impact.';

  const featureTitle = 'FEATURE FILMS & DOCUMENTARIES';

  return (
      <div className="bg-gray-100">
          <AnimatePresence>
              {isPreloaderActive && (
                  <PreloaderBanner
                      onAnimationComplete={() => setIsPreloaderActive(false)}
                      title={bannerTitle}
                      description={bannerDescription}
                  />
              )}
          </AnimatePresence>

          <div className="w-full min-h-screen flex flex-col items-center pt-[140px] px-4 pb-12">
              <motion.h1
                  className="text-black font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] transition-opacity duration-500 hover:opacity-50 text-center mb-12"
                  variants={nameAnimation}
                  initial="hidden"
                  animate={!isPreloaderActive ? 'visible' : 'hidden'}
              >
                  {featureTitle}
              </motion.h1>
              
              {/* --- 3. Контейнер для слайдера PDF --- */}
              <motion.div
                  className="w-full max-w-4xl" // Задає максимальну ширину
                  initial={{ opacity: 0 }}
                  animate={{ opacity: !isPreloaderActive ? 1 : 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
              >
                  <Document file={bicPdf} onLoadSuccess={onDocumentLoadSuccess}>
                      {/* --- 4. Контейнер для самої сторінки, щоб приховати те, що виходить за межі --- */}
                      <div className="relative overflow-hidden w-full shadow-lg" style={{ height: '70vh' }}>
                        <AnimatePresence initial={false} custom={direction}>
                            <motion.div
                                key={currentPage}
                                custom={direction}
                                variants={sliderVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="absolute top-0 left-0 w-full h-full"
                            >
                                {/* Рендеримо тільки поточну сторінку */}
                                <Page
                                    pageNumber={currentPage}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    // робимо сторінку адаптивною
                                    width={document.querySelector('.overflow-hidden')?.clientWidth} 
                                />
                            </motion.div>
                        </AnimatePresence>
                      </div>
                  </Document>

                  {/* --- 5. Навігація та лічильник сторінок --- */}
                  {numPages && (
                      <div className="flex items-center justify-center mt-4 gap-4">
                          <button 
                              onClick={() => paginate(-1)} 
                              disabled={currentPage <= 1}
                              className="px-4 py-2 bg-black text-white rounded-md disabled:bg-gray-400 transition-colors"
                          >
                              Previous
                          </button>
                          <p className="text-lg font-semibold">
                              Page {currentPage} of {numPages}
                          </p>
                          <button 
                              onClick={() => paginate(1)} 
                              disabled={currentPage >= numPages}
                              className="px-4 py-2 bg-black text-white rounded-md disabled:bg-gray-400 transition-colors"
                          >
                              Next
                          </button>
                      </div>
                  )}

              </motion.div>
          </div>
      </div>
  );
}