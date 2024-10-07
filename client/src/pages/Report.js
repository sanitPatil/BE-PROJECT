import React from 'react'
import '../styles/report.css'
import { useState, useEffect } from 'react';
import axios from 'axios';
import UpdateReport from '../components/UpdateReport';
import { IoIosArrowRoundBack } from "react-icons/io";
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';


const Report = ({ contract, account, role }) => {

    const params = useParams();
    const reportId = params["reportId"];

    //Dealing with update Reports data
    const [isOpenReport, setIsOpenReport] = useState(false);
    const openPopupReport = () => {
        setIsOpenReport(true);

    };
    const closePopupReport = () => {
        setIsOpenReport(false);

    };
    const handleReportSubmit = (formData) => {
        console.log('Form data:', formData);
    };


    //Dealing with reports,extrainfo,etc
    const [report, setReport] = useState([]);
    const [extraInfo, setExtraInfo] = useState({});
    const [reportS, setReportS] = useState();

    const getReportFromContract = async () => {

        if (contract && account) {

            try {
                const tempObj = await contract.getReportDetails(reportId);
                let updatedObj = {};
                if (tempObj) {
                    updatedObj.reportId = reportId;
                    updatedObj.caseId = parseInt(tempObj.case_id);

                    const tempDT = parseInt(tempObj.datetimeReceived);
                    const datetimeString = new Date(tempDT * 1000).toLocaleString();
                    updatedObj.datetimeReceived = datetimeString;
                    updatedObj.case_desc = tempObj.case_desc;
                    updatedObj.case_owner = tempObj.case_owner;
                    updatedObj.testDesc = tempObj.testDesc;
                    updatedObj.evidenceCids = tempObj.evidenceCids;
                    if (tempObj.reportInference.length === 0) {

                        updatedObj.reportInference = "Not Provided Yet";
                    }
                    else {
                        updatedObj.reportInference = tempObj.reportInference;

                    }
                    updatedObj.reportCids = tempObj.reportCids;
                    updatedObj.reportStatus = tempObj.reportStatus;

                    updatedObj.evidenceCids.map((item, i) => {
                        if (i == Object.keys(updatedObj.evidenceCids).length - 1) {
                            const pinataUrl = item;
                            axios.get(pinataUrl)
                                .then(response => {
                                    const jsonData = response.data;
                                    setExtraInfo(jsonData)
                                })
                                .catch(error => {
                                    console.error('Error retrieving JSON file:', error);
                                });
                        }
                    })
                }
                setReport(updatedObj);

                if (updatedObj.reportInference === "Not Provided Yet") {
                    setReportS(0);
                }
                else {
                    setReportS(1);
                }

            } catch (error) {
                console.log(error);
            }
        }
    }

    //view Evidence functions

    const [evidenceImages, setEvidenceImages] = useState()

    const viewEvidence = (e) => {
        e.preventDefault();
        if (document.getElementById('viewEvidenceBtn').innerHTML == "View Evidences") {
            if (account) {
                const evidenceArrays = report.evidenceCids;
                // console.log(Object.keys(evidenceArrays).length);
                if (Object.keys(evidenceArrays).length == 1) {
                    document.getElementById("noEvidenceH4").style.display = "block";
                }
                else {
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

    //view Reports functions

    const [reportFiles, setReportFiles] = useState()

    const viewReports = (e) => {
        e.preventDefault();
        getReportFromContract();
        if (document.getElementById('viewReportBtn').innerHTML === "View Reports") {
            if (account) {
                const reportsArray = report.reportCids;
                // console.log(reportsArray);
                // console.log(Object.keys(reportsArray).length);
                if (Object.keys(reportsArray).length === 0) {
                    document.getElementById("noReportH4").style.display = "block";
                }
                else {
                    document.getElementById("reportText").style.display = "block";

                    const reportDocuments = reportsArray.map((item, i) => {
                        // console.log(item, i);
                        return (<a href={item} key={`a-${i}`} target='_blank' rel='noopener noreferrer'>
                            <img key={`img-${i}`} src={item} alt='images' className="reportFilesImages"></img>
                        </a>)
                    })

                    setReportFiles(reportDocuments);
                }
            }

            document.getElementById('viewReportBtn').innerHTML = "Hide Reports";
            document.getElementById('reports').style.display = "block";
            document.getElementById('reportPart').style.display = "block";
        }
        else {
            document.getElementById('reports').style.display = "none";
            document.getElementById('reportPart').style.display = "none";
            document.getElementById('reportText').style.display = "none";
            document.getElementById('viewReportBtn').innerHTML = "View Reports";
        }
    }


    const markAsDone = async (e) => {
        e.preventDefault();
        if (report.reportStatus == "Pending") {
            // console.log("i if")

            const res = window.confirm("Are You sure You want to Mark Report As Done ?");
            try {
                if (res && account && report.reportStatus === "Pending") {
                    const res = await contract.markReportAsDone(reportId);
                    if (res) {
                        alert("Successfully Marked as Done");
                        // console.log(res);
                        getReportFromContract();
                        document.getElementById("markDoneBtn").innerHTML = "Marked Done";
                        document.getElementById("markDoneBtn").classList.add("greenBgNonChangable");
                        document.getElementById("markDoneBtn").classList.remove("redBg");
                    }
                }
                else {
                    return;
                }
            } catch (error) {
                console.log(error);
            }
        }
    }

    const handleRefresh = (e) => {
        e.preventDefault();
        getReportFromContract();
    }

    useEffect(() => {
        if (contract && account) {
            getReportFromContract();
            console.log(report);
        }
    }, [contract])
    return (
        <div className="reportPage">
            <UpdateReport id="updateReportBox" reportId={reportId} isOpenReport={isOpenReport} onClose={closePopupReport} onSubmit={handleReportSubmit} contract={contract} account={account} />
            {role == "lab" && account && contract ?
                <>
                    <Link className="goBack" to={"../../lab"}>
                        <IoIosArrowRoundBack id='backBtn' />
                    </Link>
                    <div className="basicDetails">
                        <div className="leftCaseDetails">
                            <h4>Basic Details</h4>
                            <div className="entry">
                                <div className='label'>Report Id</div>
                                <div className='value'>{reportId}</div>
                            </div>
                            <div className="entry">
                                <div className='label'>Case Id</div>
                                <div className='value'>{report.caseId}</div>
                            </div>
                            <div className="entry">
                                <div className='label'>Case Owner</div>
                                <div className='value'>{report.case_owner}</div>
                            </div>
                            <div className="entry">
                                <div className='label'>Case Description</div>
                                <div className='value'> {report.case_desc}</div>
                            </div>
                            <div className="entry">
                                <div className='label'>Report Status</div>
                                <div className='value bold'> {report.reportStatus}</div>
                            </div>
                            <div className="entry">
                                <div className='label'>Report Inference</div>
                                <div className='value '> {report.reportInference}</div>
                            </div>
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
                                {(extraInfo.key1 != "" && extraInfo.value1 != "") ?
                                    <div className="entry">
                                        <div className='label'>{extraInfo.key1}</div>
                                        <div className='value'>{extraInfo.value1}</div>
                                    </div>
                                    : <></>}
                                {(extraInfo.key2 != "" && extraInfo.value2 != "") ?
                                    <div className="entry">
                                        <div className='label'>{extraInfo.key2}</div>
                                        <div className='value'>{extraInfo.value2}</div>
                                    </div>
                                    : <></>}
                                {(extraInfo.key3 != "" && extraInfo.value3 != "") ?
                                    <div className="entry">
                                        <div className='label'>{extraInfo.key3}</div>
                                        <div className='value'>{extraInfo.value3}</div>
                                    </div>
                                    : <>
                                    </>}
                                {extraInfo.key1 === "" && !extraInfo.key2 === "" && !extraInfo.key3 === "" ?
                                    <h4 style={{ textAlign: "center" }}>No Extra Information</h4> : <></>
                                }
                            </div>
                            <div className="access">
                                <h4>Test Details</h4>
                                <div className="entry">
                                    <div className='label'>Time Received</div>
                                    <div className='value'>{report.datetimeReceived}</div>
                                </div>
                                <div className="entry">
                                    <div className='label'>Test Description</div>
                                    <div className='value'>{report.testDesc}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="reportActions">
                        <div className="leftOne">{
                            report.reportStatus === "Pending" ?
                                <div className=" action_btns redBg assignLab fs " onClick={markAsDone} title='Mark as Done' id='markDoneBtn'>Mark as Done</div> :
                                <div className=" action_btns greenBgNonChangable assignLab  fs" id='markDoneBtn'>Marked Done</div>

                        }</div>
                        <div className="rightOne">
                            <div className=" action_btns greyBg viewEvidences" onClick={handleRefresh} >Refresh</div>
                            <div className=" action_btns blueBg viewEvidences" onClick={viewEvidence} id='viewEvidenceBtn'>View Evidences</div>
                            {reportS === 1 ? <div className=" action_btns blueBg viewReports" onClick={viewReports} id='viewReportBtn'>View Reports</div> : <></>}
                            {report.reportStatus !== "Done" ? <div className=" action_btns greenBg assignLab" onClick={openPopupReport} >Update Report</div> : <></>}
                        </div>

                    </div>

                    <div id="display">
                        <div id="evidencePart">
                            <h4 id='evidenceText'>Evidences</h4>
                            <h4 id="noEvidenceH4">No Evidence Provided</h4>
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

                    </div></> :

                <div className="accessDenied">
                    <div class="w3-display-middle">
                        <h1 class="w3-jumbo w3-animate-top w3-center"><code>Access Denied</code></h1>
                        <hr class="w3-border-white w3-animate-left" style={{ "margin": "auto", "width": "50%" }} />
                        <h3 class="w3-center w3-animate-right">You dont have permission to view this site.</h3>
                        <h3 class="w3-center w3-animate-zoom">🚫🚫🚫🚫</h3>
                        <h6 class="w3-center w3-animate-zoom"><strong>Error Code</strong>: 403 forbidden</h6>
                    </div>
                </div>}
        </div>

    )
}

export default Report