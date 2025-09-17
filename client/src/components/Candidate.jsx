import React from 'react'
import { useDispatch } from 'react-redux'
import { UiActions } from '../store/ui-slice'
import { voteActions } from '../store/vote-slice'

const Candidate = ({image, _id: id, fullName, motto}) => {
  const dispatch = useDispatch()

    const openCandidateModel = () => {
        dispatch(UiActions.openVoteCandidateModel())
        dispatch(voteActions.changeSelectedVoteCandidate(id))
    }

  return (
    <article className="candidate">
        <div className="candidate_image">
            <img src={image} alt={fullName} />
        </div>
        <h5>{fullName?.length > 20 ? fullName.substring(0, 20) + "..." : fullName}</h5>
        <small>{motto?.length > 20 ? motto.substring(0,25)+ "..." : motto}</small>
        <button className='btn primary' onClick={openCandidateModel}>Vote</button>
    </article>
  )
}

export default Candidate