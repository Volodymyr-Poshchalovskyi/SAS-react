// src/Pages/ProjectPage.jsx

import React, { useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { originalsData } from '../Data/OriginalsData';
import VideoContainer from '../Components/VideoContainer';

export default function ProjectPage() {
  const { projectSlug } = useParams();
  const project = originalsData.find((p) => p.slug === projectSlug);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [projectSlug]);

  if (!project) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <h2 className="text-4xl font-chanel">Project Not Found</h2>
      </div>
    );
  }

  return (
    <div className="bg-white text-black">
      {/* Main Video Section (без змін, вже на всю ширину) */}
      <section className="relative w-full h-[85vh] bg-black">
        <VideoContainer videoSrc={project.videoSrc} shouldPlay={true} />
      </section>

      {/* --- Зміни тут --- */}
      {/* Project Details Section */}
      {/* Видалено max-w-7xl, mx-auto. Залишено тільки вертикальні та мінімальні горизонтальні відступи */}
      <section className="w-full px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto"> {/* Цей div тепер єдиний, що контролює ширину контенту */}
          <h1 className="text-4xl sm:text-5xl font-chanel uppercase tracking-tight mb-8">
            {project.title}
          </h1>
          <div className="font-helvetica text-sm uppercase tracking-wider space-y-2 mb-8">
            <p>
              <span className="font-semibold">FEATURING:</span> {project.featuring}
            </p>
            <p>
              <span className="font-semibold">DIRECTOR:</span> {project.director}
            </p>
            <p>
              <span className="font-semibold">EXECUTIVE PRODUCERS:</span>{' '}
              {project.executiveProducers}
            </p>
          </div>
          <p className="font-helvetica text-base leading-relaxed">
            {project.description}
          </p>
        </div>
      </section>

      {/* --- І тут --- */}
      {/* Related Projects Section */}
      {project.relatedProjects && project.relatedProjects.length > 0 && (
        /* Видалено max-w-7xl, mx-auto. */
        <section className="w-full px-8 pb-16 md:pb-24">
          <div className="max-w-4xl mx-auto"> {/* Аналогічно, цей div контролює ширину */}
            <h2 className="font-chanel text-2xl uppercase mb-8">
              Related Projects
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {project.relatedProjects.map((related, index) => (
                <Link key={index} to={`/projects/${related.slug}`} className="group">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={related.preview}
                      alt={related.title}
                      className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-4 text-white">
                      <p className="font-chanel text-sm uppercase">{related.title}</p>
                      <p className="font-helvetica text-xs uppercase">{related.subtitle}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}