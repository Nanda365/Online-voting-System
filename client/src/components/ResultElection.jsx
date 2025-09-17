import React, { useEffect, useState } from 'react';
import CandidateRating from '../components/CandidateRating';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Loader from './Loader';

const ResultElection = ({ _id: id, thumbnail, title, candidates: propCandidates, totalVotes: propTotalVotes }) => {
    const [totalVotes, setTotalVotes] = useState(propTotalVotes || 0);
    const [electionCandidates, setElectionCandidates] = useState(propCandidates || []);
    const [isLoading, setIsLoading] = useState(false);

    const token = useSelector(state => state?.vote?.currentVoter?.token);

    const getCandidates = async () => {
        // If candidates are provided as props, use them
        if (propCandidates) {
            setElectionCandidates(propCandidates);
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/elections/${id}/candidates`,
                { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
            );

            const candidates = response.data || [];
            setElectionCandidates(candidates);

            const total = candidates.reduce((sum, candidate) => sum + candidate.voteCount, 0);
            setTotalVotes(total);
        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        if (id && !propCandidates) {
            getCandidates();
        }
    }, [id, propCandidates]);

    // Update state when props change
    useEffect(() => {
        if (propCandidates) {
            setElectionCandidates(propCandidates);
        }
        if (propTotalVotes !== undefined) {
            setTotalVotes(propTotalVotes);
        }
    }, [propCandidates, propTotalVotes]);

    return (
        <>
            {isLoading && <Loader />}
            <article className="result">
                <header className="result_header">
                    <h4>{title}</h4>
                    <div className="result_header-image">
                        <img src={thumbnail} alt={title} />
                    </div>
                </header>
                <ul className="result_list">
                    {electionCandidates.map((candidate, index) => (
                        <CandidateRating 
                            key={candidate._id || candidate.id || `candidate-${index}`}
                            {...candidate} 
                            totalVotes={totalVotes} 
                        />
                    ))}
                </ul>
            </article>
        </>
    );
};

export default ResultElection;
