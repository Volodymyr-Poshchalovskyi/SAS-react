// src/Pages/ProjectPage.jsx

import React, { useLayoutEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productionData } from '../Data/ProductionData';
import { tableTopData } from '../Data/TableTopData';
import { featureProjectData } from '../Data/FeatureProjectData';
import HlsVideoPlayer from '../Components/HlsVideoPlayer';

const shuffleArray = (array) => {
  // ... (код шафла без змін)
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

export default function ProjectPage() {
  const { projectSlug } = useParams();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const projectData = useMemo(() => {
    // 1. Пошук в Production
    const productionProject = productionData.find(
      (p) => p.projectSlug === projectSlug
    );
    if (productionProject) {
      return {
        ...productionProject,
        videoSrc: productionProject.src,
        preview_src: productionProject.preview_src,
        relatedProjects: shuffleArray(
          productionData.filter((p) => p.projectSlug !== projectSlug)
        )
          .slice(0, 4)
          .map((p) => ({
            slug: p.projectSlug,
            title: p.title,
            subtitle: 'Service',
            videoSrc: p.src,
            previewSrc: p.preview_src,
          })),
        type: 'production',
      };
    }

    // 2. Пошук в TableTop
    const tableTopProject = tableTopData.find(
      (p) => p.projectSlug === projectSlug
    );
    if (tableTopProject) {
      return {
        ...tableTopProject,
        videoSrc: tableTopProject.src,
        preview_src: tableTopProject.preview_src,
        relatedProjects: shuffleArray(
          tableTopData.filter((p) => p.projectSlug !== projectSlug)
        )
          .slice(0, 4)
          .map((p) => ({
            slug: p.projectSlug,
            title: p.title,
            subtitle: 'Table Top',
            videoSrc: p.src,
            previewSrc: p.preview_src,
          })),
        type: 'table-top',
      };
    }

    // 3. Пошук в FeatureProject
    const featureProject =
      featureProjectData.projectSlug === projectSlug
        ? featureProjectData
        : null;

    if (featureProject) {
      return {
        ...featureProject,
        videoSrc: featureProject.src,
        preview_src: featureProject.preview_src,
        relatedProjects: [],
        type: 'feature',
      };
    }

    return null;
  }, [projectSlug]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [projectSlug]);

  if (!projectData) {
    // ... (код "Project Not Found" без змін)
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        {' '}
        <h2 className="text-4xl font-chanel">Project Not Found</h2>{' '}
      </div>
    );
  }

  return (
    <div className="bg-white text-black">
      <section className="relative w-full h-screen bg-black">
        {projectData.videoSrc && (
          <HlsVideoPlayer
            key={projectSlug}
            src={`${CDN_BASE_URL}/${projectData.videoSrc}`}
            previewSrc={
              projectData.preview_src
                ? `${CDN_BASE_URL}/${projectData.preview_src}`
                : ''
            }
            shouldPlay={true}
            startTime={0}
            isMuted={false}
            volume={0.5}
          />
        )}
      </section>
      <section className="w-full px-8 py-16 md:py-24">
        <div>
          {/* ... (код опису проекту) */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-chanel uppercase tracking-tight mb-8">
              {projectData.title}
            </h1>
            <div className="font-helvetica text-sm uppercase tracking-wider space-y-2 mb-8">
              
              {/* ▼▼▼ ДОДАНО: Відображення клієнта (якщо він є) ▼▼▼ */}
              {projectData.client && (
                <p>
                  <span className="font-semibold">CLIENT:</span>{' '}
                  {projectData.client}
                </p>
              )}
              {/* ▲▲▲ КІНЕЦЬ ЗМІНИ ▲▲▲ */}

              <p>
                <span className="font-semibold">FEATURING:</span>{' '}
                {projectData.featuring}
              </p>
              <p>
                <span className="font-semibold">DIRECTOR:</span>{' '}
                {projectData.director}
              </p>
              <p>
                <span className="font-semibold">EXECUTIVE PRODUCERS:</span>{' '}
                {projectData.executiveProducers}
              </p>
            </div>
            <p className="font-helvetica text-base leading-relaxed">
              {projectData.description}
            </p>
          </div>
          {/* ... (кінець коду опису) */}

          {/* ... (код "Related Projects" без змін) */}
          {projectData.relatedProjects &&
            projectData.relatedProjects.length > 0 && (
              <div className="mt-16 md:mt-24">
                <h2 className="font-chanel text-2xl uppercase mb-8">
                  Related Projects
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {projectData.relatedProjects.map((related, index) => (
                    <Link
                      key={index}
                      to={`/projects/${related.slug}`}
                      className="group"
                      onMouseEnter={() => setHoveredIndex(index)}
                      onMouseLeave={() => setHoveredIndex(null)}
                    >
                      <div className="relative aspect-[3/4] overflow-hidden">
                        {related.videoSrc ? (
                          <HlsVideoPlayer
                            src={`${CDN_BASE_URL}/${related.videoSrc}`}
                            previewSrc={
                              related.previewSrc
                                ? `${CDN_BASE_URL}/${related.previewSrc}`
                                : ''
                            }
                            shouldPlay={hoveredIndex === index}
                            isMuted={true}
                            isLooped={true}
                            startTime={0}
                            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4 text-white">
                          <p className="font-chanel text-sm uppercase">
                            {related.title}
                          </p>
                          <p className="font-helvetica text-xs uppercase">
                            {related.subtitle}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
        </div>
      </section>
    </div>
  );
}