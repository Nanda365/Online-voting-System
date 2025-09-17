import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Loader from '../components/Loader';

const Districts = () => {
  const [districts, setDistricts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentDistrictId, setCurrentDistrictId] = useState(null);

  const token = useSelector(state => state?.vote?.currentVoter?.token);
  const isAdmin = useSelector(state => state?.vote?.currentVoter?.isAdmin);

  const getDistricts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/districts`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      setDistricts(response.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch districts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getDistricts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isEditing) {
        await axios.patch(
          `${process.env.REACT_APP_API_URL}/districts/${currentDistrictId}`,
          formData,
          { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_URL}/districts`,
          formData,
          { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
        );
      }

      // Reset form and refresh districts
      setFormData({ name: '', code: '', description: '' });
      setIsEditing(false);
      setCurrentDistrictId(null);
      getDistricts();
    } catch (error) {
      setError(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (district) => {
    setFormData({
      name: district.name,
      code: district.code,
      description: district.description || ''
    });
    setIsEditing(true);
    setCurrentDistrictId(district._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this district?')) return;
    
    setIsLoading(true);
    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/districts/${id}`,
        { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
      );
      getDistricts();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to delete district');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <section className="districts">
        <div className="container districts_container">
          <h2>Access Denied</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="districts">
      <div className="container districts_container">
        <h2>District Management</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        {isLoading ? <Loader /> : (
          <>
            <form onSubmit={handleSubmit} className="district-form">
              <h3>{isEditing ? 'Edit District' : 'Add New District'}</h3>
              
              <input
                type="text"
                name="name"
                placeholder="District Name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              
              <input
                type="text"
                name="code"
                placeholder="District Code"
                value={formData.code}
                onChange={handleChange}
                required
              />
              
              <textarea
                name="description"
                placeholder="Description (optional)"
                value={formData.description}
                onChange={handleChange}
              />
              
              <div className="form-buttons">
                <button type="submit" className="btn primary">
                  {isEditing ? 'Update District' : 'Add District'}
                </button>
                
                {isEditing && (
                  <button 
                    type="button" 
                    className="btn" 
                    onClick={() => {
                      setFormData({ name: '', code: '', description: '' });
                      setIsEditing(false);
                      setCurrentDistrictId(null);
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="districts-list">
              <h3>All Districts</h3>
              
              {districts.length === 0 ? (
                <p>No districts found. Add your first district above.</p>
              ) : (
                <table className="districts-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {districts.map(district => (
                      <tr key={district._id}>
                        <td>{district.name}</td>
                        <td>{district.code}</td>
                        <td>{district.description || '-'}</td>
                        <td className="district-actions">
                          <Link to={`/districts/${district._id}/results`} className="btn sm primary">
                            View Results
                          </Link>
                          <button 
                            className="btn sm" 
                            onClick={() => handleEdit(district)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn sm danger" 
                            onClick={() => handleDelete(district._id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default Districts;