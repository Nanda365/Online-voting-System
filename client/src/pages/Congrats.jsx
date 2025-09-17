import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { Navigate, useNavigate } from 'react-router-dom';



const Congrats = () => {
  
  const navigate = useNavigate();
   useEffect(() => {
          const timeout = setTimeout(() => {
              navigate('/logout');
          }, 3000);
      
          return () => clearTimeout(timeout);
      }, []);
  return (
    <section className='congrats'>
      <div className="container congrats_container">
        <h2>Thanks for your vote!</h2>
        <p>Your vote is now added to your candidate's vote count. You will be redirected shortly to see the result page.</p>
      </div>
    </section>
  )
}

export default Congrats