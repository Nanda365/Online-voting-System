import React, { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { UiActions } from '../store/ui-slice';

const UpdateElectionModel = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [districts, setDistricts] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const idOfElectionToUpdate = useSelector(state => state?.vote?.idOfElectionToUpdate);
  const token = useSelector(state => state?.vote?.currentVoter?.token);

  const closeModel = () => {
    dispatch(UiActions.closeUpdateElectionModel());
  };

  useEffect(() => {
    const fetchDistricts = async () => {
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
        console.error("Error fetching districts:", error);
      }
    };
    fetchDistricts();
  }, [token]);

  const fetchElection = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/elections/${idOfElectionToUpdate}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const election = response.data;
      setTitle(election.title);
      setDescription(election.description);
      setThumbnail("");

      if (election.districts && Array.isArray(election.districts)) {
        setSelectedDistricts(election.districts.map(d => d._id || d));
      } else if (election.districts) {
        setSelectedDistricts([election.districts._id || election.districts]);
      } else {
        setSelectedDistricts([]);
      }
    } catch (error) {
      console.error("Failed to fetch election:", error);
    }
  };

  useEffect(() => {
    if (idOfElectionToUpdate) {
      fetchElection();
    }
  }, [idOfElectionToUpdate]);

  const handleDistrictToggle = (id) => {
    setSelectedDistricts((prev) =>
      prev.includes(id)
        ? prev.filter(d => d !== id)
        : [...prev, id]
    );
  };

  const updateElection = async (e) => {
    e.preventDefault();
    try {
      const electionData = new FormData();
      electionData.append('title', title);
      electionData.append('description', description);
      if (thumbnail) {
        electionData.append('thumbnail', thumbnail);
      }

      selectedDistricts.forEach(districtId => {
        electionData.append('districts', districtId);
      });

      await axios.patch(
        `${process.env.REACT_APP_API_URL}/elections/${idOfElectionToUpdate}`,
        electionData,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      closeModel();
      navigate(0);
    } catch (error) {
      console.error("Update failed:", error.response?.data || error.message);
    }
  };

  return (
    <section className="model">
      <div className="model_content">
        <header className="model_header">
          <h4>Edit Election</h4>
          <button className="model_close" onClick={closeModel}>
            <IoMdClose />
          </button>
        </header>

        <form onSubmit={updateElection}>
          <div>
            <h6>Election Title:</h6>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <h6>Election Description:</h6>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <h6>Election Thumbnail (optional):</h6>
            <input
              type="file"
              onChange={e => setThumbnail(e.target.files[0])}
              accept="image/png, image/jpeg, image/webp, image/avif"
            />
          </div>

          <div>
            <h6>Select Districts:</h6>
            <div className="checkbox-group">
              {districts.map(dist => (
                <div key={dist._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={dist._id}
                    value={dist._id}
                    checked={selectedDistricts.includes(dist._id)}
                    onChange={() => handleDistrictToggle(dist._id)}
                  />
                  <label htmlFor={dist._id}>{` ${dist.name} (${dist.code})`}</label>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn primary">
            Update Election
          </button>
        </form>
      </div>
    </section>
  );
};

export default UpdateElectionModel;
