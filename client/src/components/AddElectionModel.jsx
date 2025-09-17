import React, { useState, useEffect } from 'react';
import { IoMdClose } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { UiActions } from '../store/ui-slice';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddElectionModel = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [districts, setDistricts] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector(state => state?.vote?.currentVoter?.token);

  const closeModel = () => {
    dispatch(UiActions.closeElectionModel());
  };

  useEffect(() => {
    const fetchDistricts = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/districts`,
          { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
        );
        setDistricts(response.data);
      } catch (error) {
        console.error('Error fetching districts:', error);
      }
    };

    fetchDistricts();
  }, [token]);

  const handleDistrictChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setSelectedDistricts(prev => [...prev, value]);
    } else {
      setSelectedDistricts(prev => prev.filter(districtId => districtId !== value));
    }
  };

  const createElection = async (e) => {
    e.preventDefault();
    try {
      const electionData = new FormData();
      electionData.set('title', title);
      electionData.set('description', description);
      electionData.set('thumbnail', thumbnail);

      selectedDistricts.forEach(districtId => {
        console.log('Appending district:', districtId);
        electionData.append('districts', districtId);
      });

      await axios.post(
        `${process.env.REACT_APP_API_URL}/elections`,
        electionData,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      closeModel();
      navigate(0);
    } catch (error) {
      console.log('Election creation failed:', error);
    }
  };

  return (
    <section className="model">
      <div className="model_content">
        <header className="model_header">
          <h4>Create New Election</h4>
          <button className='model_close' onClick={closeModel}><IoMdClose /></button>
        </header>
        <form onSubmit={createElection}>
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
            <h6>Election Thumbnail:</h6>
            <input
              type="file"
              onChange={e => setThumbnail(e.target.files[0])}
              accept="image/png, image/jpeg, image/webp, image/avif"
              required
            />
          </div>
          <div>
            <h6>Select District(s):</h6>
            <div className="checkbox-group">
              {districts.map(dist => (
                <div key={dist._id} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={dist._id}
                    value={dist._id}
                    checked={selectedDistricts.includes(dist._id)}
                    onChange={handleDistrictChange}
                  />
                  <label htmlFor={dist._id}>{dist.name} ({dist.code})</label>
                </div>
              ))}
            </div>
          </div>
          <button type='submit' className='btn primary'>Create Election</button>
        </form>
      </div>
    </section>
  );
};

export default AddElectionModel;