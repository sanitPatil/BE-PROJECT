import React from 'react'
import '../styles/court.css'
import { useState, useEffect } from 'react';
import { FiExternalLink } from "react-icons/fi";
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';


const Court = ({ account, contract, role }) => {

  // //Dealing with get cases data

  const [cases, setCases] = useState([]);
  const [pendingCases, setPendingCases] = useState(0);

  const getCasesAssignedToCourt = async () => {
    let AllCases = [];
    let listOfCaseIds = [];

    if (contract && account) {
      listOfCaseIds = await contract.getAllCasesAssignedToCourt(account);

      let countPending= 0 ;

      if (listOfCaseIds) {
        for (let i = 0; i < listOfCaseIds.length; i++) {
          try {
            const tempObj = await contract.getCaseDetails(listOfCaseIds[i]);
            let updatedObj = {};
            if (tempObj) {

              updatedObj.caseId = parseInt(listOfCaseIds[i]);
              updatedObj.desc = tempObj.desc;

              const tempDT = parseInt(tempObj.datetime); // Convert the retrieved value to a JavaScript number
              const datetimeString = new Date(tempDT * 1000).toLocaleString(); // Convert Unix timestamp back to datetime string
              // console.log('Datetime retrieved successfully:', datetimeString);

              updatedObj.datetime = datetimeString;
              updatedObj.owner = tempObj.owner;
              updatedObj.collected_by = tempObj.evidenceCollected_by[0];


              const tempPendingCase = await contract.getCOC(listOfCaseIds[i]);
              updatedObj.status = tempPendingCase[tempPendingCase.length - 1].status;
              if (tempPendingCase[tempPendingCase.length - 1].status == 'Unsolved') {
                countPending += 1;
              }

              if (tempObj.labAssigned === "0x0000000000000000000000000000000000000000") {
                updatedObj.labAssigned = "No";
              } else {
                updatedObj.labAssigned = tempObj.labAssigned;
              }
            }
            AllCases.push(updatedObj);
            setPendingCases(countPending)
          } catch (error) {
            alert(error);
          }
        }
      }
      else {
        return null;
      }
    }
    setCases(AllCases);
  }

  const handleRefreshCases = () => {
    getCasesAssignedToCourt();
    console.log(cases);
  }

  useEffect(() => {
    if (contract && account) {
      getCasesAssignedToCourt();
      console.log(cases);
    }
  }, [contract])

  return (
    <div className='courtPage' id='courtPage'>
      {(role == "court") && account && contract ?
        <>
          <div className="personalInfo">
            <div className="left">
              <div className="entry">
                <div className="label">Your Address</div>
                <div className="value">{account}</div>
              </div>
              <div className="entry">
                <div className="label">Number of Cases </div>
                <div className="value">{cases.length}</div>
              </div>
              <div className="entry">
                <div className="label">Number of Cases Pending</div>
                <div className="value">{pendingCases}</div>
              </div>
              <div className="entry">
                <div className="label">Number of Cases Solved</div>
                <div className="value">{cases.length - pendingCases}</div>
              </div>
            </div>
          </div>
          <div className="actions">
            <p className='btn grey bold' onClick={handleRefreshCases} >Refresh</p>
          </div>
          <div className="cases">
            <h3>Cases Assigned To Your Court </h3>
            <div id='caseTable'>
              <ul className="responsive-table_cases">
                <li className="caseTable-header_cases">
                  <div className="col col-1 bold">Case Id</div>
                  <div className="col col-2 bold">Description</div>
                  <div className="col col-3 bold">Case Owner</div>
                  <div className="col col-4 bold">Time Received</div>
                  <div className="col col-5 bold">Collected By</div>
                  <div className="col col-6 bold">Case Status</div>
                  <div className="col col-7 bold">Go To</div>
                </li>
                {cases ?
                  cases.map((indiCase) => {
                    return (
                      <li className="caseTable-row_cases" key={indiCase.caseId}>
                        <div className="col col-1" data-label="case Id">{indiCase.caseId}</div>
                        <div className="col col-2" data-label="Case Desc">{indiCase.desc}</div>
                        <div className="col col-3" data-label="Owner">{indiCase.owner}</div>
                        <div className="col col-4" data-label="TimeStamp">{indiCase.datetime}</div>
                        <div className="col col-5" data-label="Collected By">{indiCase.collected_by}</div>
                        <div className="col col-6" data-label="case Status">{indiCase.status}</div>
                        <Link to={`../viewCases/${indiCase.caseId}`} className="col col-7" data-label="Goto"><FiExternalLink className='icons' />
                        </Link>
                      </li>
                    )
                  })
                  :
                  <p>No Cases</p>}
              </ul>
            </div>
          </div></> :

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
        </>}
    </div>
  )
}

export default Court

