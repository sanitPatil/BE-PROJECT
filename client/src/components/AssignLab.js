import React from 'react'
import '../styles/assignLab.css'
import { useState,useEffect } from 'react';

const AssignLab = ({caseId , isOpenAssignLab, onClose, onSubmit, contract}) => {

    //assign lab address to be case id

    const [labAddress, setLabAddress] = useState("");
    const [testDesc, setTestDesc] = useState("");

    const handleChange = (e) => {

        if(e.target.name == "labAddress"){
            setLabAddress(e.target.value);
        }
        else{
            setTestDesc(e.target.value);
        }
        console.log(labAddress,testDesc);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        let isHex = false;
        const firstTwoChar = labAddress[0]+labAddress[1];
        // console.log(firstTwoChar);

        if(labAddress!="" && firstTwoChar === '0x' && labAddress.length === 42 ){
            isHex = true;
        }

        if(isHex  && (testDesc.length > 3) ){

            // function assignLab(int _caseId, address labAddress, string memory testDesc,int _currdatetime) public returns (bool) {


            const currentTimestampMilliseconds = Date.now();
            const currentTimestampSeconds = Math.floor(currentTimestampMilliseconds / 1000);
            try {
                const done = await contract.assignLab(caseId,labAddress,testDesc,currentTimestampSeconds);
                console.log(done)
                if(done){
                    onSubmit({done});
                    onClose();
                }
                else{
                    alert("Problem with Contract");
                }
            } catch (error) {
                alert(error);
            }
        }
        else{
            alert("Invalid Data Entered");
            setLabAddress("");
            setTestDesc("");
        }
        document.getElementById('labAddress').value = "";
        document.getElementById('testDesc').value = "";

    };
    if (!isOpenAssignLab) {
        return null;
    }

    return (
        <div className="popupAssignLab">
            <div className="nav">
                <button onClick={onClose}>X</button>
            </div>
            <div className="AssignLabWrapper">
                <h2>Assign Lab</h2>
                <form className='AssignLabForm' onSubmit={handleSubmit}>
                    <input type="text" name="labAddress" id="labAddress" placeholder='Lab Address' onChange={handleChange} />
                    <input type="text" name="testDesc" id="testDesc" placeholder='Test Description' onChange={handleChange} />
                    <div className='btnDiv'>
                        <button className="AssignLabBtn bold"  type='submit'>Assign Lab</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AssignLab