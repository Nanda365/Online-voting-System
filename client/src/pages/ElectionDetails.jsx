import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import ElectionCandidate from '../components/ElectionCandidate';
import { IoAddOutline } from 'react-icons/io5';
import { UiActions } from '../store/ui-slice';
import { useDispatch, useSelector } from 'react-redux';
import AddCandidateModel from '../components/AddCandidateModel';
import axios from 'axios';
import { voteActions } from '../store/vote-slice';

const ElectionDetails = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [election, setElection] = useState({});
  const [candidates, setCandidates] = useState([]);
  const [voters, setVoters] = useState([]);
  const [districts, setDistricts] = useState([]);

  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentVoter = useSelector(state => state?.vote?.currentVoter);
  const addCandidateModelShowing = useSelector(state => state.ui.addCandidateModelShowing);
  const token = useSelector(state => state?.vote?.currentVoter?.token);
  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin);

  const fetchElectionData = async () => {
    setIsLoading(true);
    try {
      const [electionRes, candidatesRes, votersRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/elections/${id}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/elections/${id}/candidates`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/elections/${id}/voters`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Handle populated or ID-only districts
      if (electionRes.data.districts?.length > 0) {
        if (typeof electionRes.data.districts[0] === 'object') {
          setDistricts(electionRes.data.districts);
        } else {
          const districtResponses = await Promise.all(
            electionRes.data.districts.map(districtId =>
              axios.get(`${process.env.REACT_APP_API_URL}/districts/${districtId}`, {
                withCredentials: true,
                headers: { Authorization: `Bearer ${token}` },
              })
            )
          );
          setDistricts(districtResponses.map(res => res.data));
        }
      } else {
        setDistricts([]);
      }

      setElection(electionRes.data);
      setCandidates(candidatesRes.data);
      setVoters(votersRes.data || []);
      dispatch(voteActions.setCandidates(candidatesRes.data));
    } catch (error) {
      console.error('Error fetching election data:', error);
      navigate('/elections');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (!token) {
      navigate('/');
      return;
    }
    if (id) {
      fetchElectionData();
    }
  }, [id, token]);

  const deleteElection = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/elections/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/elections');
    } catch (error) {
      console.log(error);
    }
  };

  const openModel = () => {
    dispatch(UiActions.openAddCandidateModel());
    dispatch(voteActions.changeAddCandidateElectionId(id));
  };

  const formatVoteTime = (timestamp) => {
    if (!timestamp) return 'Not voted yet';
    return new Date(timestamp).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <>
      <section className="electionDetails">
        <div className="container electionDetails_container">
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="title"><p>Election Details</p></div>
              <h2>{election.title}</h2>
              <p>{election.description}</p>

              <div className="electionDetails_image">
                <img src={election.thumbnail} alt={election.title} />
              </div>

              {/* Display Multiple Districts */}
              <div className="election-districts">
                <h4>Districts:</h4>
                <div className="results-actions">
                {isAdmin && <Link to="/districts" className="btn-d primary">
                  Manage Districts
                </Link> }
              </div>
                {districts.length > 0 ? (
                  <ul className="districts-list">
                    {districts.map((district, index) => (
                      <li key={district._id || `district-${index}`}>
                        {district.name} ({district.code})
                        {district.description && <span> - {district.description}</span>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No districts assigned</p>
                )}
              </div>

              <menu className="electionDetails_candidates">
                {candidates.length > 0 ? (
                  candidates.map((candidate) => (
                    <ElectionCandidate key={candidate._id} {...candidate} />
                  ))
                ) : (
                  <p>No candidates yet.</p>
                )}
                {isAdmin && (
                  <button className="add_candidate-btn" onClick={openModel}>
                    <IoAddOutline />
                  </button>
                )}
              </menu>

              {isAdmin && (
                <menu className="voters">
                  <h2>Voters</h2>
                  <table className="voters_table">
                    <thead>
                      <tr>
                        <th>Full Name</th>
                        <th>Email Address</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {voters
                        .filter(voter => isAdmin || voter._id === currentVoter?._id)
                        .map((voter, index) => (
                          <tr key={`voter-${voter._id}-${index}`}>
                            <td><h5>{voter.fullName}</h5></td>
                            <td>{voter.email}</td>
                            <td>{formatVoteTime(voter.votedAt || voter.createdAt)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </menu>
              )}

              {isAdmin && (
                <button className="btn danger full" onClick={deleteElection}>
                  Delete Election
                </button>
              )}
            </>
          )}
        </div>
      </section>

      {addCandidateModelShowing && <AddCandidateModel />}
    </>
  );
};

export default ElectionDetails;
