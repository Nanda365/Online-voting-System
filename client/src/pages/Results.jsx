import React, { useEffect, useState } from 'react';
import ResultElection from '../components/ResultElection';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';

import { FaSearch } from 'react-icons/fa';

const Results = () => {
  const [elections, setElections] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const token = useSelector(state => state?.vote?.currentVoter?.token);
  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin);

  const getElections = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/elections`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setElections(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch elections');
    } finally {
      setIsLoading(false);
    }
  };

  const getDistricts = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/districts`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDistricts(response.data);
    } catch (error) {
      console.error('Failed to fetch districts:', error);
    }
  };

  useEffect(() => {
    if (token) {
      getElections();
      getDistricts();
    }
  }, [token]);

  if (!isAdmin) {
    return (
      <section className="results">
        <div className="container results_container">
          <h2>You do not have permission to view the results.</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="results">
      <div className="container results_container">
        <h2>Election Results</h2>

        <div className="search_bar">
          <FaSearch className="search_icon" />
          <input
            type="text"
            placeholder="Search for an election result"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <Loader />
        ) : (
          <>
            {districts.length > 0 && (
              <div className="district-filters">
                <h3>Filter by District</h3>
                <div className="district-buttons">
                  {districts.map(district => (
                    <Link
                      key={district._id}
                      to={`/districts/${district._id}/results`}
                      className="btn sm"
                    >
                      {district.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <h3>All Elections</h3>
            {elections.length === 0 ? (
              <p>No elections found.</p>
            ) : (
              elections
                .filter((election) =>
                  election.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((election) => (
                  <ResultElection
                    key={election._id}
                    electionId={election._id}
                    _id={election._id}
                    title={election.title}
                    thumbnail={election.thumbnail}
                  />
                ))
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Results;
