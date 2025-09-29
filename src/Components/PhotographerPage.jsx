import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { photographersData } from '../Data/PhotographersData';

export default function PhotographerPage() {
  const { photographerSlug } = useParams();

  const photographer = photographersData.find(
    (p) => p.slug === photographerSlug
  );

  const galleryImages = Array(8).fill(photographer?.coverImage);

  const sliderRef = useRef(null);
  const collageSectionRef = useRef(null);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const collageImagesData = [
    { width: 411, height: 732, left: 120, top: 2256 },
    { width: 363, height: 510, left: 710, top: 2271 },
    { width: 363, height: 491, left: 935, top: 2494 }, // 3-й елемент
    { width: 461, height: 579, left: -55, top: 3240 },
    { width: 585, height: 732, left: 740, top: 3132 },
    { width: 446, height: 448, left: 523, top: 3921 },
    { width: 385, height: 441, left: 15, top: 4446 }, // 7-й елемент
    { width: 343, height: 596, left: 301, top: 4510 }, // 8-й елемент
    { width: 462, height: 580, left: 930, top: 4484 },
  ];

  const topOffset = 2150;

  const containerHeight = Math.max(
    ...collageImagesData.map((img) => img.top - topOffset + img.height)
  );

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
      {/* Секція заголовку */}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
          </div>
          <h1 className="text-[120px] font-chanel font-semibold uppercase text-center px-4 flex-grow">
            {photographer.name}
          </h1>
        </div>
      </section>

      {/* Секція з великим фото */}
      <section className="w-full h-screen">
        <img
          src={photographer.coverImage}
          alt={`Cover for ${photographer.name}`}
          className="w-full h-full object-cover"
        />
      </section>

      {/* Секція: Заголовок та опис 1 */}
      <section className="bg-white py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-[20px] font-semibold uppercase mb-4">
            Lorem Ipsum
          </h2>
          <p className="text-[12px] leading-relaxed text-gray-700 text-justify">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua, et
            quidem faciunt, ut aut reiciendis voluptatibus maiores alias
            consequatur aut perferendis doloribus asperiores repellat. Nam
            libero tempore, cum soluta nobis est eligendi optio cumque nihil
            impedit quo minus id quod maxime placeat facere possimus, omnis
            voluptas assumenda est, omnis dolor repellendus. Temporibus autem
            quibusdam et aut officiis debitis aut rerum necessitatibus saepe
            eveniet ut et voluptates repudiandae sint et molestiae non
            recusandae.
          </p>
        </div>
      </section>

      {/* Секція: Галерея-слайдер */}
      <section className="bg-white pl-2 md:pl-5 overflow-hidden relative group">
        <button
          onClick={handlePrev}
          className="absolute left-5 top-1/2 -translate-y-1/2 z-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Previous image"
        >
          <svg
            className="w-12 h-12 drop-shadow-lg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={handleNext}
          className="absolute right-5 top-1/2 -translate-y-1/2 z-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          aria-label="Next image"
        >
          <svg
            className="w-12 h-12 drop-shadow-lg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
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

      {/* Секція: Колаж з зображень */}
      <section
        ref={collageSectionRef}
        className="w-full bg-white py-[50px] flex justify-center"
      >
        <div
          className="relative"
          style={{
            width: '1440px',
            height: `${containerHeight}px`,
          }}
        >
          {collageImagesData.map((img, index) => {
            if (index === 2 || index === 6) {
              const parallaxStrength = 0.2;
              let backgroundOffsetY = 0;

              if (collageSectionRef.current) {
                const elementTop =
                  collageSectionRef.current.offsetTop + (img.top - topOffset);
                const scrollRelativeToElement = scrollY - elementTop;
                backgroundOffsetY = scrollRelativeToElement * parallaxStrength;
              }
              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    width: `${img.width}px`,
                    height: `${img.height}px`,
                    left: `${img.left}px`,
                    top: `${img.top - topOffset}px`,
                    zIndex: index === 6 ? 2 : 0,
                    backgroundImage: `url(${photographer.coverImage})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundAttachment: 'fixed',
                    backgroundPosition: `center ${backgroundOffsetY}px`,
                  }}
                />
              );
            }
            return (
              <div
                key={index}
                style={{
                  position: 'absolute',
                  width: `${img.width}px`,
                  height: `${img.height}px`,
                  left: `${img.left}px`,
                  top: `${img.top - topOffset}px`,
                  zIndex: index === 7 ? 1 : 0,
                }}
              >
                <img
                  src={photographer.coverImage}
                  alt={`Collage view ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* ✨ НОВА СЕКЦІЯ: Заголовок та опис 2 */}
      <section className="bg-white py-20">
        <div className="max-w-2xl mx-auto text-center px-4">
          <h2 className="text-[20px] font-semibold uppercase mb-4">
            Vestibulum Ante
          </h2>
          <p className="text-[12px] leading-relaxed text-gray-700 text-justify">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem
            accusantium doloremque laudantium, totam rem aperiam, eaque ipsa
            quae ab illo inventore veritatis et quasi architecto beatae vitae
            dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit
            aspernatur aut odit aut fugit, sed quia consequuntur magni dolores
            eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est,
            qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.
          </p>
        </div>
      </section>

      {/* Секція біографії */}
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
