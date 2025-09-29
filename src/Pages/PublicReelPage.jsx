import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import sinnersLogoBlack from '../assets/Logo/Sinners logo black.png';

// --- Компонент Preloader ---
const Preloader = () => (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <img src={sinnersLogoBlack} alt="Sinners Logo" className="w-40 h-auto mb-6" />
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin mb-4"></div>
        <p className="text-black tracking-widest uppercase text-sm">Loading</p>
    </div>
);

// --- Компонент Slider Arrow ---
const SliderArrow = ({ direction, onClick }) => (
    <button
        onClick={onClick}
        className={`absolute top-1/2 -translate-y-1/2 z-20 text-white transition-opacity hover:opacity-70 ${
            direction === 'left' ? 'left-4 md:left-8' : 'right-4 md:right-8'
        }`}
        aria-label={direction === 'left' ? 'Previous Slide' : 'Next Slide'}
    >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 md:h-14 md:w-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {direction === 'left' ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />}
        </svg>
    </button>
);


export default function PublicReelPage() {
    const { reelId } = useParams();
    // --- Усі стани ---
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [preloading, setPreloading] = useState(true);
    const [error, setError] = useState(null);
    const [currentSlide, setCurrentSlide] = useState(() => {
        const savedSlide = sessionStorage.getItem(`reel_${reelId}_slide`);
        return savedSlide ? parseInt(savedSlide, 10) : 0;
    });
    const [isVideoPlaying, setIsVideoPlaying] = useState(false);
    const [isFullImageLoaded, setIsFullImageLoaded] = useState(false);
    const [isInitialPlay, setIsInitialPlay] = useState(true);

    // --- Refs ---
    const videoRef = useRef(null);
    const preloadVideoRef = useRef(null);
    
    const hasMultipleSlides = data?.mediaItems?.length > 1;

    // --- Логіка прелоадера ---
    useEffect(() => {
        const timer = setTimeout(() => {
            setPreloading(false);
        }, 1600);
        return () => clearTimeout(timer);
    }, []);

    // --- Memoized значення ---
    const currentMediaItem = data?.mediaItems?.[currentSlide] || null;

    const isVideo = useMemo(() => {
        if (!currentMediaItem?.videoUrl) return false;
        try {
            const url = new URL(currentMediaItem.videoUrl);
            const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
            return videoExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
        } catch { return false; }
    }, [currentMediaItem]);

    const isReadyToPlay = !loading && !preloading;

    // --- Функція логування статистики ---
    const logEvent = useCallback((eventType, mediaItemId = null, duration = null) => {
        if (!data?.reelDbId) return;
        let sessionId = sessionStorage.getItem(`session_id_${data.reelDbId}`);
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            sessionStorage.setItem(`session_id_${data.reelDbId}`, sessionId);
        }
        const payload = { reel_id: data.reelDbId, session_id: sessionId, event_type: eventType };
        if (eventType === "completion" || eventType === "media_completion") {
            payload.media_item_id = mediaItemId ?? data.mediaItems[currentSlide]?.id;
        } else if (mediaItemId) {
            payload.media_item_id = mediaItemId;
        }
        if (duration !== null) {
            payload.duration_seconds = duration;
        }
        fetch("http://localhost:3001/reels/log-event", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
        }).then(res => {
            if (!res.ok) return res.json().then(errData => { throw new Error(errData.error || "Failed to log event"); });
        }).catch(err => console.error(`Failed to log ${eventType}:`, err));
    }, [data, currentSlide]);

    // --- Управління відтворенням та станами ---
    useEffect(() => {
        setIsVideoPlaying(false);
        setIsFullImageLoaded(false);

        const video = videoRef.current;
        if (isVideo) {
            if (!video) return;
            if (isReadyToPlay) {
                const savedTime = sessionStorage.getItem(`reel_${reelId}_time`);
                const savedSlide = sessionStorage.getItem(`reel_${reelId}_slide`);
                if (savedTime && String(currentSlide) === savedSlide) {
                    video.currentTime = parseFloat(savedTime);
                    sessionStorage.removeItem(`reel_${reelId}_time`);
                } else {
                    video.currentTime = 0;
                }
                video.play().catch(error => console.error("Video playback was prevented:", error));
            } else {
                video.pause();
            }
        }
    }, [isReadyToPlay, isVideo, currentMediaItem, reelId, currentSlide]);

    // --- Слухачі подій для плавних переходів ---
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const onPlaying = () => {
            setIsVideoPlaying(true);
            if (isInitialPlay) setIsInitialPlay(false);
        };
        const onSlideChange = () => setIsVideoPlaying(false);
        video.addEventListener('playing', onPlaying);
        video.addEventListener('loadstart', onSlideChange);
        return () => {
            video.removeEventListener('playing', onPlaying);
            video.removeEventListener('loadstart', onSlideChange);
        };
    }, [currentMediaItem, isInitialPlay]);

    // --- Логіка попереднього завантаження ---
    const nextSlideIndex = useMemo(() => {
        if (!data || !hasMultipleSlides) return null;
        return (currentSlide + 1) % data.mediaItems.length;
    }, [currentSlide, data, hasMultipleSlides]);
    const nextMediaItem = data?.mediaItems[nextSlideIndex];
    const isNextItemVideo = useMemo(() => {
        if (!nextMediaItem?.videoUrl) return false;
        try {
            const url = new URL(nextMediaItem.videoUrl);
            const videoExtensions = ['.mp4', '.mov', '.webm', '.ogg'];
            return videoExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
        } catch { return false; }
    }, [nextMediaItem]);
    useEffect(() => {
        if (isNextItemVideo) {
            const preloadVideo = preloadVideoRef.current;
            if (preloadVideo) {
                preloadVideo.play().then(() => preloadVideo.pause()).catch(() => {});
            }
        }
    }, [nextMediaItem, isNextItemVideo]);
    
    // --- Головний useEffect для статистики та авто-перемикання ---
    useEffect(() => {
        if (!isReadyToPlay || !data || !data.reelDbId || !currentMediaItem) return;
        
        const sessionStartTimeKey = `session_start_time_${data.reelDbId}`;
        if (!sessionStorage.getItem(sessionStartTimeKey)) {
            sessionStorage.setItem(sessionStartTimeKey, Date.now().toString());
        }
        const viewLoggedKey = `view_logged_${data.reelDbId}`;
        if (!sessionStorage.getItem(viewLoggedKey)) {
            logEvent("view");
            sessionStorage.setItem(viewLoggedKey, "true");
        }
        const nextSlideHandler = () => setCurrentSlide(prev => (prev === data.mediaItems.length - 1 ? 0 : prev + 1));
        const completedMediaKey = `completed_media_${data.reelDbId}`;
        const markMediaCompleted = (mediaId, duration) => {
            let completed = JSON.parse(sessionStorage.getItem(completedMediaKey) || "[]");
            if (!completed.includes(mediaId)) {
                logEvent("media_completion", mediaId, duration);
                completed.push(mediaId);
                sessionStorage.setItem(completedMediaKey, JSON.stringify(completed));
                if (completed.length === data.mediaItems.length) {
                    logEvent("completion");
                }
            }
        };
        if (isVideo) {
            const VIEW_THRESHOLD = 0.9;
            const handleTimeUpdate = () => {
                const video = videoRef.current;
                if (!video || !video.duration) return;
                if (video.currentTime / video.duration >= VIEW_THRESHOLD) {
                    markMediaCompleted(currentMediaItem.id, video.duration);
                    video.removeEventListener("timeupdate", handleTimeUpdate);
                }
            };
            const handleEnded = () => {
                markMediaCompleted(currentMediaItem.id, videoRef.current?.duration || null);
                nextSlideHandler();
            };
            const videoElement = videoRef.current;
            if (videoElement) {
                videoElement.addEventListener("timeupdate", handleTimeUpdate);
                videoElement.addEventListener("ended", handleEnded);
                return () => {
                    videoElement.removeEventListener("timeupdate", handleTimeUpdate);
                    videoElement.removeEventListener("ended", handleEnded);
                };
            }
        } else {
            markMediaCompleted(currentMediaItem.id, 7);
            const imageTimer = setTimeout(nextSlideHandler, 7000);
            return () => clearTimeout(imageTimer);
        }
    }, [data, currentSlide, logEvent, isVideo, currentMediaItem, isReadyToPlay]);

    // --- useEffect для завантаження даних ---
    useEffect(() => {
        const fetchReelData = async () => {
            if (!reelId) return;
            setLoading(true); setError(null);
            try {
                const response = await fetch(`http://localhost:3001/reels/public/${reelId}`);
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.details || 'Reel not found or is not active.');
                }
                setData(await response.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReelData();
        window.scrollTo(0, 0);
    }, [reelId]);

    // --- useEffect для виходу зі сторінки ---
    useEffect(() => {
        if (!reelId || !data?.reelDbId) return;
        const handlePageExit = () => {
            if (isVideo) {
                const videoElement = videoRef.current;
                if (videoElement && videoElement.currentTime) {
                    sessionStorage.setItem(`reel_${reelId}_time`, videoElement.currentTime);
                }
            }
            sessionStorage.setItem(`reel_${reelId}_slide`, currentSlide);
            const sessionStartTimeKey = `session_start_time_${data.reelDbId}`;
            const startTime = sessionStorage.getItem(sessionStartTimeKey);
            if (startTime) {
                const endTime = Date.now();
                const durationSeconds = Math.round((endTime - parseInt(startTime, 10)) / 1000);
                if (durationSeconds > 0) {
                    logEvent('session_duration', null, durationSeconds);
                }
                sessionStorage.removeItem(sessionStartTimeKey);
            }
        };
        window.addEventListener('beforeunload', handlePageExit);
        return () => {
            window.removeEventListener('beforeunload', handlePageExit);
            handlePageExit();
        };
    }, [reelId, data, currentSlide, logEvent, isVideo]);

    const nextSlide = () => setCurrentSlide((prev) => (prev === data.mediaItems.length - 1 ? 0 : prev + 1));
    const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? data.mediaItems.length - 1 : prev - 1));

    const artistNames = (currentMediaItem?.artists || []).map(a => a.name).join(', ').toUpperCase();

    return (
        <>
            <AnimatePresence>
                {(preloading || loading) && (
                    <motion.div key="preloader" exit={{ opacity: 0, transition: { duration: 0.5 } }}>
                        <Preloader />
                    </motion.div>
                )}
            </AnimatePresence>
            
            {nextMediaItem && (
                isNextItemVideo ? (
                    <video ref={preloadVideoRef} key={nextMediaItem.id} src={nextMediaItem.videoUrl} preload="auto" style={{ display: 'none' }} muted playsInline />
                ) : (
                    <img key={nextMediaItem.id} src={nextMediaItem.videoUrl} alt="" style={{ display: 'none' }} />
                )
            )}

            {!loading && data && (
                <div className="bg-white dark:bg-black text-black dark:text-white">
                    <section className="relative w-full h-screen overflow-hidden bg-black">
                        <AnimatePresence initial={false}>
                            {isVideo ? (
                                <motion.video
                                    ref={videoRef}
                                    key={currentSlide}
                                    src={currentMediaItem.videoUrl}
                                    muted
                                    playsInline
                                    className="absolute top-0 left-0 w-full h-full object-cover"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                />
                            ) : (
                                isInitialPlay ? (
                                    <div key={currentSlide} className="absolute inset-0">
                                        <motion.img
                                            src={currentMediaItem.previewUrl}
                                            alt="Loading image preview"
                                            className="absolute inset-0 w-full h-full object-cover"
                                            animate={{ opacity: isFullImageLoaded ? 0 : 1 }}
                                            transition={{ duration: 0.7 }}
                                        />
                                        <motion.img
                                            src={currentMediaItem.videoUrl}
                                            alt={currentMediaItem.title || 'Reel media'}
                                            onLoad={() => {
                                                setIsFullImageLoaded(true);
                                                if (isInitialPlay) setIsInitialPlay(false);
                                            }}
                                            className="absolute inset-0 w-full h-full object-cover"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: isFullImageLoaded ? 1 : 0 }}
                                            transition={{ duration: 0.7 }}
                                        />
                                    </div>
                                ) : (
                                    <motion.img
                                        key={currentSlide}
                                        src={currentMediaItem.videoUrl}
                                        alt={currentMediaItem.title || 'Reel media'}
                                        className="absolute inset-0 w-full h-full object-cover"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                    />
                                )
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {isVideo && isInitialPlay && !isVideoPlaying && (
                                <motion.img
                                    key="poster-image"
                                    src={currentMediaItem.previewUrl}
                                    alt="Video poster"
                                    initial={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute top-0 left-0 w-full h-full object-cover z-10"
                                />
                            )}
                        </AnimatePresence>
                        
                        <div className="absolute inset-0 bg-black bg-opacity-30" />
                        {hasMultipleSlides && <SliderArrow direction="left" onClick={prevSlide} />}
                        {hasMultipleSlides && <SliderArrow direction="right" onClick={nextSlide} />}
                        <div className="absolute inset-0 text-white pointer-events-none z-20">
                            <div className="w-full h-full flex justify-center items-start pt-[15vh]">
                                <h1 className="text-3xl md:text-4xl font-bold uppercase font-montserrat text-center [text-shadow:0_2px_6px_rgb(0_0_0_/_0.6)] tracking-widest md:tracking-[0.2em]">{data.reelTitle}</h1>
                            </div>
                            <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 font-montserrat [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">
                                {currentMediaItem.client && <p className="text-xl md:text-2xl font-semibold">{currentMediaItem.client}</p>}
                                {currentMediaItem.title && <p className="text-md md:text-lg opacity-80">{currentMediaItem.title}</p>}
                            </div>
                            <div className="absolute bottom-8 right-8 md:bottom-12 md:right-12 font-montserrat text-right [text-shadow:0_2px_4px_rgb(0_0_0_/_0.7)]">
                                {artistNames && (<>
                                    <p className="text-sm md:text-md uppercase opacity-80">{currentMediaItem.craft}</p>
                                    <p className="text-lg md:text-xl font-semibold">{artistNames}</p>
                                </>)}
                            </div>
                        </div>
                    </section>
                    
                    <section className="pt-20 pb-10 md:pt-32 md:pb-16 px-6 lg:px-8 bg-white dark:bg-black">
                        <div className="max-w-screen-2xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-bold uppercase mb-16 text-center md:text-left font-montserrat">Work</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                                {data.mediaItems.map((item, index) => (
                                    <div key={item.id} className="group relative cursor-pointer overflow-hidden" onClick={() => setCurrentSlide(index)}>
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
                    {data.mediaItems[0]?.artists?.[0] && (
                        <section className="pt-10 pb-20 md:pt-16 md:pb-32 px-8 sm:px-12 lg:px-16 bg-white dark:bg-black">
                            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-start">
                                <div className="md:col-span-1">
                                    <img src={data.mediaItems[0].artists[0].photoUrl || ''} alt={data.mediaItems[0].artists[0].name} className="w-full h-auto object-cover" />
                                </div>
                                <div className="md:col-span-1 flex flex-col">
                                    <h2 className="text-3xl md:text-4xl font-bold uppercase mb-6 font-montserrat">{data.mediaItems[0].artists[0].name}</h2>
                                    {data.mediaItems[0].artists[0].description && (
                                        <p className="font-semibold text-base leading-[28.4px] tracking-[-0.09em] text-[#1D1D1D] dark:text-white/90">{data.mediaItems[0].artists[0].description}</p>
                                    )}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            )}

            {!loading && error && <div className="h-screen w-full bg-white dark:bg-black flex items-center justify-center text-red-500 text-center p-8">Error: {error}</div>}
            {!loading && !data && !error && (
                <div className="h-screen w-full bg-white dark:bg-black flex flex-col items-center justify-center text-center p-8"> 
                    <h1 className="text-3xl font-bold text-black dark:text-white mb-4">Reel is Empty</h1> 
                    <p className="text-slate-500 dark:text-slate-400">This reel does not contain any videos or may have been deleted.</p> 
                </div>
            )}
        </>
    );
}