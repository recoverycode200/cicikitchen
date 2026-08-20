import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionText?: string;
  actionLink?: string;
  onActionClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, actionText, actionLink, onActionClick }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-16 px-4">
      <div className="text-neutral-400 mb-4">{icon}</div>
      <h3 className="text-lg md:text-xl font-semibold text-neutral-800 mb-2 text-center">{title}</h3>
      <p className="text-sm md:text-base text-neutral-600 text-center max-w-md mb-6 leading-relaxed">{description}</p>

      {actionText &&
        (actionLink || onActionClick) &&
        (actionLink ? (
          <Link to={actionLink} className="btn-primary px-6 py-3">
            {actionText}
          </Link>
        ) : (
          <button onClick={onActionClick} className="btn-primary px-6 py-3">
            {actionText}
          </button>
        ))}
    </div>
  );
};

export default EmptyState;
