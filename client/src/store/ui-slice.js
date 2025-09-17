import { createSlice } from "@reduxjs/toolkit";

const initialState = { 
    addCandidateModelShowing: false, 
    voteCandidateModelShowing: false, 
    electionModelShowing: false, 
    updateElectionModelShowing: false, 
    applyModelShowing: false,
    isLoggingOut: false
};

const uiSlice = createSlice({
    name: "ui",
    initialState,
    reducers: {
        openAddCandidateModel(state) {
            state.addCandidateModelShowing = true;
        },
        closeAddCandidateModel(state) {
            state.addCandidateModelShowing = false;
        },
        openVoteCandidateModel(state) {
            state.voteCandidateModelShowing = true;
        },
        closeVoteCandidateModel(state) {
            state.voteCandidateModelShowing = false;
        },
        openElectionModel(state) {
            state.electionModelShowing = true;
        },
        closeElectionModel(state) {
            state.electionModelShowing = false;
        },
        openUpdateElectionModel(state) {
            state.updateElectionModelShowing = true;
        },
        closeUpdateElectionModel(state) {
            state.updateElectionModelShowing = false;
        },
        openApplyModel(state) {
            state.applyModelShowing = true;
        },
        closeApplyModel(state) {
            state.applyModelShowing = false;
        },
        startLogout(state) {
            state.isLoggingOut = true;
        },
        endLogout(state) {
            state.isLoggingOut = false;
        },
        resetUI(state) {
            state.addCandidateModelShowing = false;
            state.voteCandidateModelShowing = false;
            state.electionModelShowing = false;
            state.updateElectionModelShowing = false;
            state.applyModelShowing = false;
            state.isLoggingOut = false;
        }
    }
});

export const UiActions = uiSlice.actions;
export default uiSlice;
