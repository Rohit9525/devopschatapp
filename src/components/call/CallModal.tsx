import React, { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';

interface CallModalProps {
  callType: 'audio' | 'video';
  callerName: string;
  callerPhotoURL: string;
  onAccept: () => void;
  onReject: () => void;
  onHangUp: () => void;
  isIncomingCall?: boolean;
  callId: string | null; // Add callId prop
  currentUserUid: string | undefined; // Add currentUserUid prop
  contactInfo: any; // Add contactInfo prop
}

export default function CallModal({
  callType,
  callerName,
  callerPhotoURL,
  onAccept,
  onReject,
  onHangUp,
  isIncomingCall = false,
  callId,
  currentUserUid,
  contactInfo,
}: CallModalProps) {
  const [callStatus, setCallStatus] = useState<'ringing' | 'connecting' | 'connected' | 'ended'>('ringing');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerRef = useRef<Peer.Instance | null>(null);

  useEffect(() => {
    if (!callId || !currentUserUid || !contactInfo?.uid) return;

    const startCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: callType === 'video',
          audio: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const peer = new Peer({
          initiator: !isIncomingCall, // Initiator if outgoing call
          trickle: false,
          stream: stream,
        });

        peerRef.current = peer;

        peer.on('signal', async (data) => {
          setCallStatus('connecting');
          // Send signal data to the other user through Firebase
          if (isIncomingCall) {
            // Send answer to caller
            console.log('Incoming call - Sending answer signal', data);
            // sendCallAnswer(callId, JSON.stringify(data)); //TODO: Implement sendCallAnswer with callId
          } else {
            // Send offer to receiver
            console.log('Outgoing call - Sending offer signal', data);
            // sendCallOffer(callId, JSON.stringify(data)); //TODO: Implement sendCallOffer with callId
          }
        });

        peer.on('connect', () => {
          setCallStatus('connected');
          console.log('Peer connected');
        });

        peer.on('stream', (remoteStream) => {
          console.log('Remote stream received');
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
          }
        });

        peer.on('close', () => {
          setCallStatus('ended');
          console.log('Peer connection closed');
        });

        peer.on('error', (err) => {
          setCallStatus('ended');
          console.error('Peer connection error:', err);
          toast.error('Call error: ' + err.message);
        });

        if (isIncomingCall) {
          // Listen for offer and answer in call.ts
          // listenForCallOffer(callId, (offer) => { //TODO: Implement listenForCallOffer with callId
          //   console.log('Received call offer:', offer);
          //   peer.signal(JSON.parse(offer));
          // });
        } else {
          // For outgoing call, no need to listen for offer, just send offer
        }


      } catch (error: any) {
        console.error('Failed to get user media:', error);
        toast.error('Failed to start call: ' + error.message);
        setCallStatus('ended');
      }
    };

    startCall();

    return () => {
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [callType, isIncomingCall, callId, currentUserUid, contactInfo?.uid]);

  const handleAccept = () => {
    onAccept(); // Logic to update call status in chat window if needed
    setCallStatus('connecting');
    // For incoming call, create peer and answer here, signal answer back
  };

  const handleReject = () => {
    onReject(); // Logic to update call status in chat window if needed
    setCallStatus('ended');
    // End call and cleanup
  };

  const handleHangUp = () => {
    onHangUp(); // Logic to update call status in chat window if needed
    setCallStatus('ended');
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    // End call and cleanup
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex flex-col items-center">
          <img
            src={callerPhotoURL}
            alt={callerName}
            className="w-24 h-24 rounded-full mb-4"
          />
          <h3 className="text-lg font-semibold dark:text-white mb-2">
            {isIncomingCall ? 'Incoming' : 'Outgoing'} {callType} Call
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {callerName} - Status: {callStatus}
          </p>

          {callType === 'video' && callStatus === 'connected' && (
            <div className="video-container flex justify-center space-x-4 mb-4">
              <div className="local-video">
                <video ref={localVideoRef} muted autoPlay playsInline className="w-40 h-30 rounded-lg" />
              </div>
              <div className="remote-video">
                <video ref={remoteVideoRef} autoPlay playsInline className="w-80 h-60 rounded-lg" />
              </div>
            </div>
          )}

          {isIncomingCall && callStatus === 'ringing' ? (
            <div className="flex space-x-4">
              <button
                onClick={handleAccept}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Accept
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Reject
              </button>
            </div>
          ) : (
            <button
              onClick={handleHangUp}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
            >
              Hang Up
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
