import React, { useState, useEffect } from 'react';
import { 
  Lock, LogIn, Plus, Trash2, Save, LogOut, CheckCircle, Database, Film, Image as ImgIcon, Loader2, ArrowLeft, RefreshCw 
} from 'lucide-react';
import { 
  signInWithPopup, signInWithEmailAndPassword, signOut, onAuthStateChanged, User 
} from 'firebase/auth';
import { 
  collection, getDocs, addDoc, deleteDoc, doc, updateDoc, writeBatch, serverTimestamp 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError } from '../firebase';
import { Project, ProjectMedia, OperationType } from '../types';
import { DEFAULT_PROJECTS, DEFAULT_SKILLS } from '../data';

interface AdminPanelProps {
  onBack: () => void;
  onRefreshData: () => void;
}

export default function AdminPanel({ onBack, onRefreshData }: AdminPanelProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Project lists for editing/deleting
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [listLoading, setListLoading] = useState(false);

  // Seeding state indicators
  const [isSeeding, setIsSeeding] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Design');
  const [mediaList, setMediaList] = useState<ProjectMedia[]>([{ type: 'image', url: '' }]);

  // Required Admin Email constraint
  const EXPECTED_ADMIN = "umangsattawan@gmail.com";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthLoading(false);
      if (user && user.email === EXPECTED_ADMIN) {
        fetchAdminProjects();
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAdminProjects = async () => {
    setListLoading(true);
    try {
      const q = await getDocs(collection(db, 'projects'));
      const projs: Project[] = [];
      q.forEach((docSnap) => {
        const d = docSnap.data();
        projs.push({
          id: docSnap.id,
          title: d.title || '',
          description: d.description || '',
          category: d.category || 'Design',
          mediaList: d.mediaList || [],
          createdAt: d.createdAt
        });
      });
      setProjectsList(projs);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user.email !== EXPECTED_ADMIN) {
        setErrorMsg(`Access Denied: You are authenticated as ${res.user.email}. Only ${EXPECTED_ADMIN} can login to administrator panel.`);
        await signOut(auth);
      } else {
        setSuccessMsg("Welcome Back Curator! Successfully Authenticated.");
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed google credentials lookup");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail || !adminPassword) {
      setErrorMsg("Please type email and password.");
      return;
    }
    if (adminEmail !== EXPECTED_ADMIN) {
      setErrorMsg(`Access Denied: Custom email must be ${EXPECTED_ADMIN}`);
      return;
    }
    setErrorMsg('');
    try {
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      setSuccessMsg("Logged in successfully!");
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid Email or Password credentials");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setSuccessMsg("Signed out successfully.");
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Fail on session destruction");
    }
  };

  // Seeding Initial default data for presentation completeness
  const handleSeedDatabase = async () => {
    setIsSeeding(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const pCol = collection(db, 'projects');
      const sCol = collection(db, 'skills');

      const batch = writeBatch(db);

      // Seed core skills
      for (const skill of DEFAULT_SKILLS) {
        const sDoc = doc(collection(db, 'skills'));
        batch.set(sDoc, skill);
      }

      // Seed projects
      for (const proj of DEFAULT_PROJECTS) {
        const pDoc = doc(collection(db, 'projects'));
        batch.set(pDoc, {
          ...proj,
          createdAt: serverTimestamp()
        });
      }

      await batch.commit();
      setSuccessMsg("Seeded dynamic database portfolio beautifully in 1-click!");
      fetchAdminProjects();
      onRefreshData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Seeding failed. Ensure your Firestore DB is provisioned and has write accessibility.");
    } finally {
      setIsSeeding(false);
    }
  };

  // Media List Form Builders
  const handleAddMediaRow = () => {
    setMediaList([...mediaList, { type: 'image', url: '' }]);
  };

  const handleRemoveMediaRow = (index: number) => {
    if (mediaList.length === 1) return;
    setMediaList(mediaList.filter((_, idx) => idx !== index));
  };

  const handleMediaChange = (index: number, key: keyof ProjectMedia, value: string) => {
    const updated = [...mediaList];
    updated[index] = { ...updated[index], [key]: value };
    setMediaList(updated);
  };

  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) {
      setErrorMsg("Please fill in project title & description details.");
      return;
    }

    // Filter empty media URLs
    const sanitizedMedia = mediaList.filter(item => item.url.trim() !== '');
    if (sanitizedMedia.length === 0) {
      setErrorMsg("Please provide at least 1 image or video URL link.");
      return;
    }

    setIsSubmitLoading(true);
    setErrorMsg('');
    try {
      const payload = {
        title,
        description,
        category,
        mediaList: sanitizedMedia,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'projects'), payload);
      setSuccessMsg("Creative Project successfully added to database!");
      
      // Reset forms
      setTitle('');
      setDescription('');
      setCategory('Design');
      setMediaList([{ type: 'image', url: '' }]);
      
      fetchAdminProjects();
      onRefreshData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.WRITE, 'projects');
      } catch (diagnosedError: any) {
        setErrorMsg(diagnosedError.message || "Rejected by Security Rules");
      }
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDeleteProject = async (projId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setErrorMsg('');
    try {
      await deleteDoc(doc(db, 'projects', projId));
      setSuccessMsg("Project deleted successfully!");
      fetchAdminProjects();
      onRefreshData();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `projects/${projId}`);
      } catch (diagnosedError: any) {
        setErrorMsg(diagnosedError.message || "Failed to delete project");
      }
    }
  };

  // Helper validation boolean
  const isAuthorizedAdmin = currentUser && currentUser.email === EXPECTED_ADMIN;

  return (
    <div id="admin-panel-canvas" className="min-h-screen bg-zinc-950 text-zinc-100 p-6 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Brand Header */}
        <div id="admin-top-nav" className="flex items-center justify-between border-b border-zinc-800 pb-5">
          <button
            id="admin-btn-back"
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-mono text-zinc-400 hover:text-white transition-colors uppercase tracking-wider group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            BACK TO PORTFOLIO
          </button>
          
          <div className="text-right">
            <h1 className="text-xl font-bold font-display tracking-tight text-white uppercase bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
              UMANG ADMIN PANEL
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono tracking-widest">
              SECURE MANAGEMENT CONSOLE
            </p>
          </div>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div id="admin-error-box" className="p-4 bg-red-950/40 border border-red-800/80 rounded-xl text-red-300 text-xs font-mono break-all whitespace-pre-wrap leading-relaxed animate-pulse">
            ✕ ERROR DETECTED: {errorMsg}
          </div>
        )}
        {successMsg && (
          <div id="admin-success-box" className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs font-mono leading-relaxed">
            ✓ RECONCILIATION SUCCESSFUL: {successMsg}
          </div>
        )}

        {/* Authenticating Loading State */}
        {authLoading ? (
          <div className="flex items-center justify-center p-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <span className="ml-3 font-mono text-sm tracking-widest text-zinc-400">VERIFYING DIGITAL TOKENS...</span>
          </div>
        ) : !isAuthorizedAdmin ? (
          
          /* LOGIN BLOCK - Google + Email Provider */
          <div id="admin-login-shield" className="max-w-md mx-auto p-8 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 rounded-full bg-zinc-950 border border-zinc-800 text-violet-500 mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-medium text-white tracking-tight">PROTECTED CRYPTOGRAPHY SCREEN</h3>
              <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                Authorized credentials lookup is mandatory. Logging in automatically registers verify keys to bypass client firestore constraints.
              </p>
            </div>

            {/* Google Authentication Method */}
            <button
              id="btn-auth-google"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-zinc-100 text-zinc-900 text-xs font-mono font-semibold uppercase rounded-xl transition-all shadow-md cursor-pointer"
            >
              {/* Google logo using simple SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              AUTHENTICATE WITH GOOGLE
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-zinc-800"></div>
              <span className="px-3 text-[10px] text-zinc-500 font-mono tracking-widest uppercase">OR EMAIL PASSWORD</span>
              <div className="flex-1 border-t border-zinc-800"></div>
            </div>

            {/* Email & Password Authentication Method */}
            <form id="form-auth-email" onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] text-zinc-400 font-mono tracking-wider uppercase mb-1">EMAIL ID</label>
                <input
                  id="auth-email-input"
                  type="email"
                  placeholder="umangsattawan@gmail.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 focus:outline-none transition-colors text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 font-mono tracking-wider uppercase mb-1">PASSWORD SECURE KEY</label>
                <input
                  id="auth-password-input"
                  type="password"
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-sm focus:border-violet-500 focus:outline-none transition-colors text-white font-mono"
                />
              </div>

              <button
                id="btn-auth-email-submit"
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-semibold uppercase rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                SIGN IN SECURELY
              </button>
            </form>

            <p className="text-[10px] text-zinc-500 text-center font-mono tracking-wider uppercase pt-2">
              MUST authenticate as <span className="text-violet-400 underline">{EXPECTED_ADMIN}</span>
            </p>
          </div>
        ) : (
          
          /* ADMIN AUTHORIZED DASHBOARD ACCESS */
          <div id="admin-dashboard-hud" className="space-y-8 animate-fade-in">
            {/* User Session Profile Header */}
            <div id="admin-profile-hud" className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-zinc-900 border border-zinc-800/80 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold font-display uppercase tracking-wide">
                  {currentUser.email?.slice(0, 2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Curator Session Active</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-xs font-mono text-zinc-400">{currentUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* 1-Click Backup database seeding for mock visualization */}
                <button
                  id="btn-admin-seed-database"
                  onClick={handleSeedDatabase}
                  disabled={isSeeding}
                  className="px-4 py-2 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-violet-950 hover:to-zinc-900 border border-zinc-700/80 hover:border-violet-700/80 text-zinc-200 text-xs font-mono rounded-xl font-medium tracking-wide flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  title="Wipes cold states, writing standard custom projects + skills into Firestore."
                >
                  {isSeeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4 text-fuchsia-400" />}
                  SEED PRESETS
                </button>

                <button
                  id="btn-admin-logout"
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-950/30 hover:bg-red-950/60 border border-red-900/50 hover:border-red-800 text-red-300 text-xs font-mono rounded-xl font-medium tracking-wide flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  LOGOUT
                </button>
              </div>
            </div>

            {/* Primary Grid: Add New Project Portfolio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Add form column */}
              <div id="col-form-project" className="md:col-span-2 space-y-6">
                <div id="form-container-box" className="p-6 md:p-8 rounded-2xl bg-zinc-900 border border-zinc-800/80 shadow-2xl space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold font-display tracking-tight text-white mb-1 uppercase">PUBLISH RECENT CREATION</h3>
                    <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                      Wired to Firebase! These records will sync immediately across all connected displays without refreshing.
                    </p>
                  </div>

                  <form id="form-project-creation" onSubmit={handleSubmitProject} className="space-y-6">
                    <div>
                      <label className="block text-[10px] text-zinc-400 font-mono tracking-wider uppercase mb-1.5">PROJECT TITLE</label>
                      <input
                        id="proj-title-input"
                        type="text"
                        placeholder="e.g. Retro Cyber Wave Cover Arts"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-violet-500 focus:outline-none transition-colors rounded-xl text-sm text-white"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-zinc-400 font-mono tracking-wider uppercase mb-1.5">CATEGORY VALUE</label>
                        <select
                          id="proj-category-select"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-violet-500 focus:outline-none transition-colors rounded-xl text-sm text-zinc-300 cursor-pointer"
                        >
                          <option value="Design">Design</option>
                          <option value="Banner">Banner</option>
                          <option value="Branding">Branding</option>
                          <option value="Production">Production</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] text-zinc-400 font-mono tracking-wider uppercase mb-1.5">CREATIVE DESCRIPTION</label>
                      <textarea
                        id="proj-description-textarea"
                        rows={4}
                        placeholder="Provide details of your custom graphics, lighting layers, poster visual themes..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 focus:border-violet-500 focus:outline-none transition-colors rounded-xl text-sm text-white resize-none leading-relaxed"
                        required
                      />
                    </div>

                    {/* Dynamic Media URL rail */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
                          MEDIA ASSET SLOTS ({mediaList.length})
                        </label>
                        <button
                          id="btn-add-media-slot"
                          type="button"
                          onClick={handleAddMediaRow}
                          className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 hover:bg-zinc-700/80 text-violet-300 hover:text-white text-[10px] font-mono rounded-lg transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          ADD MULTIPLE MEDIA
                        </button>
                      </div>

                      <div className="space-y-3">
                        {mediaList.map((media, idx) => (
                          <div
                            key={idx}
                            id={`media-form-row-${idx}`}
                            className="flex items-center gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800/60 animate-fade-in"
                          >
                            <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
                              <button
                                type="button"
                                onClick={() => handleMediaChange(idx, 'type', 'image')}
                                className={`p-1.5 rounded-md ${
                                  media.type === 'image' 
                                    ? 'bg-violet-600 text-white' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                                title="Set as Image URL"
                              >
                                <ImgIcon className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMediaChange(idx, 'type', 'video')}
                                className={`p-1.5 rounded-md ${
                                  media.type === 'video' 
                                    ? 'bg-violet-600 text-white' 
                                    : 'text-zinc-500 hover:text-zinc-300'
                                }`}
                                title="Set as Playable Video"
                              >
                                <Film className="w-4 h-4" />
                              </button>
                            </div>

                            <input
                              id={`media-input-url-${idx}`}
                              type="url"
                              placeholder={
                                media.type === 'video' 
                                  ? 'https://commondatastorage.googleapis.com/.../Sintel.mp4' 
                                  : 'https://images.unsplash.com/.../image.jpg'
                              }
                              value={media.url}
                              onChange={(e) => handleMediaChange(idx, 'url', e.target.value)}
                              className="flex-1 bg-transparent border-0 focus:ring-0 text-xs text-white font-mono placeholder-zinc-600 focus:outline-none"
                              required
                            />

                            {mediaList.length > 1 && (
                              <button
                                id={`btn-delete-media-slot-${idx}`}
                                type="button"
                                onClick={() => handleRemoveMediaRow(idx)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-900 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      id="btn-publish-project-submit"
                      type="submit"
                      disabled={isSubmitLoading}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-mono text-sm font-semibold tracking-wider uppercase rounded-xl transition-all shadow-xl active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          UPLOADING ARCHIVE...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          PUBLISH WORK TO PORTFOLIO
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Side database view list column */}
              <div id="col-list-project" className="space-y-6">
                <div id="quick-refresh-row" className="flex items-center justify-between px-1">
                  <h4 className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                    SYNCED ARCHIVES ({projectsList.length})
                  </h4>
                  <button
                    id="btn-admin-refresh-list"
                    onClick={fetchAdminProjects}
                    className="p-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-all cursor-pointer"
                    title="Fetch fresh data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${listLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {listLoading ? (
                  <div className="flex flex-col items-center justify-center p-10 bg-zinc-900 border border-zinc-800/80 rounded-2xl">
                    <Loader2 className="w-6 h-6 text-violet-500 animate-spin mb-2" />
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wide">Polling Database...</span>
                  </div>
                ) : projectsList.length === 0 ? (
                  <div className="p-6 bg-zinc-900 border border-zinc-800/80 rounded-2xl text-center space-y-3">
                    <p className="text-xs font-mono text-zinc-500 uppercase leading-relaxed">
                      NO LIVE PROJECTS DETECTED IN FIRESTORE
                    </p>
                    <p className="text-[10px] text-zinc-400 font-sans leading-relaxed">
                      Your database might be empty. Click on <strong>SEED PRESETS</strong> button above to load gorgeous sample creations beautifully.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                    {projectsList.map((proj) => (
                      <div
                        key={proj.id}
                        id={`admin-proj-card-${proj.id}`}
                        className="p-4 bg-zinc-900 border border-zinc-800/80 rounded-2xl flex items-start justify-between gap-3 hover:border-zinc-700/80 hover:bg-zinc-900/80 transition-all"
                      >
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <span className="text-[9px] font-mono px-2 py-0.5 bg-zinc-800 border border-zinc-700/80 text-violet-400 rounded uppercase">
                            {proj.category}
                          </span>
                          <h5 className="text-sm font-semibold text-white truncate leading-snug">
                            {proj.title}
                          </h5>
                          <p className="text-[10px] text-zinc-500 font-mono leading-none">
                            {proj.mediaList.length} media item(s) cached
                          </p>
                        </div>

                        <button
                          id={`btn-delete-proj-${proj.id}`}
                          onClick={() => proj.id && handleDeleteProject(proj.id)}
                          className="p-2 bg-red-950/20 hover:bg-red-950/50 border border-red-900/30 hover:border-red-800 rounded-xl text-red-400 hover:text-red-300 transition-colors cursor-pointer flex-shrink-0"
                          title="Delete Project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
