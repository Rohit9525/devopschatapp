import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength(password);
  const width = (strength / 5) * 100;

  const getColor = () => {
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getMessage = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Good';
    return 'Strong';
  };

  return (
    <div className="mt-2">
      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all duration-300`}
          style={{ width: `${width}%` }}
        />
      </div>
      <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Password strength: {getMessage()}
      </div>
      <ul className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <li className={password.length >= 8 ? 'text-green-500' : ''}>
          • At least 8 characters
        </li>
        <li className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>
          • At least one uppercase letter
        </li>
        <li className={/[a-z]/.test(password) ? 'text-green-500' : ''}>
          • At least one lowercase letter
        </li>
        <li className={/[0-9]/.test(password) ? 'text-green-500' : ''}>
          • At least one number
        </li>
        <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-500' : ''}>
          • At least one special character
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;
