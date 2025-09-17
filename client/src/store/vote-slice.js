import { createSlice } from "@reduxjs/toolkit";

const currentVoter = JSON.parse(localStorage.getItem("currentUser"));

const initialState = {
  selectedVoteCandidate: "", 
  currentVoter, 
  selectedElection: "", 
  idOfElectionToUpdate: "", 
  addCandidateElectionId: "",
  candidates: []
};

export const voteSlice = createSlice({
  name: 'vote',
  initialState,
  reducers: {
    changeSelectedVoteCandidate (state, action) {
      state.selectedVoteCandidate = action.payload
    },
    changeCurrentVoter(state, action) {
      state.currentVoter = action.payload
    },
    changeAddCandidateElectionId(state, action) {
      state.addCandidateElectionId = action.payload
    },
    changeIdOfElectionToUpdate(state, action) {
      state.idOfElectionToUpdate = action.payload
    },
    deleteElection(state, action) {
      state.selectedElection = ""
      state.idOfElectionToUpdate = ""
    },
    addCandidate(state, action) {
      state.candidates.push(action.payload)
    },
    setCandidates(state, action) {
      state.candidates = action.payload
    },
    setCurrentVoter(state, action) {
      state.currentVoter = action.payload;
      localStorage.setItem("currentVoter", JSON.stringify(action.payload));
    },
    login(state, action) {
      state.currentVoter = action.payload
      localStorage.setItem("currentUser", JSON.stringify(action.payload))
    },
    logout(state) {
      state.currentVoter = null
      localStorage.removeItem("currentUser")
    }
  }
});

export const voteActions = voteSlice.actions;
export default voteSlice;