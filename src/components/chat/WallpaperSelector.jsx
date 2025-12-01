import React, { useState, useEffect } from 'react';
import { useSupabase } from '../../contexts/SupabaseContext';

const WallpaperSelector = ({ isVisible, onClose, onWallpaperSelect }) => {
  const { supabase } = useSupabase();
  const [wallpapers, setWallpapers] = useState([]);

  useEffect(() => {
    if (isVisible) {
      loadWallpapers();
    }
  }, [isVisible]);

  const loadWallpapers = async () => {
    try {
      const { data, error } = await supabase
        .from('wallpapers')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Add default gradient as first option
      const defaultGradient = {
        id: 'default-gradient',
        name: 'Default Gradient',
        url: 'default-gradient' // Special identifier
      };

      setWallpapers([defaultGradient, ...(data || [])]);
    } catch (error) {
      console.error('Error loading wallpapers:', error);
    }
  };

  const handleWallpaperSelect = (wallpaper) => {
    onWallpaperSelect(wallpaper);
    onClose();
  };

  const handleRemoveWallpaper = () => {
    onWallpaperSelect(null);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="wallpaper-selector-overlay" onClick={onClose}>
      <div className="wallpaper-selector" onClick={(e) => e.stopPropagation()}>
        <div className="wallpaper-header">
          <h3>Choose Wallpaper</h3>
          <button className="close-wallpaper-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="wallpaper-grid">
          {wallpapers.map(wallpaper => (
            <div
              key={wallpaper.id}
              className={`wallpaper-item ${wallpaper.id === 'default-gradient' ? 'default-gradient-bg' : ''}`}
              style={wallpaper.id !== 'default-gradient' ? { backgroundImage: `url(${wallpaper.url})` } : {}}
              onClick={() => handleWallpaperSelect(wallpaper.id === 'default-gradient' ? 'default-gradient' : wallpaper)}
              title={wallpaper.name}
            />
          ))}
        </div>
        <div className="wallpaper-actions">
          <button className="wallpaper-action-btn" onClick={handleRemoveWallpaper}>
            <i className="fas fa-trash"></i> Remove Wallpaper
          </button>
        </div>
      </div>
    </div>
  );
};

export default WallpaperSelector;