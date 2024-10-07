import React from 'react'
import '../styles/police.css'
import { useState, useEffect } from 'react';
import AddCases from '../components/AddCases';
import { FiExternalLink } from "react-icons/fi";
import { Link } from 'react-router-dom';


const Police = ({ account, contract, role }) => {

  //Dealing with add cases data
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


  // //Dealing with get cases data

  const [cases, setCases] = useState([]);
  const [pendingCaseCount, setPendingCaseCount] = useState(0);


  const getCasesDataFromContract = async () => {
    let AllCasesObj = [];

    if (contract) {
      const listOfCaseIds = await contract.listAllCases(account);
      let countPending = 0;

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
              console.log('Datetime retrieved successfully:', datetimeString);

              updatedObj.datetime = datetimeString;
              updatedObj.evidenceCollected_by = tempObj.evidenceCollected_by;
              updatedObj.evidenceCids = tempObj.evidenceCids;
              if (tempObj.labAssigned === "0x0000000000000000000000000000000000000000") {
                updatedObj.labAssigned = "No";
              } else {
                updatedObj.labAssigned = tempObj.labAssigned;
              }

            const tempPendingCase = await contract.getCOC(listOfCaseIds[i]);
            updatedObj.status = tempPendingCase[tempPendingCase.length-1].status;
            if(tempPendingCase[tempPendingCase.length-1].status == 'Unsolved'){
              countPending+=1;
            }
            }
            AllCasesObj.push(updatedObj);


          } catch (error) {
            alert(error);
          }
        }

        setPendingCaseCount(countPending)
      }
      else {
        return null;
      }
    }
    setCases(AllCasesObj);
  }

  const handleRefreshCases = () => {
    getCasesDataFromContract();
    console.log(cases[0]);
  }

  useEffect(() => {
    if (contract) {
      getCasesDataFromContract();
      console.log(cases);
    }
  }, [contract || cases])



  return (
    <div className='policePage' id='policePage'>
      <AddCases id="addCasesBox" isOpen={isOpen} onClose={closePopup} onSubmit={handleSubmit} contract={contract} account={account} />
      {(role == "police") && account && contract ?
        <>
          <div className="personalInfo">
            <div className="left">
              <div className="entry">
                <div className="label">Your Address</div>
                <div className="value">{account}</div>
              </div>
              <div className="entry">
                <div className="label">Number of Cases Owned</div>
                <div className="value">{cases.length}</div>
              </div>
              <div className="entry">
                <div className="label">Number of Cases Pending</div>
                <div className="value">{pendingCaseCount}</div>
              </div>
              <div className="entry">
                <div className="label">Number of Cases Solved</div>
                <div className="value">{cases.length - pendingCaseCount}</div>
              </div>
            </div>
          </div>
          <div className="actions">
            <p className='btn grey bold' onClick={handleRefreshCases}> Refresh</p>
            <p className="btn green bold" onClick={openPopup}>Add Case</p>
          </div>
          <div className="cases">
            <h3>Cases List</h3>
            <div id='caseTable'>
              <ul className="responsive-table_case">
                <li className="caseTable-header_case">
                  <div className="col col-1 bold">Case Id</div>
                  <div className="col col-2 bold">Description</div>
                  <div className="col col-3 bold">TimeStamp</div>
                  <div className="col col-4 bold">Collected By</div>
                  <div className="col col-5 bold">Evidence Count</div>
                  <div className="col col-6 bold">Lab Assigned</div>
                  <div className="col col-7 bold">Case Status</div>
                  <div className="col col-8 bold">Go To Case</div>
                </li>
                {cases ?
                  cases.map((singleCase) => {
                    return (
                      <li className="caseTable-row_case" key={singleCase.caseId}>
                        <div className="col col-1" data-label="Case Id">{singleCase.caseId}</div>
                        <div className="col col-2" data-label="Case Description">{singleCase.desc}</div>
                        <div className="col col-3" data-label="timestamp">{singleCase.datetime}</div>
                        <div className="col col-4" data-label="Collected by">{singleCase.evidenceCollected_by}</div>
                        {/* <div className="col col-5 size14" data-label="Evidence Links">{singleCase.evidenceCids.map((cid) => {
                          return (
                            <>
                              <p id='indiCid' key={cid}>{cid.substring(58)}</p><br></br></>
                          )
                        })} */}
                        <div className="col col-5 size14" data-label="Evidence counts">{singleCase.evidenceCids.length-1}</div>
                        <div className="col col-6 size14" data-label="Lab Assigned">{singleCase.labAssigned}</div>
                        <div className="col col-7 size14" data-label="Case Status">{singleCase.status}</div>
                        <Link to={`../cases/${singleCase.caseId}`} className="col col-8" data-label="Goto"><FiExternalLink className='icons' /></Link>
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
        </>
      }
    </div>
  )
}

export default Police

