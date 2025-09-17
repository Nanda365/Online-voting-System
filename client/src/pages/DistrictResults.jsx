import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Loader from '../components/Loader';
import ResultElection from '../components/ResultElection';

const DistrictResults = () => {
  const { id } = useParams();
  const [district, setDistrict] = useState(null);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const token = useSelector(state => state?.vote?.currentVoter?.token);
  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin);

  const fetchDistrictResults = async () => {
    setIsLoading(true);
    try {
      // Fetch district details
      const districtResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/districts/${id}`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setDistrict(districtResponse.data);

      // Fetch district results
      const resultsResponse = await axios.get(
        `${process.env.REACT_APP_API_URL}/districts/${id}/results`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setResults(resultsResponse.data.results || []);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch district results');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id && token) {
      fetchDistrictResults();
    }
  }, [id, token]);

  if (!isAdmin) {
    return (
      <section className="district-results">
        <div className="container district-results_container">
          <h2>Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="district-results">
      <div className="container district-results_container">
        {isLoading ? (
          <Loader />
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <>
            <h2>Election Results for {district?.name || 'District'}</h2>
            <p className="district-code">District Code: {district?.code}</p>
            {district?.description && <p className="district-description">{district.description}</p>}
            
            {results.length === 0 ? (
              <p>No election results found for this district.</p>
            ) : (
              <div className="district-elections-results">
                {results.map(result => (
                  <div key={result.election._id} className="district-election-result">
                    <ResultElection 
                      _id={result.election._id}
                      title={result.election.title}
                      thumbnail={result.election.thumbnail}
                      candidates={result.candidates}
                      totalVotes={result.totalVotes}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default DistrictResults;