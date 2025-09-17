import React from 'react';
import { useDispatch } from 'react-redux';
import { UiActions } from '../store/ui-slice';

const Voterid = () => {
  const dispatch = useDispatch();

  const applyForVoterID = () => {
    dispatch(UiActions.openApplyModel());
  };

  return (
    <div className="voterid-container">
      <article className="voterid">
        <div className="voterid_image">
          <img 
            src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" 
            alt="Indian Flag" 
          />
        </div>

        <div className="voterid_info">
          <h4>Apply for Voter ID</h4>
          <p>Ensure your voice is heard! Apply for your Voter ID today and participate in the democratic process.</p>
          <div className="voterid_cta">
            <button className="btn sm primary" onClick={applyForVoterID}>
              Apply
            </button>
          </div>
        </div>
      </article>
    </div>
  );
};

export default Voterid;
