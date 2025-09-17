import React, { useEffect, useState } from 'react';
import Election from '../components/Election';
import AddElectionModel from '../components/AddElectionModel';
import { useDispatch, useSelector } from 'react-redux';
import { UiActions } from '../store/ui-slice';
import UpdateElectionModel from '../components/UpdateElectionModel';
import axios from 'axios';
import Loader from '../components/Loader';
import { useNavigate} from 'react-router-dom';

import { FaSearch } from 'react-icons/fa';

const Elections = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [elections, setElections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const token = useSelector(state => state?.vote?.currentVoter?.token);
  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin);
  const electionModelShowing = useSelector(state => state.ui.electionModelShowing);
  const updateElectionModelShowing = useSelector(state => state.ui.updateElectionModelShowing);

  const openModel = () => {
    dispatch(UiActions.openElectionModel());
  };

  const getElections = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      setElections(response.data);
    } catch (error) {
      console.log('Error fetching elections:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      getElections();
    }
  }, [token]);

  return (
    <>
      <section className="elections">
        <div className="container elections_container">
          <header className="elections_header">
            <h1>Ongoing Elections</h1>
            {isAdmin && (
              <button className="btn primary" onClick={openModel}>
                Create New Election
              </button>
            )}
          </header>

          <div className="search_bar_container">
            <div className="search_bar_elections">
              <FaSearch className="search_icon" />
              <input
                type="text"
                placeholder="Search for an election"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <Loader />
          ) : elections.length === 0 ? (
            <p>No elections available.</p>
          ) : (
            <menu className="elections_menu">
              {elections
                .filter((election) =>
                  election.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((election) => (
                  <Election key={election._id} {...election} />
                ))}
            </menu>
          )}
        </div>
      </section>

      {electionModelShowing && <AddElectionModel />}
      {updateElectionModelShowing && <UpdateElectionModel />}
    </>
  );
};

export default Elections;
