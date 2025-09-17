import React, { useRef, useState } from 'react';
import Webcam from 'react-webcam';

const FaceVerification = ({ onVerificationComplete = () => {} }) => {
  const webcamRef = useRef(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onVerificationComplete(true);
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="face-verification">
      <h2>Face Verification Required</h2>
      <div className="webcam-container">
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          mirrored={true}
          className="webcam"
          width={640}
          height={480}
        />
      </div>
      <button 
        onClick={handleVerify}
        disabled={isVerifying}
        className="btn primary"
      >
        {isVerifying ? 'Verifying...' : 'Verify Face'}
      </button>
    </div>
  );
};

export default FaceVerification;