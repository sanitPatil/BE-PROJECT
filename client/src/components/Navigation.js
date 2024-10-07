import React from 'react'
import '../styles/navigation.css'

const Navigation = ({account,role}) => {

    const currRole = role.charAt(0).toUpperCase() + role.slice(1);

    return (
        <>
        <div className="navbar">
            <div className="left">
                <h3 id='title' className='m0'><span className="blue">Digital </span>Forensics System</h3>
            </div>
            <div className="right">
                <h3 id='role' className='m0'>{currRole}</h3>
                <p id='roleAddress' className='m0'>{account}</p>
            </div>
        </div>
        </>
    )
}

export default Navigation