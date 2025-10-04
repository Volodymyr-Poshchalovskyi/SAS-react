// src/Data/TeamData.js

/**
 * Data for team members.
 * Note: photoSrc should be the path to the image file within your GCS bucket.
 * The front-end will request a signed URL for this path from the server.
 */
import heatherPhoto from '../assets/Photos/Heather.jpg';
import tommyPhoto from '../assets/Photos/Tommy.jpg';
import candicePhoto from '../assets/Photos/Candice.png';
import rostPhoto from '../assets/Photos/Rost.jpg';
import dalePhoto from '../assets/Photos/Dale.jpg';
export const teamData = [
  {
    id: 1,
    firstName: 'heather',
    lastName: 'HELLER',
    role: 'MANAGING DIRECTOR & FOUNDER - EXECUTIVE PRODUCER',
    category: 'EXECUTIVE PRODUCER & FOUNDER',
    photoSrc: heatherPhoto, // Example GCS path
    bio: "Heather is a Grammy and Clio award-winning executive producer with over two decades of experience in the entertainment and advertising industry. She is the driving force behind Sinners and Saints. Heather's impressive portfolio includes collaborations with iconic artists like Lady Gaga and Lana Del Rey, stars such as Nicole Kidman and Jennifer Lawrence, and directors Francis Lawrence and Lisa Joy.Heather's dedication to excellence has made Sinners and Saints the preferred choice for global brands like Dior, Chanel, and Louis Vuitton. She routinely exceeds client expectations due to her industry expertise. Heather's extensive network of connections with industry crews and vendors is unmatched, guaranteeing a seamless and exceptional production experience for every project. With her dedication to quality, industry knowledge, and creative prowess, Heather Heller continues to set industry standards and push boundaries, making her a true luminary in the world of entertainment and advertising.",
  },
  {
    id: 2,
    firstName: 'THOMAS',
    lastName: 'CARROLL',
    role: 'EXECUTIVER PRODUCER FEATURES',
    category: 'EXECUTIVE PRODUCER FEATURES & PARTNER',
    photoSrc: tommyPhoto, // Example GCS path
    bio: "At Sinners and Saints, Thomas occupies a pivotal role, steering the company towards new horizons beyond commercials and short-form content. With an entrepreneurial spirit at his core, he has spearheaded the expansion of the brand into the world of entertainment, imbuing it with his trademark commitment to premium quality content.Under Thomas's leadership, Sinners and Saints has flourished, optioning seven projects that embody the company's ethos of storytelling excellence. Each project resonates with unique and compelling narratives, echoing the distinctive creative voices that define the brand.In 2024, Thomas embarked on a new chapter with the production of a psychological thriller starring Jack Kilmer, Paris Jackson, and Eric Roberts. This feature film, set to premiere in early 2025, stands as a testament to his ability to craft compelling narratives that captivate audiences worldwide. He navigates seamlessly across the media landscape, overseeing projects spanning branded entertainment, features, and documentaries.",
  },
  {
    id: 3,
    firstName: 'candice',
    lastName: 'LAWLER',
    role: 'EXECUTIVE PRODUCER PHOTO & MUSIC VIDEO',
    category: 'EXECUTIVE PRODUCER PHOTO & MUSIC VIDEO',
    photoSrc: candicePhoto, // Example GCS path
    bio: "Candice is a Los Angeles based creative director who’s career spans 20 years across brand marketing, tech, entertainment and musicAfter graduating from New York’s School Of Visual Arts, Candice spent time both behind the camera working with some of the biggest acts across music as well as leading brand creative for companies such as BET Networks, MTV, and Apple. During her 8 years at Apple she led global teams managing all aspects of video campaigns, photo, and design for Apple Music, APP Store, and TV+. Candice developed and executed the creative marketing for all first and second year platform launch titles for the TV+ team.Candice currently acts as Executive Producer and Creative Director across brand advertising campaigns for clients that include automotive, finance, fashion, pharma, tech, luxury and lifestyle brands. Her vast network and dedication to creative and strategic innovation makes her a trusted creative leader in today's advertising industry.",
  },
  {
    id: 4,
    firstName: 'Rost',
    lastName: 'Tolmachev',
    role: 'PRODUCTION OFFICE COORDINATOR',
    category: 'PRODUCTION OFFICE COORDINATOR',
    photoSrc: rostPhoto, // Example GCS path
    bio: 'Head of Production at Sinners and Saints. Born in Samara, Russia, forged in Los Angeles — Rost runs the show with a rare blend of precision, style, and international swagger.Fluent in Russian and fluent in getting sh*t done, he leads with vision and grit. Rost is the go-to for making the impossible happen — merging sharp creative instincts with airtight production and a cross-continental hustle that keeps S&S plugged in from LA to Eastern Europe.',
  },
  {
    id: 5,
    firstName: 'Dale',
    lastName: 'Smith',
    role: 'PRODUCTION OFFICE COORDINATOR',
    category: 'PRODUCTION OFFICE COORDINATOR',
    photoSrc: dalePhoto, // Example GCS path
    bio: 'Head of Production at Sinners and Saints. Born in Samara, Russia, forged in Los Angeles — Rost runs the show with a rare blend of precision, style, and international swagger.Fluent in Russian and fluent in getting sh*t done, he leads with vision and grit. Rost is the go-to for making the impossible happen — merging sharp creative instincts with airtight production and a cross-continental hustle that keeps S&S plugged in from LA to Eastern Europe.',
  },
  
];
