import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import axios from 'axios'
import Loader from './Loader'

const Votingenter = ({_id: id, thumbnail, title}) => {
    const [ settotalVotes] = useState(0)
    const [ setElectionCandidates] = useState([])
    const [isLoading, setIsLoading] = useState(false);

    const token = useSelector(state => state?.vote?.currentVoter?.token)
    const getCandidates = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/elections/${id}/candidates`, {withCredentials: true, headers: {Authorization: `Bearer ${token}`}})
            const candidates = await response.data;
            setElectionCandidates(candidates)

            for(let i=0;i < candidates.length; i++){
                settotalVotes(prevState => prevState += candidates[i].voteCount)
            }
        } catch (error) {
            console.log(error)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        getCandidates()
    }, [])
   
  return (
    <>
        {isLoading && <Loader />}
        <article className='result'>
            <header className='result_header'>
                <h4>{title}</h4>
                <div className="result_header-image">
                    <img src={thumbnail} alt={title} />
                </div>
            </header>
          
            <Link to={`/elections/${id}/candidates`} className='btn primary full'>Enter Election</Link>
        </article>
    </>
  )
}

export default Votingenter