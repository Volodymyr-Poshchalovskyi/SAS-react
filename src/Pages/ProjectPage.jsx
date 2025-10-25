// src/Pages/ProjectPage.jsx

// ! React & Router Imports
import React, { useLayoutEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

// ! Data Imports
import { productionData } from '../Data/ProductionData';
import { tableTopData } from '../Data/TableTopData';
import { featureProjectData } from '../Data/FeatureProjectData';

// ! Component Imports
import HlsVideoPlayer from '../Components/HlsVideoPlayer';

// ========================================================================== //
// ! HELPER FUNCTIONS & CONSTANTS
// ========================================================================== //

/**
 * ? Shuffles an array in place using the Fisher-Yates algorithm.
 * @param {Array} array - The array to shuffle.
 * @returns {Array} A new shuffled array.
 */
const shuffleArray = (array) => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]]; // Swap elements
  }
  return newArr;
};

// * Base URL for accessing media assets stored on Google Cloud Storage
const CDN_BASE_URL = 'https://storage.googleapis.com/new-sas-media-storage';

// ========================================================================== //
// ! MAIN COMPONENT: ProjectPage
// ========================================================================== //

/**
 * ? ProjectPage Component
 * Displays detailed information about a specific project (Production, TableTop, or Feature).
 * Fetches data based on the URL slug, shows a main video, project details,
 * and a list of related projects.
 */
export default function ProjectPage() {
  // ! Hooks
  const { projectSlug } = useParams(); // * Get the project slug from the URL parameters

  // ! State
  // * Tracks which related project thumbnail is currently hovered (for video playback)
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // ! Memoized Data Retrieval
  // * useMemo efficiently finds the correct project data based on the slug
  // * It searches across different data sources (Production, TableTop, Feature)
  // * and formats the data consistently, including shuffling related projects.
  const projectData = useMemo(() => {
    // * 1. Search in Production Data
    const productionProject = productionData.find((p) => p.projectSlug === projectSlug);
    if (productionProject) {
      return {
        ...productionProject,
        videoSrc: productionProject.src, // * Alias 'src' for clarity
        preview_src: productionProject.preview_src,
        // * Find, shuffle, and slice related projects from the same category
        relatedProjects: shuffleArray(
          productionData.filter((p) => p.projectSlug !== projectSlug) // * Exclude current project
        ).slice(0, 4) // * Limit to 4 related projects
         .map((p) => ({ // * Format related project data
            slug: p.projectSlug,
            title: p.title,
            client: p.client, // * Pass client name
            videoSrc: p.src,
            previewSrc: p.preview_src,
          })),
        type: 'production', // * Identify the project type
      };
    }

    // * 2. Search in TableTop Data (if not found in Production)
    const tableTopProject = tableTopData.find((p) => p.projectSlug === projectSlug);
    if (tableTopProject) {
      return {
        ...tableTopProject,
        videoSrc: tableTopProject.src,
        preview_src: tableTopProject.preview_src,
        relatedProjects: shuffleArray(
          tableTopData.filter((p) => p.projectSlug !== projectSlug)
        ).slice(0, 4)
         .map((p) => ({
            slug: p.projectSlug,
            title: p.title,
            client: p.client, // * Pass client name
            videoSrc: p.src,
            previewSrc: p.preview_src,
          })),
        type: 'table-top',
      };
    }

    // * 3. Search in Feature Project Data (specific check)
    const featureProject = featureProjectData.projectSlug === projectSlug ? featureProjectData : null;
    if (featureProject) {
      // * Feature projects might have a different structure or fixed related projects/description
      return {
        ...featureProject,
        videoSrc: featureProject.src, // 💡 ЗМІНА: Використовуємо featureProject.src
    preview_src: featureProject.preview_src,
        relatedProjects: [], // * Feature page currently shows no related projects
        type: 'feature',
        // * Hardcoded description specific to the feature project 'Ride'
        description:
          'Ride (2012) is an American short music film directed by Anthony Mandler and written by Lana Del Rey. Starring Del Rey as Artist, the story follows a woman who leaves behind her privileged life to join a biker gang, seeking freedom, identity, and a sense of belonging. Blending cinematic storytelling with the visual language of music videos, the film serves as a companion piece to Del Rey’s song of the same name from her Paradise EP. Through evocative imagery and intimate voiceovers, Ride explores themes of desire, rebellion, and self-discovery.\n\nPremiering at the Aero Theater in Santa Monica, California on October 10, 2012, and released globally on VEVO two days later, Ride was distributed by Black Hand Cinema. The film earned mixed-to-positive reviews—praised for Del Rey’s haunting performance, poetic narration, and visual ambition—while also sparking controversy for its portrayal of prostitution, adultery, gun violence, and cultural appropriation.',
      };
    }

    // * 4. Return null if project not found in any data source
    return null;
  }, [projectSlug]); // * Recalculate only when the projectSlug changes

  // ! Effects

  // * Effect: Scroll to top when the page loads or the project slug changes
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [projectSlug]); // * Dependency ensures scroll reset on navigation to a different project

  // ! Render Logic

  // * Handle "Project Not Found" case
  if (!projectData) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <h2 className="text-4xl font-chanel">Project Not Found</h2>
        {/* // ? Consider adding a Link back to a relevant listing page */}
      </div>
    );
  }

  // * Main Page Render
  return (
    <div className="bg-white text-black">
      {/* --- Section 1: Main Video Player --- */}
      <section className="relative w-full h-screen bg-black">
        {/* // * Render HLS player if video source exists */}
        {projectData.videoSrc && (
          <HlsVideoPlayer
            key={projectSlug} // * Force re-mount on slug change
            src={`${CDN_BASE_URL}/${projectData.videoSrc}`}
            previewSrc={projectData.preview_src ? `${CDN_BASE_URL}/${projectData.preview_src}` : ''}
            shouldPlay={true} // * Autoplay the main video
            startTime={projectData.startTime || 0} // * Use specified start time or default to 0
            isMuted={false} // * Play with sound
            volume={0.5} // * Set initial volume
            isLooped={false} // * Don't loop the main project video
            controls // * Show native controls for the main video
          />
        )}
        {/* // ? Could add an overlay here if needed, similar to Production page */}
      </section>

      {/* --- Section 2: Project Details & Related Projects --- */}
      <section className="w-full px-8 py-16 md:py-24">
        {/* // * Inner container for content */}
        <div>
          {/* --- Project Description --- */}
          <div>
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl font-chanel uppercase tracking-tight mb-8">
              {projectData.title}
            </h1>
            {/* Metadata (Client, Featuring, Director, Producer) */}
            <div className="font-helvetica text-sm uppercase tracking-wider space-y-2 mb-8">
              {projectData.client && (
                <p><span className="font-semibold">CLIENT:</span> {projectData.client}</p>
              )}
              {projectData.featuring && ( // * Check if 'featuring' exists
                <p><span className="font-semibold">FEATURING:</span> {projectData.featuring}</p>
              )}
              {projectData.director && ( // * Check if 'director' exists
                <p><span className="font-semibold">DIRECTOR:</span> {projectData.director}</p>
              )}
              {projectData.executiveProducers && ( // * Check if 'executiveProducers' exists
                 <p>
                   {/* // * Dynamically change label based on project type */}
                   <span className="font-semibold">{projectData.type === 'feature' ? 'PRODUCER:' : 'EXECUTIVE PRODUCER:'}</span>
                   {' '}{projectData.executiveProducers}
                 </p>
              )}
               {/* // ? Add other metadata fields here if needed (e.g., DP, Editor) */}
            </div>

            {/* Description Text */}
            {/* // * Splits the description string by double newlines to create paragraphs */}
            <div className="font-helvetica text-base leading-relaxed space-y-4">
              {projectData.description && typeof projectData.description === 'string'
                 ? projectData.description.split('\n\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                   ))
                 : <p>No description available.</p> // * Fallback if description is missing/not string
              }
            </div>
          </div>

          {/* --- Related Projects Section --- */}
          {/* // * Render only if relatedProjects array exists and is not empty */}
          {projectData.relatedProjects && projectData.relatedProjects.length > 0 && (
              <div className="mt-16 md:mt-24">
                <h2 className="font-chanel text-2xl uppercase mb-8">Related Projects</h2>
                {/* // * Responsive grid for related project thumbnails */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  {projectData.relatedProjects.map((related, index) => (
                    <Link
                      key={index}
                      to={`/projects/${related.slug}`} // * Link to the related project's page
                      className="group" // * Group class for hover effects
                      onMouseEnter={() => setHoveredIndex(index)} // * Set hovered state for video playback
                      onMouseLeave={() => setHoveredIndex(null)} // * Clear hovered state
                    >
                      <div className="relative aspect-[3/4] overflow-hidden"> {/* // * Aspect ratio container */}
                        {/* // * Render HLS player for video preview on hover */}
                        {related.videoSrc ? (
                          <HlsVideoPlayer
                            src={`${CDN_BASE_URL}/${related.videoSrc}`}
                            previewSrc={related.previewSrc ? `${CDN_BASE_URL}/${related.previewSrc}` : ''}
                            shouldPlay={hoveredIndex === index} // * Play only when hovered
                            isMuted={true} // * Mute preview videos
                            isLooped={true} // * Loop preview videos
                            startTime={0} // * Start previews from beginning
                            // * Apply scale effect on hover using group-hover
                            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                          />
                        ) : (
                          // * Placeholder if video source is missing
                          <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                        )}
                        {/* // * Gradient overlay for text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                        {/* // * Text overlay (Title & Client) */}
                        <div className="absolute bottom-0 left-0 p-4 text-white">
                          <p className="font-chanel text-sm uppercase">{related.title}</p>
                          <p className="font-helvetica text-xs uppercase">{related.client}</p>
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