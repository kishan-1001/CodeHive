import React from 'react';
import { X, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface SubmissionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  verdict: string;
  message: string;
}

const SubmissionResultModal: React.FC<SubmissionResultModalProps> = ({
  isOpen,
  onClose,
  verdict,
  message
}) => {
  if (!isOpen) return null;

  const getVerdictConfig = (verdict: string) => {
    switch (verdict) {
      case 'accepted':
        return {
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/20',
          title: 'Accepted',
          description: 'Congratulations! Your solution passed all test cases.'
        };
      case 'wrong_answer':
        return {
          icon: XCircle,
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          borderColor: 'border-red-400/20',
          title: 'Wrong Answer',
          description: 'Your solution failed one or more test cases. Check your logic and try again.'
        };
      case 'time_limit_exceeded':
        return {
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/20',
          title: 'Time Limit Exceeded',
          description: 'Your solution took too long to execute. Try optimizing your code.'
        };
      case 'runtime_error':
        return {
          icon: AlertTriangle,
          color: 'text-orange-400',
          bgColor: 'bg-orange-400/10',
          borderColor: 'border-orange-400/20',
          title: 'Runtime Error',
          description: 'Your code encountered an error during execution. Check for bugs and edge cases.'
        };
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/20',
          title: 'Unknown Error',
          description: 'An unexpected error occurred. Please try again.'
        };
    }
  };

  const config = getVerdictConfig(verdict);
  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative glass-card rounded-2xl p-8 w-full max-w-md mx-4 shadow-2xl border border-white/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${config.bgColor} ${config.borderColor} border-2 mb-6`}>
            <IconComponent className={`w-8 h-8 ${config.color}`} />
          </div>

          {/* Title */}
          <h2 className={`text-2xl font-bold mb-2 ${config.color}`}>
            {config.title}
          </h2>

          {/* Description */}
          <p className="text-gray-300 mb-6">
            {config.description}
          </p>

          {/* Message */}
          {message && (
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-400">{message}</p>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-amber-400 text-black font-bold py-3 px-4 rounded-lg hover:bg-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Continue Coding
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubmissionResultModal;
