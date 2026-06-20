import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { 
  collection, getDocs, query, orderBy 
} from 'firebase/firestore';
import { db } from './firebase';
import { Project, Skill } from './types';
import { DEFAULT_PROJECTS, DEFAULT_SKILLS } from './data';
import ProjectDetailModal from './components/ProjectDetailModal';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'about' | 'skills' | 'projects' | 'contact' | 'admin'>('home');
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [dbLoading, setDbLoading] = useState(true);

  // Selected project for fullscreen detailed view tab modal
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Expanded descriptions on standard project cards
  const [expandedCardDesc, setExpandedCardDesc] = useState<{ [key: string]: boolean }>({});

  const [activeCategory, setActiveCategory] = useState<string>('All');

  // Load profile photo & logo from user specifications
  const dpUrl = "https://imgh.in/host/zoh032";
  const logoUrl = "https://imgh.in/host/onzoec";

  // Safe fallback triggers in case of host rendering complications
  const fallbackDp = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600";
  const fallbackLogo = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200";

  const fetchPortfolioData = async () => {
    setDbLoading(true);
    try {
      // Fetch skills from Firestore
      const skillsSnap = await getDocs(collection(db, 'skills'));
      const fetchedSkills: Skill[] = [];
      skillsSnap.forEach((doc) => {
        const d = doc.data();
        fetchedSkills.push({
          id: doc.id,
          name: d.name || '',
          displayIcon: d.displayIcon || 'Sparkles',
          rating: Number(d.rating) || 80,
          category: d.category || 'Core'
        });
      });

      // Fetch projects from Firestore order by newest
      const projQuery = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const projectsSnap = await getDocs(projQuery).catch(async () => {
        // Fallback to unordered if index is building or missing
        return await getDocs(collection(db, 'projects'));
      });

      const fetchedProjects: Project[] = [];
      projectsSnap.forEach((doc) => {
        const d = doc.data();
        fetchedProjects.push({
          id: doc.id,
          title: d.title || '',
          description: d.description || '',
          category: d.category || 'Design',
          mediaList: d.mediaList || [],
          createdAt: d.createdAt
        });
      });

      if (fetchedSkills.length > 0) {
        setSkills(fetchedSkills);
      } else {
        setSkills(DEFAULT_SKILLS);
      }

      if (fetchedProjects.length > 0) {
        setProjects(fetchedProjects);
      } else {
        setProjects(DEFAULT_PROJECTS);
      }

    } catch (e) {
      console.warn("Could not query Firestore, utilizing high-quality seeded fallbacks", e);
      setSkills(DEFAULT_SKILLS);
      setProjects(DEFAULT_PROJECTS);
    } finally {
      setDbLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  // Filter project categories
  const filteredProjects = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());

  // Render dynamic Lucide Icons for skills safely
  const renderSkillIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Code;
    return <IconComponent className="w-5 h-5 text-violet-400" />;
  };

  const toggleCardDesc = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCardDesc(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // If view is administrative console, divert viewport completely
  if (currentTab === 'admin') {
    return (
      <AdminPanel 
        onBack={() => setCurrentTab('home')} 
        onRefreshData={fetchPortfolioData}
      />
    );
  }

  return (
    <div id="umang-portfolio-canvas" className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative">
      
      {/* BACKGROUND GRAPHIC ORBITS */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-violet-950/10 via-zinc-950/0 to-transparent pointer-events-none" />
      <div className="absolute top-60 right-10 w-96 h-96 bg-fuchsia-600/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute top-20 left-10 w-80 h-80 bg-violet-600/5 rounded-full filter blur-[100px] pointer-events-none" />

      {/* HEADER NAVIGATION */}
      <header id="portfolio-main-header" className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-900/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo & title details */}
          <div 
            id="brand-header-left" 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center group-hover:border-violet-500/80 transition-all">
              <img 
                src={logoUrl} 
                alt="Umang Logo" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.currentTarget.src = fallbackLogo;
                }}
              />
            </div>
            
            <div>
              {/* Desktop Name Display */}
              <span className="hidden md:inline-block text-lg font-bold font-display tracking-tight text-white uppercase glitch-hover-effect">
                Umang Creation<span className="text-violet-500">.</span>
              </span>
              {/* Mobile Name Display */}
              <span className="inline-block md:hidden text-base font-bold font-display text-white uppercase">
                Umang<span className="text-violet-400">.</span>
              </span>
              <p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase leading-none hidden sm:block">
                Visual Artistry Studio
              </p>
            </div>
          </div>

          {/* PC NAVIGATION BAR */}
          <nav id="desktop-navbar" className="hidden md:flex items-center gap-8 text-sm font-mono tracking-wider uppercase font-medium">
            <button
              id="tab-btn-home"
              onClick={() => setCurrentTab('home')}
              className={`pb-1 border-b-2 hover:text-white transition-all cursor-pointer ${
                currentTab === 'home' 
                  ? 'border-violet-500 text-white font-semibold' 
                  : 'border-transparent text-zinc-400'
              }`}
            >
              Home
            </button>
            <button
              id="tab-btn-about"
              onClick={() => setCurrentTab('about')}
              className={`pb-1 border-b-2 hover:text-white transition-all cursor-pointer ${
                currentTab === 'about' 
                  ? 'border-violet-500 text-white font-semibold' 
                  : 'border-transparent text-zinc-400'
              }`}
            >
              About
            </button>
            <button
              id="tab-btn-skills"
              onClick={() => setCurrentTab('skills')}
              className={`pb-1 border-b-2 hover:text-white transition-all cursor-pointer ${
                currentTab === 'skills' 
                  ? 'border-violet-500 text-white font-semibold' 
                  : 'border-transparent text-zinc-400'
              }`}
            >
              Skills
            </button>
            <button
              id="tab-btn-projects"
              onClick={() => setCurrentTab('projects')}
              className={`pb-1 border-b-2 hover:text-white transition-all cursor-pointer ${
                currentTab === 'projects' 
                  ? 'border-violet-500 text-white font-semibold' 
                  : 'border-transparent text-zinc-400'
              }`}
            >
              Projects
            </button>
            <button
              id="tab-btn-contact"
              onClick={() => setCurrentTab('contact')}
              className={`pb-1 border-b-2 hover:text-white transition-all cursor-pointer ${
                currentTab === 'contact' 
                  ? 'border-violet-500 text-white font-semibold' 
                  : 'border-transparent text-zinc-400'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* MOBILE NAVIGATION - Inline tab icons */}
          <div id="mobile-navigation-tray" className="flex md:hidden items-center gap-3">
            <button
              id="mob-btn-home"
              onClick={() => setCurrentTab('home')}
              className={`p-2 rounded-xl border transition-all ${
                currentTab === 'home' 
                  ? 'bg-violet-950/40 border-violet-500/50 text-violet-400' 
                  : 'border-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Home"
            >
              <Icons.Home className="w-4.5 h-4.5" />
            </button>
            <button
              id="mob-btn-about"
              onClick={() => setCurrentTab('about')}
              className={`p-2 rounded-xl border transition-all ${
                currentTab === 'about' 
                  ? 'bg-violet-950/40 border-violet-500/50 text-violet-400' 
                  : 'border-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
              title="About"
            >
              <Icons.User className="w-4.5 h-4.5" />
            </button>
            <button
              id="mob-btn-skills"
              onClick={() => setCurrentTab('skills')}
              className={`p-2 rounded-xl border transition-all ${
                currentTab === 'skills' 
                  ? 'bg-violet-950/40 border-violet-500/50 text-violet-400' 
                  : 'border-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Skills"
            >
              <Icons.Sparkles className="w-4.5 h-4.5" />
            </button>
            <button
              id="mob-btn-projects"
              onClick={() => setCurrentTab('projects')}
              className={`p-2 rounded-xl border transition-all ${
                currentTab === 'projects' 
                  ? 'bg-violet-950/40 border-violet-500/50 text-violet-400' 
                  : 'border-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Projects"
            >
              <Icons.LayoutTemplate className="w-4.5 h-4.5" />
            </button>
            <button
              id="mob-btn-contact"
              onClick={() => setCurrentTab('contact')}
              className={`p-2 rounded-xl border transition-all ${
                currentTab === 'contact' 
                  ? 'bg-violet-950/40 border-violet-500/50 text-violet-400' 
                  : 'border-zinc-900 text-zinc-400 hover:text-zinc-200'
              }`}
              title="Contact"
            >
              <Icons.Phone className="w-4.5 h-4.5" />
            </button>
          </div>

        </div>
      </header>

      {/* CORE PORTFOLIO CORE VIEWS */}
      <main id="portfolio-main-views" className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* VIEW 1: HOME PAGE */}
        {currentTab === 'home' && (
          <section id="section-home" className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 justify-between py-6">
            
            {/* Left bio texts & Call to Actions */}
            <div id="home-bio-sidebar" className="flex-1 space-y-6 text-center lg:text-left">
              <span className="inline-flex px-3 py-1 text-xs font-mono tracking-widest text-violet-400 bg-violet-950/30 border border-violet-800/50 rounded-full">
                HELLO CREATIVE VISITOR!
              </span>
              
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-display">
                We craft <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">gorgeous visual assets</span> that elevate.
              </h2>
              
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-xl mx-auto lg:mx-0">
                Hi, I'm Umang. A graphic designer, visual illustrator, and video production curator. We construct premium custom banners, YouTube cover art layouts, elite channel designs, and motion assets.
              </p>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <button
                  id="home-btn-view-work"
                  onClick={() => setCurrentTab('projects')}
                  className="px-6 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-mono font-semibold uppercase rounded-xl tracking-wider shadow-lg shadow-violet-500/20 hover:shadow-violet-500/35 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  VIEW RECENT CREATIONS
                </button>
                <button
                  id="home-btn-contact-me"
                  onClick={() => setCurrentTab('contact')}
                  className="px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-mono uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  DISCUSS YOUR IDEA
                </button>
              </div>

              {/* Mini counter / status line */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-zinc-900 max-w-md mx-auto lg:mx-0 font-mono text-center">
                <div>
                  <div className="text-2xl font-bold font-display text-white">100+</div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Posters Done</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-white">20+</div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Active Brands</div>
                </div>
                <div>
                  <div className="text-2xl font-bold font-display text-white">100%</div>
                  <div className="text-[9px] text-zinc-500 uppercase tracking-widest">Visual Delight</div>
                </div>
              </div>
            </div>

            {/* Right Display: Circle picture with neon orbital waves */}
            <div id="home-photo-orb" className="flex-1 flex justify-center relative py-4 lg:py-0">
              
              {/* Spinning orbiting light dots */}
              <div className="absolute inset-0 max-w-[340px] max-h-[340px] m-auto rounded-full border border-dashed border-violet-500/30 animate-[spin_50s_linear_infinite]" />
              <div className="absolute inset-2 max-w-[320px] max-h-[320px] m-auto rounded-full border border-zinc-800/40" />

              {/* Glowing cyberpunk outline */}
              <div className="relative w-72 h-72 sm:w-80 sm:h-80 rounded-full p-2.5 bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-cyan-400 shadow-2xl shadow-violet-500/10">
                <div className="w-full h-full rounded-full overflow-hidden bg-zinc-950 border-4 border-zinc-950 relative">
                  <img
                    id="profile-display-photo"
                    src={dpUrl}
                    alt="Umang Creative DP"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = fallbackDp;
                    }}
                  />
                  {/* Bottom aesthetic overlay */}
                  <div className="absolute bottom-4 left-0 right-0 mx-auto text-center">
                    <span className="px-2.5 py-0.5 bg-zinc-950/90 text-[9px] font-mono tracking-widest text-violet-300 rounded border border-zinc-800">
                      FOUNDER & ARTIST
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </section>
        )}

        {/* VIEW 2: ABOUT SECTION */}
        {currentTab === 'about' && (
          <section id="section-about" className="max-w-3xl mx-auto space-y-8 animate-fade-in">
            <div className="space-y-4 text-center">
              <span className="text-xs font-mono tracking-widest text-violet-400 uppercase bg-violet-950/30 px-3 py-1 rounded-full">
                VISION & BIO
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white uppercase">
                THE ARTIST BEHIND UMANG CREATION
              </h2>
              <div className="w-12 h-1 bg-violet-500 mx-auto rounded-full" />
            </div>

            {/* Structured Biography block with detailed info */}
            <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 sm:p-10 space-y-6 shadow-xl leading-relaxed">
              <p className="text-zinc-300 text-sm sm:text-base">
                Welcome to <strong className="text-white">Umang Creation</strong>. We are a boutique visual agency operating globally, specializing in premium designs, gorgeous banners, custom thumbnails, channel setups, and creative cinematic promotions.
              </p>
              
              <p className="text-zinc-300 text-sm sm:text-base">
                Our approach to digital assets avoids standard template formulas. Instead, we pair intense color typography, volumetric backdrops, and interactive animations to build customized layouts. These assets act as visual magnets of modern gaming channels, lifestyle brands, and product lineups.
              </p>

              <div id="about-highlights-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs font-mono">
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50 flex gap-3 items-center">
                  <Icons.Palette className="w-5 h-5 text-violet-400" />
                  <div>
                    <span className="block text-white font-semibold">Graphic design</span>
                    <span className="text-zinc-500">Fine layouts & branding</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50 flex gap-3 items-center">
                  <Icons.LayoutTemplate className="w-5 h-5 text-fuchsia-400" />
                  <div>
                    <span className="block text-white font-semibold">Bespoke Banner arts</span>
                    <span className="text-zinc-500">Optimized across all platforms</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50 flex gap-3 items-center">
                  <Icons.Video className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="block text-white font-semibold">Video Production</span>
                    <span className="text-zinc-500">Post-production edits</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/50 flex gap-3 items-center">
                  <Icons.Award className="w-5 h-5 text-violet-400" />
                  <div>
                    <span className="block text-white font-semibold">Brand Identity</span>
                    <span className="text-zinc-500">Logos & customized thumbnails</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-zinc-400 font-mono uppercase tracking-wide">
                  HAVE A COLLABORATION BUDGET?
                </p>
                <button
                  onClick={() => setCurrentTab('contact')}
                  className="px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono uppercase rounded-xl tracking-wider transition-colors cursor-pointer"
                >
                  START INQUIRY NOW
                </button>
              </div>
            </div>
          </section>
        )}

        {/* VIEW 3: SKILLS LABS */}
        {currentTab === 'skills' && (
          <section id="section-skills" className="max-w-4xl mx-auto space-y-10 animate-fade-in">
            <div className="space-y-4 text-center">
              <span className="text-xs font-mono tracking-widest text-violet-400 uppercase bg-violet-950/30 px-3 py-1 rounded-full">
                METRICS & EXPERTISE
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white uppercase">
                PROFESSIONAL DESIGN SKILLSETS
              </h2>
              <div className="w-12 h-1 bg-violet-500 mx-auto rounded-full" />
            </div>

            {dbLoading ? (
              <div className="flex justify-center p-20">
                <Icons.Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : (
              <div id="skills-main-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills.map((skill, index) => (
                  <div
                    key={skill.id || index}
                    id={`skill-card-${index}`}
                    className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700/80 transition-all shadow-lg flex flex-col justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-zinc-950 rounded-lg border border-zinc-800">
                        {renderSkillIcon(skill.displayIcon)}
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-white tracking-tight">{skill.name}</h4>
                        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">{skill.category}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-400 uppercase tracking-wide">Expertise Level</span>
                        <span className="text-violet-400 font-bold">{skill.rating}%</span>
                      </div>
                      
                      {/* Skill meters bar */}
                      <div className="relative h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
                          style={{ width: `${skill.rating}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* VIEW 4: PROJECTS GRID & CATEGORY TABS */}
        {currentTab === 'projects' && (
          <section id="section-projects" className="space-y-10 animate-fade-in">
            <div className="space-y-4 text-center">
              <span className="text-xs font-mono tracking-widest text-violet-400 uppercase bg-violet-950/30 px-3 py-1 rounded-full">
                CREATIVE ARCHIVE
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white uppercase">
                SHOWCASED MASTERPIECES
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans max-w-xl mx-auto">
                Discover custom designs, high-end promotional banners, and luxury cover layouts. Tap any card to open the fullscreen gallery view tab with Amazon/Flipkart navigation overlays.
              </p>
              <div className="w-12 h-1 bg-violet-500 mx-auto rounded-full" />
            </div>

            {/* Category selection bar */}
            <div id="category-selector-row" className="flex flex-wrap items-center justify-center gap-2 max-w-xl mx-auto pb-4">
              {['All', 'Design', 'Banner', 'Branding', 'Production'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-xs font-mono rounded-xl border tracking-wide transition-all uppercase cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-500/20'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {dbLoading ? (
              <div className="flex justify-center p-20">
                <Icons.Loader2 className="w-8 h-8 animate-spin text-violet-500" />
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="p-12 text-center bg-zinc-900 border border-zinc-850 rounded-2xl max-w-md mx-auto space-y-4">
                <Icons.Layers className="w-8 h-8 text-zinc-600 mx-auto" />
                <span className="block text-zinc-400 text-sm font-semibold tracking-wider font-mono uppercase">Category Empty</span>
                <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                  No projects are registered under '{activeCategory}' category here yet. Log in to the administrator console below to publish dynamic creative project cards.
                </p>
              </div>
            ) : (
              <div id="projects-grid-hud" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((proj, idx) => {
                  const cardId = proj.id || String(idx);
                  const isExpanded = expandedCardDesc[cardId] || false;
                  const summaryText = proj.description.length > 90 && !isExpanded
                    ? `${proj.description.slice(0, 90)}...`
                    : proj.description;

                  // Get first image as primary display card cover
                  const coverItem = proj.mediaList.find(m => m.type === 'image') || proj.mediaList[0];
                  const hasVideo = proj.mediaList.some(m => m.type === 'video');

                  return (
                    <div
                      key={cardId}
                      id={`project-card-${cardId}`}
                      onClick={() => setSelectedProject(proj)}
                      className="group flex flex-col justify-between bg-zinc-900 border border-zinc-800 hover:border-zinc-700/80 rounded-2xl overflow-hidden shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl cursor-pointer"
                    >
                      {/* Cover Photo box */}
                      <div className="relative aspect-video w-full bg-zinc-950 overflow-hidden">
                        {coverItem ? (
                          <img
                            src={coverItem.url}
                            alt={proj.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src = fallbackLogo;
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                            <Icons.ImageIcon className="w-8 h-8 text-zinc-700" />
                          </div>
                        )}

                        {/* Badges Overlay */}
                        <div className="absolute top-3 left-3 flex gap-2">
                          <span className="px-2 py-0.5 bg-black/75 text-[9px] font-mono tracking-wide text-violet-400 rounded uppercase">
                            {proj.category}
                          </span>
                          {hasVideo && (
                            <span className="px-2 py-0.5 bg-fuchsia-600/90 text-[9px] font-mono tracking-wide text-white rounded flex items-center gap-1 uppercase">
                              <Icons.Play className="w-2.5 h-2.5 fill-current" />
                              VIDEO SPEC
                            </span>
                          )}
                        </div>

                        {/* Hover Overlay Visual prompt */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-4 py-2 bg-zinc-900/95 border border-zinc-700 text-xs font-mono uppercase tracking-wider text-white rounded-lg shadow-xl">
                            EXPLORE WORK
                          </span>
                        </div>
                      </div>

                      {/* Content panel */}
                      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <h4 className="text-base font-semibold tracking-tight text-white group-hover:text-violet-400 transition-colors font-display">
                            {proj.title}
                          </h4>
                          
                          <div className="text-zinc-400 text-xs leading-relaxed font-sans">
                            <p className="inline">{summaryText}</p>
                            {proj.description.length > 90 && (
                              <button
                                id={`desc-button-${cardId}`}
                                onClick={(e) => toggleCardDesc(cardId, e)}
                                className="inline ml-1 text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors uppercase tracking-wider underline cursor-pointer"
                              >
                                {isExpanded ? 'Less' : 'More'}
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs font-mono pt-3 border-t border-zinc-800/80">
                          <span className="text-zinc-500 uppercase tracking-widest">{proj.mediaList.length} FILE VIEWS</span>
                          <span className="text-violet-400 font-semibold flex items-center gap-1 group-hover:underline">
                            LAUNCH GALLERY
                            <Icons.ChevronRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* VIEW 5: CONTACT SCREEN */}
        {currentTab === 'contact' && (
          <section id="section-contact" className="max-w-2xl mx-auto space-y-10 animate-fade-in">
            <div className="space-y-4 text-center">
              <span className="text-xs font-mono tracking-widest text-violet-400 uppercase bg-violet-950/30 px-3 py-1 rounded-full">
                LET'S COLLABORATE
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-display tracking-tight text-white uppercase">
                GET IN TOUCH FOR CUSTOM ART
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed">
                Need customized banner artwork, Twitch design panels, YouTube templates, or premium cinematic promotional edits? Reach out on our social channels directly and let's bring your creative dream to life.
              </p>
              <div className="w-12 h-1 bg-violet-500 mx-auto rounded-full" />
            </div>

            {/* Social card linkages with logo anchors */}
            <div id="contact-action-grid" className="space-y-4">
              
              {/* Instagram link */}
              <a
                id="contact-instagram-row"
                href="https://ig.me/m/umangcreation.ig"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-900/50 hover:from-pink-950/20 hover:to-violet-950/20 border border-zinc-800 hover:border-pink-500/50 transition-all duration-300 group shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-pink-600/10 border border-pink-500/30 rounded-xl text-pink-400 group-hover:scale-110 transition-transform">
                    {/* Instagram logo via simple clean structure */}
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-white tracking-tight">Instagram Direct</span>
                    <span className="block text-xs text-zinc-500 font-mono">ig.me/m/umangcreation.ig</span>
                  </div>
                </div>
                <Icons.ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
              </a>

              {/* Telegram link */}
              <a
                id="contact-telegram-row"
                href="https://t.me/umangcreation_tg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-900/50 hover:from-sky-950/20 hover:to-zinc-900 border border-zinc-800 hover:border-sky-500/50 transition-all duration-300 group shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sky-600/10 border border-sky-500/30 rounded-xl text-sky-400 group-hover:scale-110 transition-transform">
                    <Icons.Send className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-white tracking-tight">Telegram Channel & Chat</span>
                    <span className="block text-xs text-zinc-500 font-mono">t.me/umangcreation_tg</span>
                  </div>
                </div>
                <Icons.ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
              </a>

              {/* Email direct */}
              <a
                id="contact-email-row"
                href="mailto:umang@internet.ru"
                className="flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-zinc-900 to-zinc-900/50 hover:from-violet-950/20 hover:to-zinc-900 border border-zinc-800 hover:border-violet-500/50 transition-all duration-300 group shadow-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-violet-600/10 border border-violet-500/30 rounded-xl text-violet-400 group-hover:scale-110 transition-transform">
                    <Icons.Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-white tracking-tight">Email Inbox</span>
                    <span className="block text-xs text-zinc-500 font-mono">umang@internet.ru</span>
                  </div>
                </div>
                <Icons.ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
              </a>

            </div>

            {/* Custom Interactive Inquiries visual badge */}
            <div className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-center">
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                📨 App links on mobile will automatically route and open Instagram and Telegram applications instantly, if installed. For custom banner size inquiries, feel free to submit complete details of your channel handle!
              </p>
            </div>
          </section>
        )}

      </main>

      {/* FOOTER & SECURITY ENTRANCE GATE */}
      <footer id="portfolio-main-footer" className="mt-auto border-t border-zinc-900/80 bg-zinc-950 p-6 sm:p-8 text-center text-xs font-mono text-zinc-500 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-7xl mx-auto px-4">
          <p>© 2026 Umang Creation. All design assets reserved.</p>
          
          <div className="flex gap-4">
            {/* Secure Admin Portal Entrance Link */}
            <button
              id="footer-btn-admin-gate"
              onClick={() => setCurrentTab('admin')}
              className="px-3 py-1 bg-zinc-900 hover:bg-zinc-850 hover:text-white border border-zinc-800 hover:border-zinc-700 transition-colors rounded-lg flex items-center gap-1.5 cursor-pointer text-[10px]"
              title="Secure gateway for content curator login"
            >
              <Icons.Shield className="w-3.5 h-3.5 text-violet-500" />
              ADMIN CONSOLE
            </button>

            <button
              id="footer-btn-backtop"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="text-zinc-500 hover:text-white transition-colors text-[10px] uppercase tracking-wider cursor-pointer"
            >
              BACK TO TOP ↑
            </button>
          </div>
        </div>
      </footer>

      {/* RENDER DETAILED PRESENTATION OVERLAY (FLIPKART/AMAZON GALLERY) */}
      {selectedProject && (
        <ProjectDetailModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

    </div>
  );
}
