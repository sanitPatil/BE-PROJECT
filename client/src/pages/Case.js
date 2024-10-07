import React from 'react'
import { useState, useEffect } from 'react';
import '../styles/case.css'
import axios from 'axios';
import AssignLab from '../components/AssignLab';
import GrantCourt from '../components/GrantCourt';
import RevokeCourt from '../components/RevokeCourt';
import { useParams } from 'react-router-dom';
import { IoIosArrowRoundBack } from "react-icons/io";
import { Link } from 'react-router-dom';


const Case = ({ contract, account, role }) => {

    const params = useParams("caseId");
    const caseId = params["caseId"]
    //Dealing with assign lab data
    const [isOpenAssignLab, setIsOpenAssignLab] = useState(false);

    const openAssignLabPopup = () => {
        setIsOpenAssignLab(true);
    };

    const closeAssignLabPopup = () => {
        setIsOpenAssignLab(false);
    };

    const handleAssignLabSubmit = (formData) => {
        console.log('Form data:', formData);
        getCaseFromContract();
    };

    //Dealing with grant Court data
    const [isOpenGrantCourt, setIsOpenGrantCourt] = useState(false);

    const openGrantCourtPopup = () => {
        setIsOpenGrantCourt(true);
    };

    const closeGrantCourtPopup = () => {
        setIsOpenGrantCourt(false);
    };

    const handleGrantCourtSubmit = (formData) => {
        console.log('Form data:', formData);
        getCaseFromContract();
    };

    //Dealing with revoke Court data
    const [isOpenRevokeCourt, setIsOpenRevokeCourt] = useState(false);

    const openRevokeCourtPopup = () => {
        setIsOpenRevokeCourt(true);
    };

    const closeRevokeCourtPopup = () => {
        setIsOpenRevokeCourt(false);
    };

    const handleRevokeCourtSubmit = (formData) => {
        console.log('Form data:', formData);
        getCaseFromContract();
    };

    //main functions display information

    const [caseDetails, setCaseDetails] = useState({});//done
    const [evidenceImages, setEvidenceImages] = useState();//done
    const [extraInfo, setExtraInfo] = useState({});//done
    const [coc, setCoc] = useState([]);//done
    const [reportDetails, setReportDetails] = useState([])//done
    const [reportFiles, setReportFiles] = useState([])//done
    const [inferenceFiles, setInferenceFiles] = useState([])//done
    const [reportS, setReportS] = useState()//done


    const getCocFromContract = async () => {

        if (contract && account) {
            try {
                const cocData = await contract.getCOC(caseId);
                let updatedCoc = [];
                for (let i = 0; i < cocData.length; i++) {

                    const individualCoc = {};
                    const tempDT = parseInt(cocData[i].datetime);
                    const datetimeString = new Date(tempDT * 1000).toLocaleString();
                    individualCoc.datetime = datetimeString;
                    individualCoc.action = cocData[i].action;
                    individualCoc.performed_by = cocData[i].performed_by;
                    individualCoc.status = cocData[i].status;
                    updatedCoc.push(individualCoc);
                }
                setCoc(updatedCoc)
            } catch (error) {
                console.log(error);
            }

        }
        else {
            console.log("No Contract/Account Found");
        }
        console.log(coc)

    }

    const getCaseFromContract = async () => {

        if (contract && account) {
            try {
                const caseDetailsObj = await contract.getCaseDetails(caseId);
                let updatedObj = {};
                if (caseDetailsObj) {
                    if (caseDetailsObj.owner != account) {
                        // console.log("You Are Not Allowed to access This Case");
                        alert("You are trying to access the case that you are not allowed")
                        return;
                    }
                    updatedObj.desc = caseDetailsObj.desc;
                    updatedObj.owner = caseDetailsObj.owner;

                    const tempDT = parseInt(caseDetailsObj.datetime); // Convert the retrieved value to a JavaScript number
                    const datetimeString = new Date(tempDT * 1000).toLocaleString(); // Convert Unix timestamp back to datetime string
                    updatedObj.datetime = datetimeString;

                    updatedObj.evidenceCollected_by = caseDetailsObj.evidenceCollected_by;
                    updatedObj.evidenceCids = caseDetailsObj.evidenceCids;
                    updatedObj.reportIds = caseDetailsObj.reportIds;
                    updatedObj.inference = caseDetailsObj.inference;
                    updatedObj.inferenceIds = caseDetailsObj.inferenceIds;

                    if (caseDetailsObj.labAssigned === "0x0000000000000000000000000000000000000000") {
                        updatedObj.labAssigned = "No";
                    } else {
                        updatedObj.labAssigned = caseDetailsObj.labAssigned;
                    }
                    // console.log(updatedObj)

                    const courtAccessed = await contract.getCourtsAccessed(caseId);

                    if (courtAccessed.length > 0) {
                        updatedObj.courtsAccessed = courtAccessed;
                    } else {
                        updatedObj.courtsAccessed = "No";
                    }

                    const tempPendingCase = await contract.getCOC(caseId);
                    updatedObj.status = tempPendingCase[tempPendingCase.length - 1].status;

                    updatedObj.evidenceCids.map((item, i) => {
                        if (i == Object.keys(updatedObj.evidenceCids).length - 1) {
                            const pinataUrl = item;
                            axios.get(pinataUrl)
                                .then(response => {
                                    const jsonData = response.data;
                                    // console.log(jsonData)
                                    setExtraInfo(jsonData);
                                })
                                .catch(error => {
                                    console.error('Error retrieving JSON file:', error);
                                });
                        }
                    })

                }


                setCaseDetails(updatedObj);
                // console.log(updatedObj.reportIds)

                await getCocFromContract();

                //getting report details


                const reportId = await updatedObj.reportIds;

                if (updatedObj.labAssigned === "No") {
                    setReportS(0);
                }
                else {
                    const reportDetailsReq = await contract.getReportDetails(reportId[0]);
                    let tempReportDetails = {};
                    tempReportDetails.reportInference = reportDetailsReq.reportInference;
                    tempReportDetails.reportStatus = reportDetailsReq.reportStatus;
                    tempReportDetails.reportCids = reportDetailsReq.reportCids;
                    // console.log(reportDetails.reportStatus);
                    if (tempReportDetails.reportStatus === "Pending") {
                        setReportS(1);
                        return;
                    }
                    else {
                        // console.log(tempReportDetails)
                        setReportDetails(tempReportDetails)
                        setReportS(2);
                    }

                }

                // console.log(reportS)



            } catch (error) {
                console.log(error);
            }
        }
        else {
            return null;
        }
    }

    //view Evidence functions

    const viewEvidence = (e) => {
        e.preventDefault();
        if (document.getElementById('viewEvidenceBtn').innerHTML == "View Evidences") {
            if (account == caseDetails.owner) {
                const evidenceArrays = caseDetails.evidenceCids;
                console.log(Object.keys(caseDetails.evidenceCids))
                if (Object.keys(evidenceArrays).length == 1) {
                    console.log("here")
                    document.getElementById("noEvidenceH4").style.display = "block";
                }
                else {
                    console.log("dkflaj")
                    document.getElementById("evidenceText").style.display = "block";

                    const evidences = evidenceArrays.map((item, i) => {
                        // console.log(i);
                        if (i != Object.keys(evidenceArrays).length - 1) {
                            return (<a href={item} key={`a-${i}`} target='_blank' rel='noopener noreferrer'>
                                <img key={`img-${i}`} src={item} alt='images' className="evidenceImages"></img>
                            </a>)
                        }
                    })

                    setEvidenceImages(evidences);
                }
            }

            document.getElementById('viewEvidenceBtn').innerHTML = "Hide Evidences";
            document.getElementById('evidences').style.display = "block";
            document.getElementById('evidencePart').style.display = "block";
        }
        else {
            document.getElementById('evidences').style.display = "none";
            document.getElementById('evidencePart').style.display = "none";
            document.getElementById('evidenceText').style.display = "none";
            document.getElementById('viewEvidenceBtn').innerHTML = "View Evidences";
        }

    }


    //view Coc functions
    const viewCoc = (e) => {
        e.preventDefault();
        if (document.getElementById('viewCocBtn').innerHTML === "View CoC") {
            document.getElementById('cocPart').style.display = "block";
            document.getElementById('viewCocBtn').innerHTML = "Hide CoC";
        }
        else {
            document.getElementById('cocPart').style.display = "none";
            document.getElementById('viewCocBtn').innerHTML = "View CoC";
        }
    }


    const viewReports = async (e) => {
        e.preventDefault();
        getCaseFromContract();
        if (document.getElementById('viewReportBtn').innerHTML == "View Report Details" && account && caseDetails) {

            if (caseDetails.reportIds.length > 0) {

                try {
                    const reportsArray = reportDetails.reportCids;
                    // console.log(reportsArray);
                    // console.log(Object.keys(reportsArray).length);
                    if (Object.keys(reportsArray).length == 0) {
                        document.getElementById("noReportH4").style.display = "block";
                        return;
                    }
                    document.getElementById("reportText").style.display = "block";

                    const reportDocuments = reportsArray.map((item, i) => {
                        // console.log(item, i);
                        return (<a href={item} key={`a-${i}`} target='_blank' rel='noopener noreferrer'>
                            <img key={`img-${i}`} src={item} alt='images' className="reportFilesImages"></img>
                        </a>)
                    })


                    setReportFiles(reportDocuments);
                    document.getElementById('viewReportBtn').innerHTML = "Hide Report Details";
                    document.getElementById('reports').style.display = "block";
                    document.getElementById('reportPart').style.display = "block";


                } catch (error) {
                    console.log(error);
                }
            }
            else {
                console.log("No Reports Send by the Lab yet");
                return;
            }
        }

        else {
            document.getElementById('reports').style.display = "none";
            document.getElementById('reportPart').style.display = "none";
            document.getElementById('reportText').style.display = "none";
            document.getElementById('viewReportBtn').innerHTML = "View Report Details";
        }
    }

    const viewInferences = async (e) => {
        e.preventDefault();
        if (document.getElementById('viewInferenceBtn').innerHTML == "View Inference Reports" && account && caseDetails) {
            try {
                const reportsArray = caseDetails.inferenceIds;
                console.log(Object.keys(reportsArray).length)
                if (Object.keys(reportsArray).length == 0) {
                    document.getElementById("noInferenceH4").style.display = "block";
                    return;
                }
                document.getElementById("inferenceText").style.display = "block";
                document.getElementById("noInferenceH4").style.display = "none";

                const reportDocuments = reportsArray.map((item, i) => {
                    // console.log(item, i);
                    return (<a href={item} key={`a-${i}`} target='_blank' rel='noopener noreferrer'>
                        <img key={`img-${i}`} src={item} alt='images' className="reportFilesImages"></img>
                    </a>)
                })

                setInferenceFiles(reportDocuments);
                document.getElementById('viewInferenceBtn').innerHTML = "Hide Inference Reports";
                document.getElementById('inferences').style.display = "block";
                document.getElementById('inferencePart').style.display = "block";


            } catch (error) {
                console.log(error);
            }
        }

        else {
            document.getElementById('inferences').style.display = "none";
            document.getElementById('inferencePart').style.display = "none";
            document.getElementById('inferenceText').style.display = "none";
            document.getElementById('viewInferenceBtn').innerHTML = "View Inference Reports";
        }
    }

    const handleRefreshBtnCoc = () => {
        getCocFromContract();
        console.log(extraInfo)
    }


    const handleRefreshCases = () => {
        getCaseFromContract();
    }


    useEffect(() => {
        if (contract) {
            getCaseFromContract();
            getCocFromContract();
            // console.log(caseDetails);
            // console.log(coc);
        }
    }, [contract])

    return (<>
        <div className="casePage">
            <AssignLab caseId={caseId} isOpenAssignLab={isOpenAssignLab} onClose={closeAssignLabPopup} onSubmit={handleAssignLabSubmit} contract={contract} />
            <GrantCourt caseId={caseId} isOpenGrantCourt={isOpenGrantCourt} onClose={closeGrantCourtPopup} onSubmit={handleGrantCourtSubmit} contract={contract} courtsAssigned={caseDetails.courtsAccessed} />
            <RevokeCourt caseId={caseId} isOpenRevokeCourt={isOpenRevokeCourt} onClose={closeRevokeCourtPopup} onSubmit={handleRevokeCourtSubmit} contract={contract} courtsAssigned={caseDetails.courtsAccessed} />

            {
                role == "police" && account && contract ?
                    <>
                        <Link to={"../../police"} className="goBack">
                            <IoIosArrowRoundBack id='backBtn' />
                        </Link>
                        <div className="basicDetails">
                            <div className="leftCaseDetails">
                                <h4>Case Details</h4>
                                <div className="entry">
                                    <div className='label'>Case Id</div>
                                    <div className='value'>{caseId}</div>
                                </div>
                                <div className="entry">
                                    <div className='label'>Owner</div>
                                    <div className='value'>{caseDetails.owner}</div>
                                </div>
                                <div className="entry">
                                    <div className='label'>Time Stamp</div>
                                    <div className='value'>{caseDetails.datetime}</div>
                                </div>
                                <div className="entry">
                                    <div className='label'>Description</div>
                                    <div className='value'>{caseDetails.desc} </div>
                                </div>
                                <div className="entry">
                                    <div className='label'>Collected By</div>
                                    <div className='value'>{caseDetails.evidenceCollected_by}</div>
                                </div>
                                <div className="entry">
                                    <div className='label'>Status</div>
                                    <div className='value'><b>{caseDetails.status}</b></div>
                                </div>
                                <h4>Report Details</h4>
                                {reportS == 0 ?
                                    <div className='centertext'>No Lab Assigned Yet</div> : <></>}
                                {reportS == 1 ?
                                    <div className='centertext'>Lab Haven't yet Submitted Report with Report Id as {parseInt(caseDetails.reportIds[0])}</div> : <></>}
                                {reportS == 2 ?
                                    <>
                                        <div className="entry">
                                            <div className='label'>Report Id's</div>
                                            <div className='value'>{parseInt(caseDetails.reportIds[0])}</div>
                                        </div>
                                        <div className="entry">
                                            <div className='label'>Report Status</div>
                                            <div className='value txtGreen'><b>{reportDetails.reportStatus}</b></div>
                                        </div>
                                        <div className="entry">
                                            <div className='label'>Report Inference</div>
                                            <div className='value'><b>{reportDetails.reportInference}</b></div>
                                        </div>
                                        <div className="entry">
                                            <div className='label'>Report Files</div>
                                            <div className='value'>{Object.keys(reportDetails.reportCids).length} </div>

                                        </div></> : <></>}
                            </div>
                            <div className="rightCaseDetails">
                                <div className="more">
                                    <h4>More Details</h4>
                                    {(Object.keys(extraInfo).length === 0) ?
                                        <div style={{ textAlign: "center" }}>
                                            No More Details Provided
                                        </div>
                                        : <>
                                        </>}
                                    {(extraInfo.key1 !== "" && extraInfo.value1 !== "") ?
                                        <div className="entry">
                                            <div className='label'>{extraInfo.key1}</div>
                                            <div className='value'>{extraInfo.value1}</div>
                                        </div>
                                        : <>
                                        </>}
                                    {(extraInfo.key2 !== "" && extraInfo.value2 !== "") ?
                                        <div className="entry">
                                            <div className='label'>{extraInfo.key2}</div>
                                            <div className='value'>{extraInfo.value2}</div>
                                        </div>
                                        : <></>}
                                    {(extraInfo.key3 !== "" && extraInfo.value3 !== "") ?
                                        <div className="entry">
                                            <div className='label'>{extraInfo.key3}</div>
                                            <div className='value'>{extraInfo.value3}</div>
                                        </div>
                                        : <></>}
                                </div>
                                <div className="access">
                                    <h4>Access Details</h4>
                                    <div className="entry">
                                        <div className='label'>Courts Granted</div>
                                        <div className='value'>{caseDetails.courtsAccessed}</div>
                                    </div>
                                    <div className="entry">
                                        <div className='label'>Lab Assigned</div>
                                        <div className='value'>{caseDetails.labAssigned}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {caseDetails.status == "Solved" ?
                            <div className="finalInference">
                                <h4>Final Inference</h4>
                                <p>{caseDetails.inference}</p>
                            </div> : <></>}
                        <div className="caseActions">
                            <p className='btn grey bold action_btns' onClick={handleRefreshCases}> Refresh</p>

                            <div className=" action_btns blueBg viewEvidences" onClick={viewEvidence} id='viewEvidenceBtn'>View Evidences</div>
                            <div className=" action_btns blueBg viewCoc" id='viewCocBtn' onClick={viewCoc} >View CoC</div>
                            {reportS == 2 ?
                                <div className=" action_btns blueBg viewReports" id='viewReportBtn' onClick={viewReports}>View Report Details</div> : <></>}
                            {caseDetails.status == "Solved" ?
                                <div className=" action_btns blueBg viewInference" id='viewInferenceBtn' onClick={viewInferences} >View Inference Reports</div> : <></>}
                            {reportS == 0 ?
                                <div className=" action_btns greenBg assignLab" onClick={openAssignLabPopup}>Assign Lab</div> : <></>}
                            <div className=" action_btns greenBg grantCourt" onClick={openGrantCourtPopup}>Grant Court</div>
                            <div className=" action_btns redBg revokeCourt" onClick={openRevokeCourtPopup}>Revoke Court</div>
                        </div>
                        <div id="display">
                            <div id="evidencePart">
                                <h4 id="noEvidenceH4">No Evidence Provided</h4>
                                <h4 id='evidenceText'>Evidences</h4>
                                <div id="evidences">
                                    {evidenceImages}
                                </div>
                            </div>
                            <div id="reportPart">
                                <h4 id='reportText'>Reports</h4>
                                <h4 id="noReportH4">No Reports Submitted</h4>
                                <div id="reports">
                                    {reportFiles}
                                </div>
                            </div>
                            <div id="inferencePart">
                                <h4 id='inferenceText'>Inference Report</h4>
                                <h4 id="noInferenceH4">No Inference Report Posted</h4>
                                <div id="inferences">
                                    {inferenceFiles}
                                </div>
                            </div>
                            <div id="cocPart">
                                <h4 id='cocText'>Chain Of Custody</h4>
                                <div className="actions" id='actions80'>
                                    <p className='btn grey bold' onClick={handleRefreshBtnCoc}> Refresh</p>
                                </div>
                                <div className="table">
                                    <ul className="responsive-table-coc">
                                        <li className="table-header">
                                            <div className="col col-1 bold">Time Stamp</div>
                                            <div className="col col-2 bold">Action</div>
                                            <div className="col col-3 bold">Performed By</div>
                                            <div className="col col-4 bold">Case Status</div>
                                        </li>
                                        {coc ?
                                            coc.map((indiCoc) => {
                                                return (
                                                    <li className="table-row" key={indiCoc.datetime}>
                                                        <div className="col col-1" data-label="Time Stamp">{indiCoc.datetime}</div>
                                                        <div className="col col-2" data-label="Action">{indiCoc.action}</div>
                                                        <div className="col col-3" data-label="Performed by">{indiCoc.performed_by}</div>
                                                        <div className="col col-4" data-label="Status">{indiCoc.status}</div>
                                                    </li>
                                                )
                                            })
                                            :
                                            <li>No Coc</li>}
                                    </ul>
                                </div>
                            </div>


                        </div></> :

                    <div className="accessDenied">
                        <div class="w3-display-middle">
                            <h1 class="w3-jumbo w3-animate-top w3-center"><code>Access Denied</code></h1>
                            <hr class="w3-border-white w3-animate-left" style={{ "margin": "auto", "width": "50%" }} />
                            <h3 class="w3-center w3-animate-right">You dont have permission to view this site.</h3>
                            <h3 class="w3-center w3-animate-zoom">🚫🚫🚫🚫</h3>
                            <h6 class="w3-center w3-animate-zoom"><strong>Error Code</strong>: 403 forbidden</h6>
                        </div>
                    </div>
            }
        </div>
    </>
    );
};


export default Case