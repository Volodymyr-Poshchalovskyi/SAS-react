// src/Pages/ProjectPage.jsx

import React, { useLayoutEffect, useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productionData } from '../Data/ProductionData';
// ✨ Зміни тут: імпортуємо дані для Table Top
import { tableTopData } from '../Data/TableTopData';
import VideoContainer from '../Components/VideoContainer';

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

  const projectData = useMemo(() => {
    // 1. Шукаємо проєкт в productionData
    const productionProject = productionData.find((p) => p.projectSlug === projectSlug);
    if (productionProject) {
      return {
        slug: productionProject.projectSlug,
        title: productionProject.title,
        videoSrc: productionProject.src,
        featuring: 'Placeholder Artist',
        director: 'Placeholder Director',
        executiveProducers: 'Placeholder Producer',
        description: 'This is a placeholder description for the project. Detailed information will be available soon.',
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

    // ✨ Зміни тут: якщо не знайшли, шукаємо в tableTopData
    const tableTopProject = tableTopData.find((p) => p.projectSlug === projectSlug);
    if (tableTopProject) {
      return {
        slug: tableTopProject.projectSlug,
        title: tableTopProject.title,
        videoSrc: tableTopProject.src,
        featuring: 'Placeholder Artist',
        director: 'Placeholder Director',
        executiveProducers: 'Placeholder Producer',
        description: 'This is a placeholder description for the Table Top project.',
        // Схожі проєкти беремо з tableTopData
        relatedProjects: shuffleArray(
          tableTopData.filter(p => p.projectSlug !== projectSlug)
        ).slice(0, 4).map(p => ({
          slug: p.projectSlug,
          title: p.title,
          subtitle: 'Table Top', // Вказуємо правильний тип
          preview: p.src
        })),
        type: 'table-top'
      };
    }

    return null;
  }, [projectSlug]);

  // Логіка завантаження URL (без змін, вона універсальна)
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

  // ... решта коду ProjectPage залишається без змін ...
  // (useLayoutEffect, JSX-розмітка і т.д.)
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [projectSlug]);

  if (!projectData) {
    return ( <div className="bg-black text-white min-h-screen flex items-center justify-center"> <h2 className="text-4xl font-chanel">Project Not Found</h2> </div> );
  }

  return (
    <div className="bg-white text-black">
      <section className="relative w-full h-screen bg-black">
        {signedUrls[projectData.videoSrc] && ( <VideoContainer videoSrc={signedUrls[projectData.videoSrc]} shouldPlay={true} /> )}
      </section>
      <section className="w-full px-8 py-16 md:py-24">
        <div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-chanel uppercase tracking-tight mb-8">{projectData.title}</h1>
            <div className="font-helvetica text-sm uppercase tracking-wider space-y-2 mb-8">
              <p><span className="font-semibold">FEATURING:</span> {projectData.featuring}</p>
              <p><span className="font-semibold">DIRECTOR:</span> {projectData.director}</p>
              <p><span className="font-semibold">EXECUTIVE PRODUCERS:</span> {projectData.executiveProducers}</p>
            </div>
            <p className="font-helvetica text-base leading-relaxed">{projectData.description}</p>
          </div>
          {projectData.relatedProjects && projectData.relatedProjects.length > 0 && (
            <div className="mt-16 md:mt-24">
              <h2 className="font-chanel text-2xl uppercase mb-8">Related Projects</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {projectData.relatedProjects.map((related, index) => (
                  <Link key={index} to={`/projects/${related.slug}`} className="group">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {signedUrls[related.preview] ? ( <video src={signedUrls[related.preview]} muted playsInline className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"/> ) : ( <div className="w-full h-full bg-gray-200 animate-pulse"></div> )}
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