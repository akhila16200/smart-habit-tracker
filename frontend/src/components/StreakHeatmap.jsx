import React, { useRef, useState } from 'react';
import { Activity, Download } from 'lucide-react';
import { useHabits } from '../context/HabitContext';
import html2canvas from 'html2canvas';

export default function StreakHeatmap() {
  const { analytics } = useHabits();
  const heatmapRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  if (!analytics || !analytics.heatmap) return null;

  const heatmap = analytics.heatmap;

  const handleExportImage = async () => {
    if (!heatmapRef.current) return;
    try {
      setExporting(true);
      const canvas = await html2canvas(heatmapRef.current, {
        backgroundColor: '#090D16',
        scale: 2,
        logging: false
      });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `habitpulse-consistency-heatmap-${new Date().toISOString().split('T')[0]}.png`;
      link.click();
    } catch (err) {
      console.error('Heatmap export error:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      ref={heatmapRef}
      className="glass-panel"
      style={{ padding: '20px', marginBottom: '28px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={18} color="var(--accent-emerald)" />
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1rem', fontWeight: 700 }}>
            30-Day Consistency Heatmap
          </h3>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Heatmap Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Less</span>
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(255, 255, 255, 0.05)' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.35)' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(16, 185, 129, 0.65)' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '2px', background: 'rgba(16, 185, 129, 1.0)' }} />
            <span>More</span>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportImage}
            disabled={exporting}
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
            title="Download high-resolution image of your consistency heatmap"
          >
            <Download size={12} />
            {exporting ? 'Exporting...' : 'Export PNG'}
          </button>
        </div>
      </div>

      <div className="heatmap-grid">
        {heatmap.map((cell) => (
          <div
            key={cell.date}
            className={`heatmap-cell level-${cell.level}`}
            title={`${cell.date}: ${cell.count} check-ins`}
          />
        ))}
      </div>
    </div>
  );
}
