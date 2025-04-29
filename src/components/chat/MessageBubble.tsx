import React from 'react';
import { Check, CheckCheck } from 'lucide-react';
import { formatTimestamp } from '../../utils/helpers';
import { Message } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { currentUser } = useAuth() || {};
  const isSentByMe = message.senderId === currentUser?.uid;

  return (
    <div className={`flex ${isSentByMe ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`message-bubble ${
          isSentByMe ? 'message-bubble-sent' : 'message-bubble-received'
        }`}
      >
        {message.type === 'text' && <p>{message.text}</p>}
        {message.type === 'image' && (
          <img
            src={message.fileUrl}
            alt="Image message"
            className="max-w-sm rounded-lg"
          />
        )}
        {message.type === 'file' && (
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <a
              href={message.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {message.fileName}
            </a>
          </div>
        )}
        <div className="flex items-center space-x-1 mt-1 text-xs opacity-70">
          <span>{formatTimestamp(message.timestamp)}</span>
          {isSentByMe && (
            message.read ? <CheckCheck className="w-4 h-4" /> : <Check className="w-4 h-4" />
          )}
        </div>
      </div>
    </div>
  );
}
