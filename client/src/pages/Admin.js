import React from 'react'
import '../styles/admin.css'
import { useState, useEffect } from 'react'
import AddUser from '../components/AddUser'
import { FiExternalLink } from "react-icons/fi";
import { Link } from 'react-router-dom';


const Admin = ({ account, contract, role }) => {

  //Dealing with add users data
  const [isOpen, setIsOpen] = useState(false);

  const openPopup = () => {
    setIsOpen(true);
  };

  const closePopup = () => {
    setIsOpen(false);
  };

  const handleSubmit = (formData) => {
    console.log('Form data:', formData);
  };

  //Dealing with get users data

  const [users, setUsers] = useState([]);
  const [caseCount,setCaseCount] = useState();


  const getUsersDataFromContract = async () => {
    try {
      let AllUsersObj = [];
      let tempCaseCount = 0;

      if (contract) {
        const data = await contract.getUsers();
        for (let i = 0; i < data[0].length; i++) {
          let tempObj = {}
          tempObj["address"] = data[0][i];
          tempObj["role"] = data[1][i].charAt(0).toUpperCase() + data[1][i].slice(1);
          const cases =  await contract.listAllCases(data[0][i]);
          tempCaseCount += cases.length;
          if(cases.length)
          console.log(tempObj["address"], tempObj["role"]);
          AllUsersObj.push(tempObj);
        }

        setCaseCount(tempCaseCount);
      }
      setUsers(AllUsersObj)
    } catch (error) {
      console.log(error)
    }
  }

  const handleRefreshUsers = () => {
    getUsersDataFromContract();
    // console.log(users);
  }

  useEffect(() => {
    if (contract) {
      console.log(contract);
      getUsersDataFromContract();
      console.log(users);
    }
  }, [contract])



  return (
    <div id='adminPage'>
      <AddUser isOpen={isOpen} onClose={closePopup} onSubmit={handleSubmit} contract={contract} />
      {role == "admin" && account && contract ?
        <>
          <div className="personalInfo">

            <div className="left">
              <div className="entry">
                <div className="label">Your Address</div>
                <div className="value">{account}</div>
              </div>
              <div className="entry">
                <div className="label">Number of Users</div>
                <div className="value">{users.length}</div>
              </div>
              <div className="entry">
                <div className="label">Number of Cases Registered</div>
                <div className="value">{caseCount}</div>
              </div>
            </div>
          </div>
          <div className="actions">
            <p className='btn grey bold' onClick={handleRefreshUsers}>Refresh</p>
            <p className="btn green bold" onClick={openPopup}>Add User</p>
          </div>
          <div className="users">
            <h3>Users</h3>
            <div className="table">
              <ul className="responsive-table">
                <li className="table-header">
                  <div className="col col-1 bold">User Address</div>
                  <div className="col col-2 bold">Role</div>
                  <div className="col col-3 bold">More Details</div>
                </li>
                {users ?
                  users.map((user) => {
                    return (
                      <li className="table-row" key={user.address}>
                        <div className="col col-1" data-label="user Address">{user.address}</div>
                        <div className="col col-2" data-label="user Role">{user.role}</div>
                        {user.role == "Police" ?
                        <Link to={`../caseList/${user.address}`} className="col col-3" data-label="Goto"><FiExternalLink className='icons' /></Link>:
                        user.role == "Lab"?
                        <Link to={`../reportList/${user.address}`} className="col col-3" data-label="Goto"><FiExternalLink className='icons' /></Link>
                        :
                        <Link to={`../caseOfCourtList/${user.address}`} className="col col-3" data-label="Goto"><FiExternalLink className='icons' /></Link>
                        }

                      </li>
                    )
                  })
                  :
                  <li>No User</li>}
              </ul>
            </div>
          </div> </> :
// /reportList/:labAccount
        <>
          <div className="accessDenied">
            <div class="w3-display-middle">
              <h1 class="w3-jumbo w3-animate-top w3-center"><code>Access Denied</code></h1>
              <hr class="w3-border-white w3-animate-left" style={{ "margin": "auto", "width": "50%" }} />
              <h3 class="w3-center w3-animate-right">You dont have permission to view this site.</h3>
              <h3 class="w3-center w3-animate-zoom">🚫🚫🚫🚫</h3>
              <h6 class="w3-center w3-animate-zoom"><strong>Error Code</strong>: 403 forbidden</h6>
            </div>
          </div>
        </>
      }
    </div>
  )
}

export default Admin
