import axios from 'axios';
import React, { useState } from 'react';
import { IoMdTrash } from 'react-icons/io';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const ElectionCandidate = ({ fullName, image, motto, _id: id }) => {
  const token = useSelector(state => state?.vote?.currentVoter?.token);
  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin);
  const [openId, setOpenId] = useState(null);
  
  const navigate = useNavigate();

  const deleteCandidate = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/candidates/${id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate(0);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <li className="electionCandidate" onClick={() => setOpenId(id)}>
        <div className="electionCandidate_image">
          <img src={image} alt={fullName} />
        </div>
        <div>
          <h5>{fullName}</h5>
          <small>{motto?.length > 70 ? motto.substring(0, 70) + "..." : motto}</small>
          {isAdmin && (
            <button className='electionCandidate_btn' onClick={(e) => { e.stopPropagation(); deleteCandidate(); }}>
              <IoMdTrash />
            </button>
          )}
        </div>
        </li>
        {openId === id && (
        <div className="candidateModal-overlay" onClick={() => setOpenId(null)}>
          <div className="candidateModal-content" onClick={(e) => e.stopPropagation()}>
            <span className="candidateModal-close-btn" onClick={() => setOpenId(null)}>&times;</span>
            <img src={image} alt={fullName} className="candidateModal-image" />
            <h2>{fullName}</h2>
            <div className="candidateModal-scrollable">
              <p>{motto}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ElectionCandidate;

