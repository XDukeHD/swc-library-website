'use client';

import { useState } from 'react';
import { FiMessageSquare, FiSend, FiUser } from 'react-icons/fi';
import { addCommentAction } from '@/lib/actions';
import { Comment } from '@/lib/types';
import Turnstile from '@/components/Turnstile';

interface CommentsSectionProps {
  gameId: string;
  initialComments: Comment[];
}

export default function CommentsSection({ gameId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaKey, setCaptchaKey] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !content) {
      setError('Please fill in all fields.');
      return;
    }
    if (!captchaToken) {
      setError('Please complete the CAPTCHA verification.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const newComment = await addCommentAction(gameId, username, email, content, captchaToken);
      setComments([newComment, ...comments]);
      setContent('');
      setCaptchaToken('');
      setCaptchaKey(prev => prev + 1);
    } catch (e: any) {
      setError(e.message || 'Failed to submit comment. Please try again.');
      setCaptchaToken('');
      setCaptchaKey(prev => prev + 1);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-2 border-b border-white/5 pb-4">
        <FiMessageSquare className="w-5 h-5 text-brand-purple" />
        <h3 className="text-xl font-black uppercase tracking-tight text-text-primary">
          Comments ({comments.length})
        </h3>
      </div>

      <div className="grid md:grid-cols-12 gap-8 items-start">
        {/* Comment Form */}
        <form onSubmit={handleSubmit} className="md:col-span-5 bg-bg-card border border-white/5 p-6 rounded-2xl flex flex-col gap-4">
          <h4 className="font-bold text-sm text-text-primary uppercase tracking-tight">Post a Comment</h4>
          
          {error && (
            <div className="text-xs font-semibold bg-brand-red/10 border border-brand-red/20 text-brand-red p-2.5 rounded-lg">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="comment-username" className="text-xs font-bold text-text-secondary uppercase">
              Username
            </label>
            <input
              type="text"
              id="comment-username"
              required
              placeholder="e.g. SwitchFanatic"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="comment-email" className="text-xs font-bold text-text-secondary uppercase">
              Email Address
            </label>
            <input
              type="email"
              id="comment-email"
              required
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field text-sm"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="comment-content" className="text-xs font-bold text-text-secondary uppercase">
              Your Comment
            </label>
            <textarea
              id="comment-content"
              required
              rows={4}
              placeholder="Join the discussion. Keep it respectful..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input-field text-sm resize-none"
            />
          </div>

          <Turnstile
            key={captchaKey}
            onVerify={(token) => setCaptchaToken(token)}
            onExpire={() => setCaptchaToken('')}
            onError={() => setCaptchaToken('')}
          />

          <button
            type="submit"
            disabled={loading || !captchaToken}
            className="flex items-center justify-center gap-1.5 bg-brand-purple hover:bg-brand-purple/90 text-white font-bold py-2.5 rounded-xl transition-all duration-200 active:scale-98 disabled:opacity-55 text-sm cursor-pointer w-full"
          >
            <FiSend className="w-4 h-4" />
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        {/* Comments List */}
        <div className="md:col-span-7 flex flex-col gap-4">
          {comments.length === 0 ? (
            <div className="text-center py-12 bg-bg-card rounded-2xl border border-white/5 text-text-secondary text-sm">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2">
              {comments.map((comment) => (
                <div 
                  key={comment.id}
                  className="bg-bg-card border border-white/5 p-4 rounded-xl flex gap-3.5 items-start"
                >
                  <div className="w-10 h-10 rounded-full bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple shrink-0 font-bold uppercase">
                    {comment.username.substring(0, 2)}
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="font-bold text-sm text-text-primary">{comment.username}</span>
                      <span className="text-[10px] text-text-secondary">{formatDate(comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
