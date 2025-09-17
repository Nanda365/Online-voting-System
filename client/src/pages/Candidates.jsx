import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Candidate from '../components/Candidate';
import ConfirmVote from '../components/ConfirmVote';

const Candidates = () => {
    const { id: selectedElection } = useParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [canVote, setCanVote] = useState(true);

    const openVoteCandidateModelShowing = useSelector(state => state.ui.voteCandidateModelShowing);
    const token = useSelector(state => state?.vote?.currentVoter?.token);
    const votedElections = useSelector(state => state?.vote?.currentVoter?.votedElections || []);

    useEffect(() => {
        if (!token) return;

        const fetchCandidates = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/elections/${selectedElection}/candidates`, 
                    {
                        withCredentials: true,
                        headers: { Authorization: `Bearer ${token}` }
                    }
                );
                setCandidates(response.data);
                
                if (votedElections.includes(selectedElection)) {
                    setCanVote(false);
                }
            } catch (error) {
                console.error("Error fetching candidates:", error);
            }
        };

        fetchCandidates();
    }, [token, selectedElection, votedElections]);

    if (!token) {
        return (
            <section className="login_required">
                <h2>Please Login First</h2>
                <p>You must log in to view and vote for candidates.</p>
                <button className="btn primary full" onClick={() => navigate('/login')}>Go to Login</button>
            </section>
        );
    }

    return (
        <>
            <section className="candidates">
                {!canVote ? (
                    <header className="candidates_header">
                        <h1>Already Voted</h1>
                        <p>You are only permitted to vote once in this election. Please vote in another election or sign out.</p>
                    </header>
                ) : (
                    <>
                        {candidates.length > 0 ? (
                            <header className="candidates_header">
                                <h1>Vote Your Candidate</h1>
                                <p>These are the candidates for the selected election. Please vote once and wisely, because you won't be allowed to vote again in this election.</p>
                            </header>
                        ) : (
                            <header className="candidates_header">
                                <h1>Inactive</h1>
                                <p>There are no candidates found for this election. Please check back later.</p>
                            </header>
                        )}

                        <div className="container candidates_container">
                            {candidates.map(candidate => (
                                <Candidate key={candidate._id} {...candidate} />
                            ))}
                        </div>
                    </>
                )}
            </section>

            {openVoteCandidateModelShowing && <ConfirmVote selectedElection={selectedElection} />}
        </>
    );
};

export default Candidates;
