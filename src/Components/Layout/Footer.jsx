import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { directorsData } from '../../Data/DirectorsData';
import sinnersLogo from '../../assets/Logo/Sinners logo white.png';

// Динамічні посилання на режисерів
const directorLinks = directorsData.map(director => ({
  text: director.name,
  path: `/directors/${director.slug}`
}));

// Структура футера з клікабельними посиланнями
const footerColumns = [
  {
    title: 'DIRECTORS',
    path: '/directors',
    links: directorLinks,
  },
  {
    title: 'ON ASSIGNMENT',
    path: '/assignment',
    // Оновлений текст в колонці 'ON ASSIGNMENT'
    links: [
      { text: 'AWARDS', path: '/assignment' },
      { text: 'CASE STUDIES', path: '/assignment' },
      { text: 'FEATURES', path: '/assignment' },
      { text: 'NEWS', path: '/assignment' },
      { text: 'PROJECTS', path: '/assignment' },
      { text: 'TESTIMONIALS', path: '/assignment' },
    ],
  },
  {
    title: 'STUDIO LUX',
    // Додаємо шлях для заголовка STUDIO LUX
    path: '/studio',
    subSections: [
      {
        title: 'TABLE TOP DIVISION',
        links: [
          { text: 'Jessy Terrero', path: '/studio' },
          { text: 'Jessy Terrero', path: '/studio' },
          { text: 'Jessy Terrero', path: '/studio' },
          { text: 'Jessy Terrero', path: '/studio' },
          { text: 'Jessy Terrero', path: '/studio' },
        ],
      },
      {
        title: 'POST',
        links: [
          { text: 'Jessy Terrero', path: '/studio' },
          { text: 'Jessy Terrero', path: '/studio' },
          { text: 'Jessy Terrero', path: '/studio' },
          { text: 'Jessy Terrero', path: '/studio' },
          { text: 'Jessy Terrero', path: '/studio' },
        ],
      },
    ],
  },
  {
    title: 'ORIGINALS',
    path: '/originals',
    links: [
      // Виправлено помилку в написанні "SERVICES"
      { text: 'PRODUCTION SERVICES', path: '/production' },
      { text: 'MANAGEMENT', path: '/management' },
      { text: 'FEATURE FILM PACKAGING', path: '/feature' },
      { text: 'TEAM', path: '/team' },
    ],
  },
];

// Компонент одного посилання (не змінено)
const FooterLink = ({ path, text }) => (
  <li>
    <Link to={path} className="font-bold text-white text-sm uppercase tracking-widest hover:underline">
      {text}
    </Link>
  </li>
);

// Компонент секції колонки (оновлений)
const ColumnSection = ({ title, links, path }) => {
  const isOriginals = title === 'ORIGINALS';

  // Єдиний набір класів для заголовка та посилань Originals
  const originalsClasses = 'font-bold text-white text-sm uppercase tracking-widest hover:underline';
  const titleClasses = originalsClasses + ' mb-6';

  // Стандартні класи для інших підрозділів
  const subLinkClasses = 'font-light text-sm text-gray-400 hover:text-white transition-colors';

  return (
    <div className="mb-8">
      {path ? (
        <Link to={path} className={isOriginals ? titleClasses : 'font-bold text-white text-sm uppercase tracking-widest mb-6 hover:underline'}>
          {title}
        </Link>
      ) : (
        <span className="text-xs font-bold uppercase tracking-widest mb-6 block">{title}</span>
      )}
      <ul className={`space-y-3 list-none p-0 m-0 ${isOriginals ? 'mt-4' : ''}`}>
        {links?.map((link, index) => (
          isOriginals ? (
            <li key={index}>
              <Link to={link.path} className={originalsClasses}>
                {link.text}
              </Link>
            </li>
          ) : (
            <li key={index}>
              <Link to={link.path} className={subLinkClasses}>
                {link.text}
              </Link>
            </li>
          )
        ))}
      </ul>
    </div>
  );
};

// Основний футер (не змінено)
export default function Footer() {
  return (
    <footer className="bg-black text-white font-sans h-[90vh]">
      <div className="max-w-screen-2xl mx-auto px-16 h-full flex flex-col">
        
        {/* Лого */}
        <div className="flex justify-center pt-12 pb-8">
          <img src={sinnersLogo} alt="Sinners Logo" className="h-10 w-auto" />
        </div>

        {/* Колонки футера */}
        <div className="my-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-16">
          {footerColumns.map((col, index) => (
            <div key={index}>
              {col.title && (col.links || col.path) && <ColumnSection title={col.title} links={col.links} path={col.path} />}
              {col.subSections?.map((sub, subIndex) => (
                <ColumnSection key={subIndex} title={sub.title} links={sub.links} path={sub.path} />
              ))}
            </div>
          ))}
        </div>
        
        {/* Соцмережі та копірайт */}
        <div className="border-t border-gray-800 py-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-5 text-lg">
              <a href="#" aria-label="Facebook" className="hover:text-gray-300"><FaFacebookF /></a>
              <a href="#" aria-label="Instagram" className="hover:text-gray-300"><FaInstagram /></a>
              <a href="#" aria-label="LinkedIn" className="hover:text-gray-300"><FaLinkedinIn /></a>
            </div>
          </div>
          <div className="text-gray-500 text-xs uppercase tracking-wider text-center md:text-right">
            <span>© 2025 SINNERS AND SAINTS LLC. ALL RIGHTS RESERVED.</span>
            <a href="#" className="ml-6 hover:text-gray-300">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}