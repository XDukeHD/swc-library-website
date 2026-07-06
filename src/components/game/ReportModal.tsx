'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiAlertTriangle, FiX, FiCheckCircle } from 'react-icons/fi';
import { addReportAction } from '@/lib/actions';

interface ReportModalProps {
  gameId: string;
  gameTitle: string;
}

export default function ReportModal({ gameId, gameTitle }: ReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !reason) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await addReportAction(gameId, email, reason);
      setSuccess(true);
      setEmail('');
      setReason('');
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          setSuccess(false);
        }}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-brand-red px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer"
      >
        <FiAlertTriangle className="w-3.5 h-3.5" />
        Report Broken Link
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative w-full max-w-md bg-bg-surface border border-white/10 rounded-2xl overflow-hidden shadow-2xl p-6 z-10 flex flex-col gap-5"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-brand-red">
                  <FiAlertTriangle className="w-5 h-5" />
                  <h3 className="text-lg font-black uppercase tracking-tight">Report Game Link</h3>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-text-secondary hover:text-white p-1 rounded-lg hover:bg-white/5 transition-all duration-200"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {success ? (
                <div className="flex flex-col items-center justify-center text-center py-6 gap-3">
                  <FiCheckCircle className="w-12 h-12 text-green-500" />
                  <h4 className="font-bold text-text-primary text-base">Report Submitted</h4>
                  <p className="text-xs text-text-secondary max-w-xs">
                    Thank you. Our administrators have been notified about "{gameTitle}" and will review the download links shortly.
                  </p>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="mt-2 text-xs font-bold bg-white/5 border border-white/10 text-text-primary hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <p className="text-xs text-text-secondary">
                    Use this form to notify admins of offline downloads, outdated files, or incorrect firmware info.
                  </p>

                  {error && (
                    <div className="text-xs font-semibold bg-brand-red/10 border border-brand-red/20 text-brand-red p-2.5 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-bold text-text-secondary uppercase">
                      Your Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      placeholder="e.g. player@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="reason" className="text-xs font-bold text-text-secondary uppercase">
                      Reason / Message
                    </label>
                    <textarea
                      id="reason"
                      required
                      rows={4}
                      placeholder="Specify which mirrors are broken or detail the issue..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="input-field text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-2 w-full bg-brand-red hover:bg-brand-red/90 text-white font-bold py-2.5 rounded-xl transition-all duration-200 active:scale-98 disabled:opacity-50 text-sm cursor-pointer"
                  >
                    {loading ? 'Submitting...' : 'Submit Report'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
