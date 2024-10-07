import React from 'react'
import { useState } from 'react';
import '../styles/addUser.css'


const AddUser = ({ isOpen, onClose, onSubmit,contract }) => {

    //user address to be added
    const [userAddress, setUserAddress] = useState("");
    const [userRole, setUserRole] = useState("");

    const handleChange = (e) => {

        if(e.target.name == "address"){
            setUserAddress(e.target.value);
        }
        else{
            setUserRole(e.target.value);
        }
        console.log(userAddress,userRole);

    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // console.log(userAddress,userRole)
        let isHex = false;
        const firstTwoChar = userAddress[0]+userAddress[1];
        // console.log(firstTwoChar);

        if(userAddress!="" && firstTwoChar === '0x' && userAddress.length === 42 ){
            isHex = true;
        }

        if(isHex  && (userRole==='police' || userRole==='lab' || userRole==='court') ){
            const done = await contract.addUser(userAddress,userRole);
            // console.log(done)
            onSubmit({userAddress,userRole});
            onClose();
        }
        else{
            alert("Invalid Data Entered");
            setUserAddress("");
            setUserRole("");
            document.getElementById('address').value = "";
            document.getElementById('userRole').value = "";
        }

    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="popupAddUser">
            <div className="nav">
                <button onClick={onClose}>X</button>
            </div>
            <div className="AddUserWrapper">
                <h2>AddUser</h2>
                <form className='AddUserForm' onSubmit={handleSubmit}>
                    <input type="text" name="address" id="address" placeholder='Address' onChange={handleChange} />
                    <input type="text" name="userRole" id="userRole" placeholder='Role (police/lab/court)' onChange={handleChange} />
                    <div className='btnDiv'>
                        <button className="AddUserBtn bold"  type='submit'>Add User</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddUser