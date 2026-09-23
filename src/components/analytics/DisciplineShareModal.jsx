import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  Flame,
  Activity,
  CheckCircle2,
  Shield
} from 'lucide-react';

export const DisciplineShareModal = ({
  isOpen,
  onClose,
  disciplineScore = 85,
  operatingArchetype = 'The Systematic Compounder',
  archetypeIcon = '🛡️',
  topStreak = 7,
  totalActiveMins = 180,
  tasksCompleted = 14,
  weekBadge = 'W39'
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);

  if (!isOpen) return null;

  const shareSummaryText = [
    '⚡ My PULSE Operating Score (' + weekBadge + '):',
    archetypeIcon + ' Archetype: ' + operatingArchetype,
    '🛡️ Discipline Rating: ' + disciplineScore + '%',
    '🔥 Top Habit Streak: ' + topStreak + ' days',
    '💪 Physical Vitality: ' + totalActiveMins + ' active mins',
    '✅ Executed Tasks: ' + tasksCompleted,
    '',
    'Tracking life, habits & wealth on Pulse:',
    'https://pulse-life-tracker.vercel.app'
  ].join('\n');

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(shareSummaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  // Generate crisp 1080x1080 image on HTML5 Canvas
  const generateCanvasImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    const width = 1080;
    const height = 1080;
    canvas.width = width;
    canvas.height = height;

    // 1. Dark Gradient Background
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#090d16');
    bgGrad.addColorStop(0.5, '#0f172a');
    bgGrad.addColorStop(1, '#05070c');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Ambient Glow Spheres
    const glow1 = ctx.createRadialGradient(250, 250, 20, 250, 250, 450);
    glow1.addColorStop(0, 'rgba(99, 102, 241, 0.22)');
    glow1.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    const glow2 = ctx.createRadialGradient(850, 800, 20, 850, 800, 400);
    glow2.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
    glow2.addColorStop(1, 'rgba(16, 185, 129, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);

    // 3. Card Container Box
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(80, 80, 920, 920, 40);
    ctx.stroke();

    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.fill();
    ctx.restore();

    // 4. Brand Header
    ctx.fillStyle = '#6366f1';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('P U L S E', 140, 175);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('DAILY OPERATING SYSTEM', 320, 175);

    ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
    ctx.beginPath();
    ctx.roundRect(830, 135, 120, 45, 12);
    ctx.fill();
    ctx.strokeStyle = 'rgba(99, 102, 241, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = '#818cf8';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(weekBadge, 890, 165);
    ctx.textAlign = 'left';

    // 5. Archetype Badge
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(archetypeIcon + ' ' + operatingArchetype.toUpperCase(), 140, 260);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '900 68px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Discipline Score', 140, 345);

    // 6. Huge Radial / Score Display
    ctx.fillStyle = '#10b981';
    ctx.font = '900 130px monospace';
    ctx.fillText(disciplineScore + '%', 140, 490);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('Consistency & High-Performance Output', 145, 545);

    // 7. Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(140, 600);
    ctx.lineTo(940, 600);
    ctx.stroke();

    // 8. 3 Stat Pillars
    const stats = [
      { label: 'TOP STREAK', val: topStreak + ' Days', sub: 'Habit Consistency' },
      { label: 'ACTIVE OUTPUT', val: totalActiveMins + ' Mins', sub: 'Physical Vitality' },
      { label: 'TASKS DONE', val: tasksCompleted + ' Completed', sub: 'Execution Velocity' }
    ];

    stats.forEach((s, idx) => {
      const x = 140 + idx * 280;
      // box
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.beginPath();
      ctx.roundRect(x, 640, 240, 180, 24);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(s.label, x + 20, 680);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(s.val, x + 20, 740);

      ctx.fillStyle = '#64748b';
      ctx.font = '500 18px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(s.sub, x + 20, 785);
    });

    // 9. Branded Footer
    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('PULSE LIFE TRACKER', 140, 920);

    ctx.fillStyle = '#818cf8';
    ctx.font = '500 20px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('pulse-life-tracker.vercel.app', 940, 920);
    ctx.textAlign = 'left';

    return canvas;
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      const canvas = generateCanvasImage();
      if (!canvas) {
        setDownloading(false);
        return;
      }
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'pulse-discipline-' + weekBadge + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloading(false);
    }, 100);
  };

  const handleNativeShare = async () => {
    const canvas = generateCanvasImage();
    if (navigator.share) {
      try {
        if (canvas && canvas.toBlob) {
          canvas.toBlob(async (blob) => {
            if (blob && navigator.canShare && navigator.canShare({ files: [new File([blob], 'pulse-discipline.png', { type: 'image/png' })] })) {
              const file = new File([blob], 'pulse-discipline.png', { type: 'image/png' });
              await navigator.share({
                title: 'My Pulse Discipline Score',
                text: shareSummaryText,
                files: [file]
              });
            } else {
              await navigator.share({
                title: 'My Pulse Discipline Score',
                text: shareSummaryText,
                url: 'https://pulse-life-tracker.vercel.app'
              });
            }
          });
        } else {
          await navigator.share({
            title: 'My Pulse Discipline Score',
            text: shareSummaryText,
            url: 'https://pulse-life-tracker.vercel.app'
          });
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          handleCopyText();
        }
      }
    } else {
      handleCopyText();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel-dark max-w-lg w-full rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-5 shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Share Proof of Work
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Celebrate your consistency and share your verified weekly discipline card
            </p>
          </div>
        </div>

        {/* Preview Card */}
        <div className="rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white border border-slate-700/60 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-indigo-400 tracking-wider">PULSE · {weekBadge}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
              {archetypeIcon} {operatingArchetype}
            </span>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Weekly Discipline Score</span>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black font-mono text-emerald-400">{disciplineScore}%</span>
              <span className="text-xs text-emerald-300/80 font-medium">Verified Active Consistency</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-mono">Streak</p>
              <p className="text-sm font-bold text-amber-400">{topStreak}d</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-mono">Activity</p>
              <p className="text-sm font-bold text-cyan-400">{totalActiveMins}m</p>
            </div>
            <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
              <p className="text-[10px] text-slate-400 font-mono">Tasks</p>
              <p className="text-sm font-bold text-purple-400">{tasksCompleted}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
            <span>Pulse Life Tracker</span>
            <span className="font-mono text-indigo-400">pulse-life-tracker.vercel.app</span>
          </div>
        </div>

        {/* Hidden Canvas for Generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Rendering...' : 'Download PNG'}</span>
          </button>

          <button
            onClick={handleNativeShare}
            className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-700 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Share Card</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-800 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-500" />
                <span className="text-emerald-500">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Text</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
