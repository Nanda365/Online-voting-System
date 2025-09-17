import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

const VoterVerification = () => {
  const [voterId, setVoterId] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [districts, setDistricts] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const token = useSelector(state => state?.vote?.currentVoter?.token);

  useEffect(() => {
    // Fetch districts for dropdown
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/districts`,
          { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
        );
        setDistricts(response.data);
      } catch (error) {
        console.error('Error fetching districts:', error);
        setError('Failed to load districts. Please try again.');
      }
    };

    fetchDistricts();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate inputs
    if (!voterId.trim()) {
      setError('Please enter your Voter ID');
      return;
    }
    
    if (!mobileNumber.trim()) {
      setError('Please enter your mobile number');
      return;
    }
    
    if (!selectedDistrict) {
      setError('Please select your district');
      return;
    }

    // Validate mobile number format
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(mobileNumber)) {
      setError('Mobile number must be 10 digits');
      return;
    }

    setIsLoading(true);
    
    try {
      // Call API to verify voter credentials
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/voters/verify`,
        {
          voterId,
          phoneNumber: mobileNumber,
          districtId: selectedDistrict
        },
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      
      // If verification successful, navigate to voting page
      if (response.data.success) {
        navigate('/voting');
      } else {
        setError(response.data.message || 'Verification failed. Please check your details.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setError(error.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="voter-verification-container">
      <div className="voter-verification-card">
        <h2>Verify Your Voting Eligibility</h2>
        <p>Please enter your details to proceed to voting</p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="voterId">Voter ID</label>
            <input
              type="text"
              id="voterId"
              value={voterId}
              onChange={(e) => setVoterId(e.target.value)}
              placeholder="Enter your Voter ID"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="mobileNumber">Mobile Number</label>
            <input
              type="text"
              id="mobileNumber"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="Enter your 10-digit mobile number"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="district">Select District</label>
            <select
              id="district"
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              required
            >
              <option value="">-- Select District --</option>
              {districts.map(district => (
                <option key={district._id} value={district._id}>
                  {district.name} ({district.code})
                </option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit" 
            className="btn primary full" 
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'Verify & Proceed'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VoterVerification;