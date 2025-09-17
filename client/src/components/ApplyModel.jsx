import React, { useState } from 'react'
import { IoMdClose } from 'react-icons/io'
import { useDispatch } from 'react-redux'
import { UiActions } from '../store/ui-slice'
import { Link } from 'react-router-dom'

const ApplyModel = () => {
    const [fullName, setFullName] = useState("")
    const [mobileno, setMobileno] = useState("")
    const [email, setEmail] = useState("")
    const [image, setPhoto] = useState("")

    const dispatch = useDispatch()
    
    const closeModel = () => {
      dispatch(UiActions.closeApplyModel())
    }


  return (
    <section className="model">
        <div className="model_content">
            <header className="model_header">
                <h4>Apply Voter ID</h4>
                <button className="model_close" onClick={closeModel}><IoMdClose/></button>
            </header>
            <form>
               <div>
                    <h6>Full Name:</h6>
                    <input type="text" value={fullName} name='fullName' onChange={e => setFullName(e.target.value)} />
               </div>
               <div>
                    <h6>Mobile No:</h6>
                    <input type="text" value={mobileno} name='mobileno' onChange={e => setMobileno(e.target.value)} />
               </div>
               <div>
                    <h6>Aadhar No:</h6>
                    <input type="text" value={email} name='email' onChange={e => setEmail(e.target.value)} />
               </div>
               <div>
                    <h6>Voter Image:</h6>
                    <input type="file" value={image} name='image' onChange={e => setPhoto(e.target.file[0])} accept="png, jpg, jpeg, webp, avif" />
               </div>
               <Link to={`/thankyou`} className=" btn primary">Apply</Link>
            </form>
        </div>
    </section>
  )
}

export default ApplyModel