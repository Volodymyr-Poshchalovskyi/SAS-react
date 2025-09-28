import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

// --- Компонент стрілки (без змін) ---
const SliderArrow = ({ direction, onClick }) => (
    <button
        onClick={onClick}
        className={`absolute top-1/2 -translate-y-1/2 z-20 text-white transition-opacity hover:opacity-70 ${
            direction === 'left' ? 'left-4 md:left-8' : 'right-4 md:right-8'
        }`}
        aria-label={direction === 'left' ? 'Previous Slide' : 'Next Slide'}
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-14 md:w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {direction === 'left' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
            )}
        </svg>
    </button>
);

// --- Основний компонент сторінки ---
export default function PublicReelPage() {
    const { reelId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(() => {
        const savedSlide = sessionStorage.getItem(`reel_${reelId}_slide`);
        return savedSlide ? parseInt(savedSlide, 10) : 0;
    });
    const videoRef = useRef(null);
    const hasMultipleSlides = data?.mediaItems?.length > 1;

useEffect(() => {
    if (!data || !data.reelDbId) return;

    // --- Генеруємо/дістаємо session_id ---
    let sessionId = sessionStorage.getItem(`session_id_${data.reelDbId}`);
    if (!sessionId) {
        sessionId = crypto.randomUUID();
        sessionStorage.setItem(`session_id_${data.reelDbId}`, sessionId);
    }

    // --- універсальний логгер ---
    const logEvent = (eventType, mediaItemId = null, duration = null) => {
        const payload = {
            reel_id: data.reelDbId,
            session_id: sessionId,
            event_type: eventType,
        };

        // для completion обов’язково потрібен media_item_id
        if (eventType === "completion") {
            payload.media_item_id = mediaItemId ?? data.mediaItems[currentSlide]?.id;
        } else if (mediaItemId) {
            payload.media_item_id = mediaItemId;
        }

        if (duration) {
            payload.duration_seconds = duration;
        }

        fetch("http://localhost:3001/reels/log-event", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then(res => {
                if (!res.ok) {
                    return res.json().then(errData => {
                        throw new Error(errData.error || "Failed to log event");
                    });
                }
                console.log(`✅ Event logged:`, payload);
            })
            .catch(err => console.error(`❌ Failed to log ${eventType}:`, err));
    };

    // --- view логіка як і було ---
    const viewLogged = sessionStorage.getItem(`view_logged_${data.reelDbId}`);
    if (!viewLogged) {
        logEvent("view");
        sessionStorage.setItem(`view_logged_${data.reelDbId}`, "true");
    }

    const currentMedia = data.mediaItems[currentSlide];
    if (!currentMedia) return;

    const completedVideosKey = `completed_videos_${data.reelDbId}`;
    const VIEW_THRESHOLD = 0.9; // 90%

    const markVideoCompleted = () => {
        let completed = JSON.parse(sessionStorage.getItem(completedVideosKey) || "[]");

        if (!completed.includes(currentMedia.id)) {
            completed.push(currentMedia.id);
            sessionStorage.setItem(completedVideosKey, JSON.stringify(completed));
            console.log("✅ Completed videos:", completed);

            if (completed.length === data.mediaItems.length) {
                // тепер completion відправляється з id останнього відео
                logEvent("completion", currentMedia.id, videoRef.current?.duration || null);
                console.log("🎉 All videos completed!");
            }
        }
    };

    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video || !video.duration) return;

        const percentageWatched = video.currentTime / video.duration;
        if (percentageWatched >= VIEW_THRESHOLD) {
            markVideoCompleted();
            video.removeEventListener("timeupdate", handleTimeUpdate);
        }
    };

    const handleEnded = () => {
        markVideoCompleted();
        nextSlideHandler();
    };

    const nextSlideHandler = () =>
        setCurrentSlide(prev =>
            prev === data.mediaItems.length - 1 ? 0 : prev + 1
        );

    const videoElement = videoRef.current;
    if (videoElement) {
        videoElement.addEventListener("timeupdate", handleTimeUpdate);
        videoElement.addEventListener("ended", handleEnded);
        return () => {
            videoElement.removeEventListener("timeupdate", handleTimeUpdate);
            videoElement.removeEventListener("ended", handleEnded);
        };
    }
}, [data, currentSlide, reelId]);


    
    // --- Збереження позиції (без змін) ---
    useEffect(() => {
        const videoElement = videoRef.current;
        const savePlaybackPosition = () => {
            if (videoElement && reelId) {
                sessionStorage.setItem(`reel_${reelId}_time`, videoElement.currentTime);
                sessionStorage.setItem(`reel_${reelId}_slide`, currentSlide);
            }
        };
        window.addEventListener('beforeunload', savePlaybackPosition);
        return () => {
            window.removeEventListener('beforeunload', savePlaybackPosition);
            savePlaybackPosition();
        };
    }, [currentSlide, reelId]);

    // --- Завантаження даних (без змін) ---
    useEffect(() => {
        const fetchReelData = async () => {
            if (!reelId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`http://localhost:3001/reels/public/${reelId}`);
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.details || 'Reel not found or is not active.');
                }
                const reelData = await response.json();
                setData(reelData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReelData();
        window.scrollTo(0, 0);
    }, [reelId]);

    const nextSlide = () => setCurrentSlide((prev) => (prev === data.mediaItems.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? data.mediaItems.length - 1 : prev - 1));
    const handleLoadedMetadata = () => {
        const savedTime = sessionStorage.getItem(`reel_${reelId}_time`);
        const video = videoRef.current;
        if (video && savedTime) {
            const savedSlide = sessionStorage.getItem(`reel_${reelId}_slide`);
            if (String(currentSlide) === savedSlide) {
                video.currentTime = parseFloat(savedTime);
            }
        }
    };

    if (loading) return <div className="h-screen w-full bg-white dark:bg-black flex items-center justify-center text-black dark:text-white">Loading...</div>;
    if (error) return <div className="h-screen w-full bg-white dark:bg-black flex items-center justify-center text-red-500 text-center p-8">Error: {error}</div>;
    if (!data || !data.mediaItems || data.mediaItems.length === 0) {
        return <div className="h-screen w-full bg-white dark:bg-black flex flex-col items-center justify-center text-center p-8"> <h1 className="text-3xl font-bold text-black dark:text-white mb-4">Reel is Empty</h1> <p className="text-slate-500 dark:text-slate-400">This reel does not contain any videos or may have been deleted.</p> </div>;
    }

    const currentMediaItem = data.mediaItems[currentSlide];
    if (!currentMediaItem) return <div className="h-screen w-full bg-white dark:bg-black flex items-center justify-center text-black dark:text-white">Loading media...</div>;

    const artistNames = (currentMediaItem.artists || []).map(a => a.name).join(', ');

    return (
        <div className="bg-white dark:bg-black text-black dark:text-white">
            {/* Hero Section (без змін) */}
            <section className="relative w-full h-screen overflow-hidden">
                <AnimatePresence initial={false}>
                    <motion.video ref={videoRef} key={currentSlide} src={currentMediaItem.videoUrl} autoPlay muted playsInline onLoadedMetadata={handleLoadedMetadata} className="absolute top-0 left-0 w-full h-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                </AnimatePresence>
                <div className="absolute inset-0 bg-black bg-opacity-30" />
                {hasMultipleSlides && <SliderArrow direction="left" onClick={prevSlide} />}
                {hasMultipleSlides && <SliderArrow direction="right" onClick={nextSlide} />}
                <div className="absolute inset-0 text-white pointer-events-none">
                    <div className="w-full h-full flex justify-center items-start pt-[15vh]">
                        <h1 className="text-3xl md:text-4xl font-bold uppercase font-montserrat text-center [text-shadow:0_2px_6px_rgb(0_0_0_/_0.6)] tracking-widest md:tracking-[0.2em]">
                            {data.reelTitle}
                        </h1>
                    </div>
                    <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 font-montserrat [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">
                        {currentMediaItem.client && <p className="text-xl md:text-2xl font-semibold">{currentMediaItem.client}</p>}
                        {currentMediaItem.title && <p className="text-md md:text-lg opacity-80">{currentMediaItem.title}</p>}
                    </div>
                    <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 font-montserrat text-right [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">
                        {artistNames && (
                            <>
                                <p className="text-sm md:text-md uppercase opacity-80">Artist</p>
                                <p className="text-lg md:text-xl font-semibold">{artistNames}</p>
                            </>
                        )}
                    </div>
                </div>
            </section>

            {/* Work Grid Section (без змін) */}
            <section className="pt-20 pb-10 md:pt-32 md:pb-16 px-6 lg:px-8 bg-white dark:bg-black">
                <div className="max-w-screen-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold uppercase mb-16 text-center md:text-left font-montserrat">Work</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                        {data.mediaItems.map((item) => (
                            <div key={item.id} className="group relative cursor-pointer overflow-hidden" onClick={() => setCurrentSlide(data.mediaItems.findIndex(i => i.id === item.id))}>
                                <img src={item.previewUrl} alt={`${item.client} - ${item.title}`} className="w-full h-auto object-cover aspect-video transition-transform duration-300 group-hover:scale-105" />
                                <div className="absolute top-0 left-0 p-4 w-full">
                                    {item.client && <p className="font-semibold text-base text-white uppercase font-montserrat [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">{item.client}</p>}
                                    {item.title && <p className="text-xs text-white/90 uppercase font-montserrat [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">{item.title}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Director Bio Section (без змін) */}
            {data.mediaItems[0]?.artists?.[0] && (
                <section className="pt-10 pb-20 md:pt-16 md:pb-32 px-8 sm:px-12 lg:px-16 bg-white dark:bg-black">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
                        <div className="md:col-span-1">
                            <img
                                src={data.mediaItems[0].artists[0].photoUrl || ''}
                                alt={data.mediaItems[0].artists[0].name}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                        <div className="md:col-span-1 flex flex-col">
                            <h2 className="text-3xl md:text-4xl font-bold uppercase mb-6 font-montserrat">{data.mediaItems[0].artists[0].name}</h2>
                            {data.mediaItems[0].artists[0].description && (
                                <p className="font-semibold text-base leading-[28.4px] tracking-[-0.09em] text-[#1D1D1D] dark:text-white/90">
                                    {data.mediaItems[0].artists[0].description}
                                </p>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}