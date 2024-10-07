import React from 'react'
import '../styles/grantCourt.css'
import { useState } from 'react';

const RevokeCourt = ({ caseId, isOpenRevokeCourt, onClose, onSubmit, contract, courtsAssigned }) => {

    //assign lab address to be case id

    const [courtAddress, setCourtAddress] = useState("");

    const handleChange = (e) => {
        setCourtAddress(e.target.value);
        console.log(courtAddress);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isHex = false;
        const firstTwoChar = courtAddress[0] + courtAddress[1];
        // console.log(firstTwoChar);

        if (courtAddress != "" && firstTwoChar === '0x' && courtAddress.length === 42) {
            isHex = true;
        }

        if (isHex) {

            const currentTimestampMilliseconds = Date.now();
            const currentTimestampSeconds = Math.floor(currentTimestampMilliseconds / 1000);
            try {
                const done = await contract.revokeAccessFromCourt(caseId, courtAddress, currentTimestampSeconds);
                console.log(done)
                if (done) {
                    onSubmit({ done });
                    onClose();
                }
                else {
                    alert("Problem with Contract");
                }
            } catch (error) {
                alert(error);
            }
        }
        else {
            alert("Invalid Data Entered");
            setCourtAddress("");
        }
        document.getElementById('courtAddress').value = "";

    };
    if (!isOpenRevokeCourt) {
        return null;
    }

    return (
        <div className="popupGrantCourt">
            <div className="nav">
                <button onClick={onClose}>X</button>
            </div>
            <div className="GrantCourtWrapper">
                <h2>Revoke Court</h2>
                {
                    courtsAssigned === "No" ?
                        <p>No Courts Assigned Yet</p>
                        :
                        <>
                            <p style={{margin:"5px 0px"}}>Courts Assigned Are </p>
                            {courtsAssigned.map((item)=>{
                                return(
                                    <p key={item}>{item}</p>
                                )
                            })}
                            <form className='GrantCourtForm' onSubmit={handleSubmit}>
                                <input type="text" name="courtAddress" id="courtAddress" placeholder='Court Address' onChange={handleChange} />
                                <div className='btnDiv'>
                                    <button className="GrantCourtBtn bold" type='submit'>Revoke Court</button>
                                </div>
                            </form>
                        </>
                }
            </div>
        </div>
    );
}

export default RevokeCourt