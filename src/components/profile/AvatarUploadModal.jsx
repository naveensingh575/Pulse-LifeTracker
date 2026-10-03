import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Upload,
  Camera,
  Check,
  User,
  RotateCcw,
  Smile,
  ZoomIn
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { triggerHaptic } from '../../utils/hapticUtils';

// Curated Person & Activity Avatars
const PERSON_AVATARS = [
  { emoji: '🧘', label: 'Meditator', bg: 'from-emerald-500 to-teal-700' },
  { emoji: '🏋️', label: 'Lifter', bg: 'from-amber-500 to-orange-700' },
  { emoji: '🏃', label: 'Runner', bg: 'from-blue-500 to-indigo-700' },
  { emoji: '🚴', label: 'Cyclist', bg: 'from-cyan-500 to-blue-700' },
  { emoji: '🧗', label: 'Climber', bg: 'from-orange-500 to-red-700' },
  { emoji: '🧑‍💻', label: 'Engineer', bg: 'from-indigo-500 to-purple-700' },
  { emoji: '🧑‍🔬', label: 'Scientist', bg: 'from-violet-500 to-purple-800' },
  { emoji: '🧑‍🎨', label: 'Creator', bg: 'from-pink-500 to-rose-700' },
  { emoji: '🧑‍🚀', label: 'Astronaut', bg: 'from-purple-600 to-indigo-900' },
  { emoji: '🧑‍⚕️', label: 'Wellness', bg: 'from-teal-500 to-emerald-800' },
  { emoji: '🏊', label: 'Swimmer', bg: 'from-sky-500 to-blue-700' },
  { emoji: '🥋', label: 'Focus', bg: 'from-rose-500 to-red-800' }
];

// Curated Animal Spirit Avatars
const ANIMAL_AVATARS = [
  { emoji: '🦊', label: 'Fox', bg: 'from-orange-500 to-amber-700' },
  { emoji: '🦁', label: 'Lion', bg: 'from-amber-500 to-yellow-700' },
  { emoji: '🐯', label: 'Tiger', bg: 'from-amber-600 to-orange-800' },
  { emoji: '🐺', label: 'Wolf', bg: 'from-slate-600 to-indigo-900' },
  { emoji: '🦅', label: 'Eagle', bg: 'from-sky-600 to-indigo-800' },
  { emoji: '🦉', label: 'Owl', bg: 'from-indigo-600 to-violet-900' },
  { emoji: '🐼', label: 'Panda', bg: 'from-emerald-600 to-slate-900' },
  { emoji: '🐨', label: 'Koala', bg: 'from-teal-600 to-slate-800' },
  { emoji: '🐬', label: 'Dolphin', bg: 'from-cyan-500 to-blue-700' },
  { emoji: '🦄', label: 'Unicorn', bg: 'from-fuchsia-500 to-pink-700' },
  { emoji: '🐻', label: 'Bear', bg: 'from-amber-800 to-stone-900' },
  { emoji: '🐆', label: 'Cheetah', bg: 'from-yellow-500 to-amber-700' }
];

// Palette for Initial Badges
const PALETTES = [
  { name: 'Indigo', from: '#6366f1', to: '#4f46e5' },
  { name: 'Emerald', from: '#10b981', to: '#059669' },
  { name: 'Amber', from: '#f59e0b', to: '#d97706' },
  { name: 'Rose', from: '#f43f5e', to: '#e11d48' },
  { name: 'Purple', from: '#a855f7', to: '#9333ea' },
  { name: 'Cyan', from: '#06b6d4', to: '#0891b2' },
  { name: 'Dark Slate', from: '#334155', to: '#0f172a' }
];

// Generate an SVG data URL for Emoji with gradient background
const makeEmojiSvgDataUrl = (emoji, fromColor, toColor) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${fromColor}" />
        <stop offset="100%" stop-color="${toColor}" />
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="48" fill="url(#bg)" />
    <text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle" font-size="46" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Generate an SVG data URL for Initial with gradient background
const makeInitialSvgDataUrl = (initial, fromColor, toColor) => {
  const char = (initial || 'P').trim().charAt(0).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${fromColor}" />
        <stop offset="100%" stop-color="${toColor}" />
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="48" fill="url(#bg)" />
    <text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="42" font-weight="700">${char}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Color mapping lookup for gradient classes
const GRADIENT_COLORS = {
  'from-emerald-500 to-teal-700': ['#10b981', '#0f766e'],
  'from-amber-500 to-orange-700': ['#f59e0b', '#c2410c'],
  'from-blue-500 to-indigo-700': ['#3b82f6', '#4338ca'],
  'from-cyan-500 to-blue-700': ['#06b6d4', '#1d4ed8'],
  'from-orange-500 to-red-700': ['#f97316', '#b91c1c'],
  'from-indigo-500 to-purple-700': ['#6366f1', '#7e22ce'],
  'from-violet-500 to-purple-800': ['#8b5cf6', '#6b21a8'],
  'from-pink-500 to-rose-700': ['#ec4899', '#be123c'],
  'from-purple-600 to-indigo-900': ['#9333ea', '#312e81'],
  'from-teal-500 to-emerald-800': ['#14b8a6', '#065f46'],
  'from-sky-500 to-blue-700': ['#0ea5e9', '#1d4ed8'],
  'from-rose-500 to-red-800': ['#f43f5e', '#991b1b'],
  'from-orange-500 to-amber-700': ['#f97316', '#b45309'],
  'from-amber-500 to-yellow-700': ['#f59e0b', '#a16207'],
  'from-amber-600 to-orange-800': ['#d97706', '#9a3412'],
  'from-slate-600 to-indigo-900': ['#475569', '#312e81'],
  'from-sky-600 to-indigo-800': ['#0284c7', '#3730a3'],
  'from-indigo-600 to-violet-900': ['#4f46e5', '#4c1d95'],
  'from-emerald-600 to-slate-900': ['#059669', '#0f172a'],
  'from-teal-600 to-slate-800': ['#0d9488', '#1e293b'],
  'from-fuchsia-500 to-pink-700': ['#d946ef', '#be185d'],
  'from-amber-800 to-stone-900': ['#92400e', '#1c1917'],
  'from-yellow-500 to-amber-700': ['#eab308', '#b45309']
};

export const AvatarUploadModal = ({ isOpen, onClose }) => {
  const { user, updateUserProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('presets'); // 'presets' | 'upload' | 'initials'
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || '');
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setSelectedAvatar(user?.avatar || '');
      setErrorMessage('');
      setShowZoomModal(false);
    }
  }, [isOpen, user?.avatar]);

  if (!isOpen) return null;

  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'P';

  // Process and compress uploaded image file using Canvas
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setErrorMessage('');
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 160; // 160x160 px produces high-density ~15KB WebP/JPEG
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          // Center-crop to square
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

          // Convert to compressed data URL
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.86);
          setSelectedAvatar(compressedDataUrl);
          triggerHaptic('light');
        } catch (err) {
          console.error('Image compression error:', err);
          setErrorMessage('Could not process image. Please try a different photo.');
        } finally {
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setErrorMessage('Failed to read image. Please try another file.');
        setIsProcessing(false);
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      setErrorMessage('Could not open file.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectEmojiAvatar = (item) => {
    const [from, to] = GRADIENT_COLORS[item.bg] || ['#6366f1', '#4f46e5'];
    const dataUrl = makeEmojiSvgDataUrl(item.emoji, from, to);
    setSelectedAvatar(dataUrl);
    setErrorMessage('');
    triggerHaptic('light');
  };

  const handleSelectInitialColor = (palette) => {
    const dataUrl = makeInitialSvgDataUrl(userInitial, palette.from, palette.to);
    setSelectedAvatar(dataUrl);
    setErrorMessage('');
    triggerHaptic('light');
  };

  const handleResetToDefault = () => {
    const defaultDataUrl = makeInitialSvgDataUrl(userInitial, '#6366f1', '#4f46e5');
    setSelectedAvatar(defaultDataUrl);
    setErrorMessage('');
    triggerHaptic('light');
  };

  const handleSave = async () => {
    if (!selectedAvatar) return;
    setIsSaving(true);
    try {
      await updateUserProfile({ avatar: selectedAvatar });
      triggerHaptic('success');
      onClose();
    } catch (err) {
      console.error('Save avatar error:', err);
      setErrorMessage(err.message || 'Failed to save avatar. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200 overflow-x-hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90dvh] sm:max-h-[90vh] min-w-0 overflow-x-hidden overscroll-x-none animate-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100"
      >
        
        {/* Pinned Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Customize Profile Avatar
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Choose a photo, activity, or animal avatar
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto overflow-x-hidden overscroll-x-none flex-1 min-w-0">

        {/* Live Preview Display */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative group">
            <button
              type="button"
              onClick={() => {
                if (selectedAvatar) setShowZoomModal(true);
              }}
              className={`w-20 h-20 rounded-full overflow-hidden ring-4 ring-indigo-500/30 shadow-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all duration-200 relative ${
                selectedAvatar ? 'cursor-pointer hover:ring-indigo-500 hover:scale-105 active:scale-95' : 'cursor-default'
              }`}
              title={selectedAvatar ? "Click to zoom in image" : "Profile Avatar Preview"}
              aria-label="Zoom in avatar photo"
            >
              {selectedAvatar ? (
                <img
                  src={selectedAvatar}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-slate-400" />
              )}

              {/* Hover zoom overlay indicator */}
              {selectedAvatar && (
                <div className="absolute inset-0 bg-slate-950/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                  <ZoomIn className="w-5 h-5 text-white drop-shadow-md" />
                </div>
              )}
            </button>
          </div>
          {selectedAvatar && (
            <button
              type="button"
              onClick={() => setShowZoomModal(true)}
              className="mt-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Click image to zoom in</span>
            </button>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Preset Avatars</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'upload'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('initials')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'initials'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <span>Initial Badge</span>
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
            {errorMessage}
          </div>
        )}

        {/* TAB 1: PRESET AVATARS (Person, Activities & Animals) */}
        {activeTab === 'presets' && (
          <div className="space-y-3.5">
            {/* Person & Activity Section */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Person & Activity Avatars
              </span>
              <div className="grid grid-cols-6 gap-2">
                {PERSON_AVATARS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSelectEmojiAvatar(item)}
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.bg} flex items-center justify-center text-xl shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer relative group`}
                    title={item.label}
                  >
                    <span>{item.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Animal Spirit Section */}
            <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Animal Avatars
              </span>
              <div className="grid grid-cols-6 gap-2">
                {ANIMAL_AVATARS.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleSelectEmojiAvatar(item)}
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.bg} flex items-center justify-center text-xl shadow-sm hover:scale-110 active:scale-95 transition-transform cursor-pointer relative group`}
                    title={item.label}
                  >
                    <span>{item.emoji}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UPLOAD PHOTO */}
        {activeTab === 'upload' && (
          <div className="space-y-3 py-2 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl border-2 border-dashed border-indigo-500/30 hover:border-indigo-500 bg-indigo-500/5 hover:bg-indigo-500/10 transition cursor-pointer flex flex-col items-center justify-center space-y-2 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {isProcessing ? 'Processing image...' : 'Click to upload photo'}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  PNG, JPG, or WEBP • Auto-compressed to lightweight avatar
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Your photo is stored securely with your profile and synchronized across all your devices.
            </p>
          </div>
        )}

        {/* TAB 3: INITIAL BADGE */}
        {activeTab === 'initials' && (
          <div className="space-y-3 py-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Select Background Gradient for '{userInitial}'
            </span>
            <div className="grid grid-cols-4 gap-2.5">
              {PALETTES.map((palette) => (
                <button
                  key={palette.name}
                  type="button"
                  onClick={() => handleSelectInitialColor(palette)}
                  style={{
                    background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`
                  }}
                  className="h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm hover:scale-105 active:scale-95 transition cursor-pointer"
                  title={palette.name}
                >
                  {userInitial}
                </button>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleResetToDefault}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default Style</span>
              </button>
            </div>
          </div>
        )}

        {/* Actions: Save & Cancel */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isSaving || isProcessing}
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isSaving ? (
              <span>Saving...</span>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Save Avatar</span>
              </>
            )}
          </button>
        </div>
        </div>

      </div>

      {/* Zoom / Lightbox Pop-up Modal */}
      {showZoomModal && selectedAvatar && (
        <div
          onClick={() => setShowZoomModal(false)}
          className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm sm:max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-200"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowZoomModal(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Close zoomed view"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Avatar Big Preview */}
            <div className="w-full flex items-center justify-center py-2">
              <div className="w-56 h-56 sm:w-64 sm:h-64 rounded-3xl overflow-hidden ring-4 ring-indigo-500/40 shadow-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <img
                  src={selectedAvatar}
                  alt="Zoomed Avatar Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="mt-3 space-y-1">
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Avatar Zoom Preview
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Full-size view of your profile image
              </p>
            </div>

            <div className="mt-5 w-full flex items-center justify-center">
              <button
                type="button"
                onClick={() => setShowZoomModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md transition cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
