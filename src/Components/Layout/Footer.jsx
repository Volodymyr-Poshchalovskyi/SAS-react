import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import certifiedLogo from '../../assets/Logo/certified.jpg';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 font-sans">
      {/* ✨ 1. Зменшено горизонтальний padding для мобільних (px-6),
             повернено px-16 для великих екранів (lg:) */}
      <div className="max-w-screen-2xl mx-auto px-6 lg:px-16">
        
        {/* ✨ 2. Головний контейнер тепер адаптивний:
               - По дефолту: flex-col (стек), items-center (центрування) і gap-6
               - На lg: повертається до flex-row та justify-between */}
        <div className="relative border-t border-gray-800 py-6 flex flex-col lg:flex-row justify-between items-center gap-6 lg:gap-8">
          
          {/* --- Ліва частина: Іконки соцмереж --- */}
          {/* На мобільному цей блок буде першим у стеку і відцентрованим */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-5 text-lg">
              <a
                href="#"
                aria-label="Facebook"
                className="hover:text-white transition-colors"
              >
                <FaFacebookF />
              </a>
              <a
                href="#"
                aria-label="Instagram"
                className="hover:text-white transition-colors"
              >
                <FaInstagram />
              </a>
              <a
                href="#"
                aria-label="LinkedIn"
                className="hover:text-white transition-colors"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>

          {/* --- Центральна частина: Логотип --- */}
          {/* ✨ 3. Позиціонування логотипу тепер адаптивне:
                 - По дефолту: звичайний елемент (другий у стеку)
                 - На lg: стає absolute (як було), щоб ідеально центруватись */}
          <div className="lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2">
            <img
              src={certifiedLogo}
              alt="Certified WBENC"
              className="h-8 w-auto filter grayscale brightness-150"
            />
          </div>

          {/* --- Права частина: Копірайт та посилання --- */}
          {/* ✨ 4. Блок копірайту тепер також адаптивний:
                 - По дефолту: flex-col, items-center (текст і посилання одне під одним)
                 - На lg: повертається до flex-row і text-right */}
          <div className="text-xs uppercase tracking-wider text-center lg:text-right flex flex-col items-center lg:flex-row gap-2 lg:gap-0">
            <span>© 2025 SINNERS AND SAINTS LLC. ALL RIGHTS RESERVED.</span>

            {/* ✨ 5. Відступ ml-6 застосовується тільки на lg екранах */}
            <Link
              to="/privacy-policy"
              className="lg:ml-6 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}