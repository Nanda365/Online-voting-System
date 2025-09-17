import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Votingenter from '../components/Votingenter';
import FaceVerification from '../components/FaceVerification';
import axios from 'axios';
import Loader from '../components/Loader';

const Voting = () => {
  const navigate = useNavigate();
  const [showFaceVerification, setShowFaceVerification] = useState(true);
  const [showVerifiedMessage, setShowVerifiedMessage] = useState(false);
  const [elections, setElections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = useSelector(state => state?.vote?.currentVoter?.token);

  const fetchElections = async () => {
    if (!token) {
      navigate('/logout');
      return;
    }
  
    try {
      setIsLoading(true);
      setError(null);
  
      const voterResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/current`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      const selectedDistrict = voterResponse.data.selectedDistrict;
      const districtId = selectedDistrict?._id || selectedDistrict;
  
      if (!districtId) {
        navigate('/verify-voter');
        return;
      }
  
      console.log("Using District ID:", districtId);
  
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/districts/${districtId}/elections`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      setElections(response.data || []);
    } catch (err) {
      console.error('Error fetching elections:', err);
      setError(err.response?.data?.message || 'Failed to fetch elections.');
    } finally {
      setIsLoading(false);
    }
  };  

  useEffect(() => {
    if (!showFaceVerification) {
      fetchElections();
    }
  }, [showFaceVerification, token]);

  const handleVerificationComplete = (success) => {
    if (success) {
      setShowVerifiedMessage(true);
      setTimeout(() => {
        setShowVerifiedMessage(false);
        setShowFaceVerification(false);
      }, 1500);
    }
  };

  return (
    <section className="elections">
      <div className="container elections_container">
        {showFaceVerification ? (
          <div className="verification-container">
            <FaceVerification onVerificationComplete={handleVerificationComplete} />
            {showVerifiedMessage && (
              <div className="verification-success">Verified Successfully!</div>
            )}
          </div>
        ) : (
          <>
            <header className="elections_header">
              <h1>Available Elections</h1>
            </header>

            {isLoading ? (
              <Loader />
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : elections.length > 0 ? (
              <menu className="elections_menu">
                {elections.map(election => (
                  <Votingenter key={election._id} {...election} />
                ))}
              </menu>
            ) : (
              <div className="no-elections">No elections available at the moment.</div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Voting;
