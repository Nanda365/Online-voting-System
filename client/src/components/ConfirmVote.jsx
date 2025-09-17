import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UiActions } from '../store/ui-slice';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { voteActions } from '../store/vote-slice';

const ConfirmVote = ({ selectedElection }) => {
    const [modelCandidate, setModelCandidate] = useState({});

    const dispatch = useDispatch();
    const navigate = useNavigate()
    const selectedVoteCandidate = useSelector(state => state?.vote?.selectedVoteCandidate);
    const token = useSelector(state => state?.vote?.currentVoter?.token);
    const currentVoter = useSelector(state => state?.vote?.currentVoter)

    const closeCandidateModel = () => {
        dispatch(UiActions.closeVoteCandidateModel());
    };

    const fetchCandidate = async () => {
        if (!selectedVoteCandidate || !token) return;

        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidates/${selectedVoteCandidate}`, {
                withCredentials: true,
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data) {
                setModelCandidate(response.data);
            }
        } catch (error) {
            console.error("Error fetching candidate:", error);
        }
    };

    const confirmVote = async () => {
        try {
            const response = await axios.patch(`${process.env.REACT_APP_API_URL}/candidates/${selectedVoteCandidate}`, {
                selectedElection,
                votedAt: new Date().toISOString(),
            }, { 
                withCredentials: true, 
                headers: { Authorization: `Bearer ${token}` } 
            });
    
            const voteResult = response.data;
            dispatch(voteActions.changeCurrentVoter({
                ...currentVoter, 
                votedElections: voteResult,
            }));
    
            navigate('/congrats');
        } catch (error) {
            console.error("Error confirming vote:", error);
        }
        closeCandidateModel();
    }
        

    useEffect(() => {
        fetchCandidate();
    }, [selectedVoteCandidate, token]);
    
    useEffect(() => {
        const timeout = setTimeout(() => {
            navigate(-1);
        }, 6000);
    
        return () => clearTimeout(timeout);
    }, []);
    return (
        <section className="model">
            <div className="model_content confirm_vote-content">
                <h5>Please confirm your vote</h5>

                <div className="confirm_vote-image">
                    {modelCandidate?.image ? (
                        <img 
                            src={modelCandidate.image} 
                            alt={modelCandidate.fullName || "Candidate"}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/fallback-image.png';
                            }}
                        />
                    ) : (
                        <p>Loading image...</p>
                    )}
                </div>

                <h2>
                    {modelCandidate?.fullName?.length > 17
                        ? `${modelCandidate.fullName.substring(0, 17)}...`
                        : modelCandidate?.fullName}
                </h2>
                <p>
                    {modelCandidate?.motto?.length > 45
                        ? `${modelCandidate.motto.substring(0, 45)}...`
                        : modelCandidate?.motto}
                </p>

                <div className="confirm_vote-cta">
                    <button className="btn" onClick={closeCandidateModel}>Cancel</button>
                    <button className='btn primary full' onClick= {confirmVote}>Confirm</button>
                </div>
            </div>
        </section>
    );
};

export default ConfirmVote;