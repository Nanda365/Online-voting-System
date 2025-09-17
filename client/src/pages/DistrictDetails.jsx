import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Loader from '../components/Loader';


const DistrictDetails = () => {
  const { id } = useParams();
  const [district, setDistrict] = useState(null);
  const [elections, setElections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const token = useSelector(state => state?.vote?.currentVoter?.token);
  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin);

  const fetchDistrictDetails = async () => {
    setIsLoading(true);
    try {
      const districtResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/districts/${id}`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setDistrict(districtResponse.data);

      const electionsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/districts/${id}/elections`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setElections(electionsResponse.data || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch district details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) {
      fetchDistrictDetails();
    }
  }, [id, token]);

  if (!isAdmin) {
    return (
      <section className="district-details">
        <div className="container district-details_container">
          <h2>Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="district-details">
      <div className="container district-details_container">
        {isLoading ? (
          <Loader />
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <div className="district-header">
              <h2>{district?.name || 'District Details'}</h2>
              <div className="district-actions">
                <Link to="/districts" className="btn">Back to Districts</Link>
                <Link to={`/districts/${id}/results`} className="btn primary">View Results</Link>
              </div>
            </div>
            
            <div className="district-info">
              <p className="district-code"><strong>District Code:</strong> {district?.code}</p>
              {district?.description && (
                <p className="district-description"><strong>Description:</strong> {district.description}</p>
              )}
            </div>
            
            <div className="district-elections">
              <h3>Elections in this District</h3>
              
              {elections.length === 0 ? (
                <p>No elections found for this district.</p>
              ) : (
                <div className="elections-list">
                  {elections.map(election => (
                    <div key={election._id} className="election-card">
                      <div className="election-image">
                        <img src={election.thumbnail} alt={election.title} />
                      </div>
                      <div className="election-info">
                        <h4>{election.title}</h4>
                        <p>{election.description}</p>
                        <Link to={`/elections/${election._id}`} className="btn sm">View Details</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default DistrictDetails;
