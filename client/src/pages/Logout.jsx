import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { voteActions } from '../store/vote-slice';
import { UiActions } from '../store/ui-slice';
import axios from 'axios';

const Logout = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const token = useSelector(state => state?.vote?.currentVoter?.token);

    const handleLogout = useCallback(async () => {
        try {
            dispatch(UiActions.startLogout());
            
            if (token) {
                await axios.post(`${process.env.REACT_APP_API_URL}/auth/logout`, {}, {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            localStorage.clear();
            dispatch(voteActions.logout());
            dispatch(UiActions.resetUI());
            
            setTimeout(() => {
                navigate('/', { replace: true });
            }, 2000);

        } catch (error) {
            console.error('Logout error:', error);
            localStorage.clear();
            dispatch(voteActions.logout());
            dispatch(UiActions.resetUI());
            navigate('/', { replace: true });
        } finally {
            dispatch(UiActions.endLogout());
        }
    }, [dispatch, navigate, token]);

    useEffect(() => {
        handleLogout();
    }, [handleLogout]);

    return (
        <div className="logout">
            <h2>Logging out...</h2>
            <p>Please wait while we log you out.</p>
        </div>
    );
};

export default Logout;