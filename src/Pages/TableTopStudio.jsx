import React from 'react';
import { Link } from 'react-router-dom';
import VideoContainer from '../Components/VideoContainer';

const videoURL = '/video/SHOWREEL SINNERS AND SAINTS 2024_1.mp4';

const TableTopStudio = () => {
  return (
    <div className="bg-white text-black min-h-screen pt-36">
      <h1 className="text-center text-4xl md:text-5xl font-semibold text-black py-12 uppercase tracking-wider">
        TABLE TOP DIVISION
      </h1>

      <div className="relative w-full h-screen bg-black">
        <VideoContainer videoSrc={videoURL} shouldPlay={true} />
      </div>

      <div className="w-full bg-gray-100 flex items-center justify-center text-center py-24 px-8">
        <div className="max-w-3xl">
          <p className="text-base text-black font-semibold uppercase">
            HERE WILL BE LITTLE INFORMATION ABOUT STUDIO SPACE AND ECT...
          </p>
        </div>
      </div>

      {[...Array(2)].map((_, index) => (
        <div key={index} className="relative w-full h-screen bg-black">
          <VideoContainer videoSrc={videoURL} shouldPlay={true} />
          <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full text-center">
            <h1 className="text-white font-chanel font-normal uppercase text-4xl sm:text-6xl md:text-[5rem] tracking-[-0.3rem] md:tracking-[-0.6rem] mb-8">
              SUPERNOVA
            </h1>
            <Link to="/table-top-studio-projects">
              <button
                className="py-3 px-8 text-xs font-normal bg-white text-black border-2 border-white 
                               hover:bg-transparent hover:text-white transition-colors duration-300"
              >
                SEE MORE
              </button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableTopStudio;