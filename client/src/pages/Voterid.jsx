import React from 'react';
import { useSelector } from 'react-redux';
import Voterid from '../components/Voterid';
import ApplyModel from '../components/ApplyModel';

const Voteridpage = () => {
    const openapplyModelShowing = useSelector(state => state.ui.applyModelShowing);

    return (
        <>
            <menu className="elections_menu">
                <Voterid />
            </menu>
            {openapplyModelShowing && <ApplyModel />}
        </>
    );
};

export default Voteridpage;
