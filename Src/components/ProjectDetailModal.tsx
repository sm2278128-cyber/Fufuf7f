import { useState } from 'react';
import { X, Send, Mail, Play, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project, ProjectMedia } from '../types';
import CustomVideoPlayer from './CustomVideoPlayer';

interface ProjectDetailModalProps {
  project: Project;
  onClose: () => void;
}

export default function ProjectDetailModal({ project, onClose }: ProjectDetailModalProps) {
  const { title, description, category, mediaList } = project;
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  // Safe bounds guard
  const activeMedia: ProjectMedia | undefined = mediaList[activeMediaIndex] || mediaList[0];

  const handlePrevMedia = () => {
    setActiveMediaIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNextMedia = () => {
    setActiveMediaIndex((prev) => (prev === mediaList.length - 1 ? 0 : prev + 1));
  };

  const isLongDescription = description.length > 180;
  const truncatedDesc = isLongDescription && !isDescExpanded 
    ? `${description.slice(0, 180)}...` 
    : description;

  return (
    <div
      id="project-detail-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-zinc-950/90 backdrop-blur-md overflow-y-auto animate-fade-in"
    >
      <div
        id="project-detail-container"
        className="relative w-full max-w-5xl bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row max-h-[90vh]"
      >
        {/* Absolute header for sticky close on mobile */}
        <button
          id="close-detail-modal"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-zinc-950/80 border border-zinc-800 text-zinc-400 hover:text-white transition-all hover:scale-105"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Flipkart/Amazon-style Media Gallery Hub */}
        <div id="project-media-showcase" className="w-full lg:w-3/5 bg-zinc-950 flex flex-col md:flex-row relative">
          
          {/* Main Visual Display (Large View) */}
          <div id="main-media-display" className="flex-1 flex items-center justify-center p-4 relative min-h-[300px] md:min-h-[450px]">
            {activeMedia ? (
              activeMedia.type === 'video' ? (
                <div className="w-full aspect-video">
                  <CustomVideoPlayer 
                    src={activeMedia.url} 
                    className="w-full h-full rounded-lg"
                  />
                </div>
              ) : (
                <img
                  src={activeMedia.url}
                  alt={title}
                  className="max-h-[60vh] object-contain rounded-lg shadow-xl"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // fallback placeholder if image broken
                    e.currentTarget.src = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800";
                  }}
                />
              )
            ) : (
              <div className="text-zinc-600 text-sm">No media links loaded</div>
            )}

            {/* Slider arrows for quick navigation */}
            {mediaList.length > 1 && (
              <>
                <button
                  id="prev-media-btn"
                  onClick={handlePrevMedia}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  id="next-media-btn"
                  onClick={handleNextMedia}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Sidelisted Thumbnails (Flipkart/Amazon style) */}
          {mediaList.length > 1 && (
            <div
              id="media-thumbnails-tray"
              className="md:w-32 bg-zinc-900/50 p-3 border-t md:border-t-0 md:border-l border-zinc-800/80 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[120px] md:max-h-none justify-center md:justify-start"
            >
              {mediaList.map((media, idx) => (
                <button
                  key={idx}
                  id={`media-thumb-${idx}`}
                  onClick={() => setActiveMediaIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    idx === activeMediaIndex 
                      ? 'border-violet-500 scale-105 shadow-md shadow-violet-500/20' 
                      : 'border-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  {media.type === 'video' ? (
                    <div className="w-full h-full bg-zinc-950 flex items-center justify-center">
                      <Play className="w-5 h-5 text-violet-400 fill-current" />
                    </div>
                  ) : (
                    <img 
                      src={media.url} 
                      alt="thumbnail" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {/* Subtle small badge */}
                  <div className="absolute bottom-0.5 right-0.5 bg-black/60 p-0.5 rounded text-[8px] text-zinc-400">
                    {media.type === 'video' ? 'VIDEO' : 'IMG'}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Descriptions & Creative CTA */}
        <div id="project-detail-desc-panel" className="w-full lg:w-2/5 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] lg:max-h-none">
          <div id="project-desc-body">
            {/* Category tag */}
            <span id="project-category-badge" className="inline-block px-3 py-1 text-xs font-mono tracking-wider text-violet-400 bg-violet-950/50 border border-violet-800/60 rounded-full mb-3 uppercase">
              {category}
            </span>

            {/* Title */}
            <h2 id="project-title-header" className="text-xl md:text-2xl font-semibold tracking-tight text-white font-display mb-4">
              {title}
            </h2>

            {/* Description block with custom toggle */}
            <div id="project-desc-text" className="text-zinc-300 text-sm leading-relaxed mb-6 font-sans">
              <p>{truncatedDesc}</p>
              {isLongDescription && (
                <button
                  id="project-desc-toggle"
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="mt-2 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider underline cursor-pointer"
                >
                  {isDescExpanded ? 'Read Less' : 'Read More'}
                </button>
              )}
            </div>
          </div>

          {/* Social CTA Actions Block */}
          <div id="project-cta-section" className="border-t border-zinc-800/80 pt-6">
            <h4 id="cta-heading" className="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-4">
              Connect for custom designs
            </h4>
            
            <div id="project-social-actions-row" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                id="cta-social-instagram"
                href="https://ig.me/m/umangcreation.ig"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white text-xs font-mono rounded-xl font-medium tracking-wide shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Send className="w-4 h-4" />
                CHAT ON INSTAGRAM
              </a>
              
              <a
                id="cta-social-telegram"
                href="https://t.me/umangcreation_tg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 bg-sky-600 hover:bg-sky-500 text-white text-xs font-mono rounded-xl font-medium tracking-wide shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Send className="w-4 h-4" />
                TELEGRAM CHANNEL
              </a>
            </div>

            <a
              id="cta-social-email"
              href="mailto:umang@internet.ru"
              className="mt-3 flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs font-mono rounded-xl font-medium tracking-wide transition-all"
            >
              <Mail className="w-4 h-4" />
              DIRECT EMAIL INQUIRY
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
