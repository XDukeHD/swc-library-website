'use client';

import { useState, useEffect } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { likeGameAction } from '@/lib/actions';

interface LikeButtonProps {
  gameId: string;
  initialLikes: number;
}

export default function LikeButton({ gameId, initialLikes }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const likedGames = JSON.parse(localStorage.getItem('swc_liked_games') || '[]');
    if (likedGames.includes(gameId)) {
      setHasLiked(true);
    }
  }, [gameId]);

  const handleLike = async () => {
    if (hasLiked || loading) return;
    setLoading(true);
    try {
      const newLikes = await likeGameAction(gameId);
      setLikes(newLikes);
      setHasLiked(true);
      const likedGames = JSON.parse(localStorage.getItem('swc_liked_games') || '[]');
      likedGames.push(gameId);
      localStorage.setItem('swc_liked_games', JSON.stringify(likedGames));
    } catch (e) {
      console.error('Failed to like game:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={hasLiked || loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-bold transition-all duration-300 shadow-md ${
        hasLiked
          ? 'bg-brand-red/10 border-brand-red text-brand-red cursor-default shadow-brand-red/5'
          : 'bg-bg-card border-white/10 text-text-primary hover:border-brand-red hover:text-brand-red active:scale-95 shadow-black/10'
      }`}
    >
      {hasLiked ? (
        <FaHeart className="w-4 h-4" />
      ) : (
        <FaRegHeart className="w-4 h-4 animate-pulse" />
      )}
      <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
    </button>
  );
}
