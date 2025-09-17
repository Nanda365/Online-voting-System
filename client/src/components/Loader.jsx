import React from "react";
import Spinner from '../assets/loader.gif'

const Loader = () => {
    return (
        <section className="Loader">
            <div className="loader_container">
                <img src={Spinner} alt="Loading Spinner" />
            </div>
        </section>
    )
}

export default Loader