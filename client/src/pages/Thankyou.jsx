import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom';

const Thankyou = () => {
  const navigate = useNavigate();
   useEffect(() => {
          const timeout = setTimeout(() => {
              navigate('/Elections');
          }, 3000);
      
          return () => clearTimeout(timeout);
      }, []);
  return (
    <section className='congrats'>
      <div className="container voterid-container">
        <h2>Thanks for your Applying Voter ID!</h2>
        <p>Your Voter ID application has been submitted successfully. You will receive your Voter ID soon.</p>
      </div>
    </section>
  )
}

export default Thankyou