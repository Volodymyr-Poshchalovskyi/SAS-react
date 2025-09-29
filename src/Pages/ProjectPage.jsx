// src/Pages/ProjectPage.jsx

import React, { useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productionData } from '../Data/ProductionData';
import VideoContainer from '../Components/VideoContainer';

// Функція для перемішування масиву (без змін)
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

export default function ProjectPage() {
  const { projectSlug } = useParams();
  const [signedUrls, setSignedUrls] = useState({});

  // Логіка пошуку проєкту (без змін)
  const projectData = useMemo(() => {
    const productionProject = productionData.find((p) => p.projectSlug === projectSlug);
    if (productionProject) {
      return {
        slug: productionProject.projectSlug,
        title: productionProject.title,
        videoSrc: productionProject.src,
        featuring: 'Placeholder Artist',
        director: 'Placeholder Director',
        executiveProducers: 'Placeholder Producer',
        description: 'This is a placeholder description for the project. Detailed information will be available soon. The focus of this work was on delivering exceptional visual quality and brand messaging.',
        relatedProjects: shuffleArray(
          productionData.filter(p => p.projectSlug !== projectSlug)
        ).slice(0, 4).map(p => ({
          slug: p.projectSlug,
          title: p.title,
          subtitle: 'Service',
          preview: p.src
        })),
        type: 'production'
      };
    }
    return null;
  }, [projectSlug]);

  // Логіка завантаження URL (без змін)
  useEffect(() => {
    const fetchUrls = async () => {
      if (!projectData) return;
      const pathsToSign = [projectData.videoSrc];
      if (projectData.relatedProjects && projectData.relatedProjects.length > 0) {
        projectData.relatedProjects.forEach(p => {
          if (!pathsToSign.includes(p.preview)) {
            pathsToSign.push(p.preview);
          }
        });
      }
      try {
        const response = await fetch('http://localhost:3001/generate-read-urls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gcsPaths: pathsToSign }),
        });
        if (!response.ok) throw new Error('Failed to fetch signed URLs');
        setSignedUrls(await response.json());
      } catch (error) {
        console.error('Error fetching URLs for ProjectPage:', error);
      }
    };
    fetchUrls();
  }, [projectData]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [projectSlug]);

  if (!projectData) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <h2 className="text-4xl font-chanel">Project Not Found</h2>
      </div>
    );
  }

  return (
    <div className="bg-white text-black">
      <section className="relative w-full h-screen bg-black">
        {signedUrls[projectData.videoSrc] && (
          <VideoContainer videoSrc={signedUrls[projectData.videoSrc]} shouldPlay={true} />
        )}
      </section>

      {/* ✨ Зміни тут: секція тепер без обмежень по ширині */}
      <section className="w-full px-8 py-16 md:py-24">
        {/* З цього div видалено класи max-w-7xl та mx-auto */}
        <div>
          
          {/* Блок з деталями проєкту */}
          <div>
            <h1 className="text-4xl sm:text-5xl font-chanel uppercase tracking-tight mb-8">
              {projectData.title}
            </h1>
            <div className="font-helvetica text-sm uppercase tracking-wider space-y-2 mb-8">
              <p><span className="font-semibold">FEATURING:</span> {projectData.featuring}</p>
              <p><span className="font-semibold">DIRECTOR:</span> {projectData.director}</p>
              <p><span className="font-semibold">EXECUTIVE PRODUCERS:</span> {projectData.executiveProducers}</p>
            </div>
            {/* З параграфа видалено клас max-w-4xl */}
            <p className="font-helvetica text-base leading-relaxed">
              {projectData.description}
            </p>
          </div>

          {/* Блок зі схожими проєктами */}
          {projectData.relatedProjects && projectData.relatedProjects.length > 0 && (
            <div className="mt-16 md:mt-24">
              <h2 className="font-chanel text-2xl uppercase mb-8">Related Projects</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {projectData.relatedProjects.map((related, index) => (
                  <Link key={index} to={`/projects/${related.slug}`} className="group">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {signedUrls[related.preview] ? (
                         <video
                           src={signedUrls[related.preview]}
                           muted
                           playsInline
                           className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                         />
                      ) : (
                        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                      )}
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
          )}

        </div>
      </section>
    </div>
  );
}