import { Project, Skill } from './types';

export const DEFAULT_SKILLS: Skill[] = [
  {
    name: "Banner & Poster Design",
    displayIcon: "LayoutTemplate",
    rating: 95,
    category: "Design"
  },
  {
    name: "Social Media Creative Kits",
    displayIcon: "Palette",
    rating: 90,
    category: "Design"
  },
  {
    name: "Thumbnails & Cover Arts",
    displayIcon: "Sparkles",
    rating: 92,
    category: "Design"
  },
  {
    name: "Video Editing & Production",
    displayIcon: "Video",
    rating: 88,
    category: "Production"
  },
  {
    name: "Kinetic Motion Graphics",
    displayIcon: "Tv",
    rating: 85,
    category: "Production"
  },
  {
    name: "Brand Logo Identity",
    displayIcon: "PenTool",
    rating: 87,
    category: "Branding"
  }
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    title: "Vaporwave Horizon - Gaming Banner & Overlay Suite",
    description: "An intensive gaming media layout combining vaporwave sunset layouts, detailed wireframe patterns, and high-intensity typography. This suite includes fully-optimized visual templates for platforms with high visual fidelity.",
    category: "Banner",
    mediaList: [
      {
        type: 'image',
        url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200"
      },
      {
        type: 'video',
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
      },
      {
        type: 'image',
        url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200"
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    title: "Cyberpunk Edge - High-Performance Sneaker Poster",
    description: "A promotional design layout highlighting performance athletic wear through electric lighting, smoke particles, and stark neon glowing guides. Built for digital billboards and mobile screen previews with aggressive aesthetic depth.",
    category: "Design",
    mediaList: [
      {
        type: 'image',
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1200"
      },
      {
        type: 'image',
        url: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=1200"
      },
      {
        type: 'video',
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
      }
    ],
    createdAt: new Date().toISOString()
  },
  {
    title: "Aura - Premium Fragrance Dynamic Billboard",
    description: "A highly minimalistic luxury brand poster featuring elegant volumetric lens flares, physical misty overlays, and rich natural stone textures to showcase elite cosmetics clean and dynamically.",
    category: "Branding",
    mediaList: [
      {
        type: 'image',
        url: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=1200"
      },
      {
        type: 'video',
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      }
    ],
    createdAt: new Date().toISOString()
  }
];
