import React, { useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { useDispatch, useSelector } from 'react-redux'
import { UiActions } from '../store/ui-slice'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const AddCandidateModel = () => {
    const [fullName, setFullName] = useState("")
    const [motto, setMotto] = useState("")
    const [image, setImage] = useState("")
    const [error, setError] = useState("")

    const dispatch = useDispatch()
    const navigate = useNavigate()
    
    const closeModel = () => {
      dispatch(UiActions.closeAddCandidateModel())
    }

    const token = useSelector(state => state?.vote?.currentVoter?.token)
    const electionId = useSelector(state => state?.vote?.addCandidateElectionId)

    const addCandidate = async (e) => {
      e.preventDefault()
      setError("")

      try {
        if (!fullName || !motto || !image || !electionId) {
          setError("All fields are required!")
          return
        }

        const candidateInfo = new FormData()
        candidateInfo.append('fullName', fullName)
        candidateInfo.append('motto', motto)
        candidateInfo.append('image', image)
        candidateInfo.append('currentElection', electionId)
         await axios.post(`${process.env.REACT_APP_API_URL}/candidates`, candidateInfo, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        navigate(0)
        closeModel()
        window.location.reload()
      } catch (error) {
        console.error(error)
        setError(error.response?.data?.message || "Error adding candidate")
      }
    }

    return (
        <section className="model">
            <div className="model_content">
                <header className="model_header">
                    <h4>Add Candidate</h4>
                    <button className="model_close" onClick={closeModel}><IoMdClose/></button>
                </header>
                <form onSubmit={addCandidate}>
                    {error && <div className="error-message" style={{color: 'red', marginBottom: '1rem'}}>{error}</div>}
                    <div>
                        <h6>Candidate Name:</h6>
                        <input type="text" value={fullName} name='fullName' onChange={e => setFullName(e.target.value)} required />
                    </div>
                    <div>
                        <h6>Candidate Motto:</h6>
                        <input type="text" value={motto} name='motto' onChange={e => setMotto(e.target.value)} required />
                    </div>
                    <div>
                        <h6>Candidate Image:</h6>
                        <input type="file" name="image" onChange={e => setImage(e.target.files[0])} accept="image/png, image/jpg, image/jpeg, image/webp, image/avif" required />
                    </div>
                    <button type="submit" className="btn primary">Add Candidate</button>
                </form>
            </div>
        </section>
    )
}

export default AddCandidateModel