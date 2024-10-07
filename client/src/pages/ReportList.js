import React from 'react'
import '../styles/lab.css'
import { useState, useEffect } from 'react';
import { FiExternalLink } from "react-icons/fi";
import { Link } from 'react-router-dom';

import { useParams } from 'react-router-dom';

const ReportList = ({ account, contract, role }) => {

    // //Dealing with get cases data

    const params = useParams();
    const labAccount = params.labAccount;

    const [reports, setReports] = useState([]);

    const getReportsFromContract = async () => {
        let AllReports = [];

        let listOfReportIds = [];

        if (contract && account && role == "admin") {

            listOfReportIds = await contract.listAllReports(labAccount);

            if (listOfReportIds) {
                for (let i = 0; i < listOfReportIds.length; i++) {
                    try {
                        const tempObj = await contract.getReportDetails(listOfReportIds[i]);
                        let updatedObj = {};
                        if (tempObj) {
                            updatedObj.reportId = parseInt(listOfReportIds[i]);
                            updatedObj.caseId = parseInt(tempObj.case_id);

                            const tempDT = parseInt(tempObj.datetimeReceived); // Convert the retrieved value to a JavaScript number
                            const datetimeString = new Date(tempDT * 1000).toLocaleString(); // Convert Unix timestamp back to datetime string
                            // console.log('Datetime retrieved successfully:', datetimeString);

                            updatedObj.datetimeReceived = datetimeString;
                            updatedObj.case_desc = tempObj.case_desc;
                            updatedObj.case_owner = tempObj.case_owner;
                            updatedObj.testDesc = tempObj.testDesc;
                            updatedObj.evidenceCids = tempObj.evidenceCids;
                            updatedObj.reportInference = tempObj.reportInference;
                            updatedObj.reportCids = tempObj.reportCids;
                            updatedObj.reportStatus = tempObj.reportStatus;
                        }
                        AllReports.push(updatedObj);

                    } catch (error) {
                        alert(error);
                    }
                }
            }
            else {
                return null;
            }
        }
        setReports(AllReports);
    }

    const handleRefreshReports = () => {
        getReportsFromContract();
        console.log(reports);
    }

    useEffect(() => {
        if (contract && account) {
            // console.log(contract);
            getReportsFromContract();
            console.log(reports);
        }
    }, [contract])

    return (
        <div className='labPage' id='labPage'>
            {role == "admin" && account && contract ?
                <>
                    <div className="personalInfo">
                        <div className="left">
                            <div className="entry">
                                <div className="label">Lab Address</div>
                                <div className="value">{labAccount}</div>

                            </div>
                            <div className="entry">
                                <div className="label">Number of Cases Assigned</div>
                                <div className="value">{reports.length}</div>
                            </div>
                            <div className="entry">
                                <div className="label">Number of  Reports Pending</div>
                                <div className="value">4</div>
                            </div>
                        </div>
                    </div>
                    <div className="actions">
                        <p className='btn grey bold' onClick={handleRefreshReports} >Refresh</p>
                    </div>
                    <div className="reports">
                        <h3>Cases Assigned </h3>
                        <div id='reportTable'>
                            <ul className="responsive-table_reports">
                                <li className="reportTable-header_reports">
                                    <div className="col col-1 bold">Report Id</div>
                                    <div className="col col-2 bold">Case Owner</div>
                                    <div className="col col-3 bold">Case Id</div>
                                    <div className="col col-4 bold">Time Received</div>
                                    <div className="col col-5 bold">Test Description</div>
                                    <div className="col col-6 bold">Status</div>
                                    <div className="col col-7 bold">Go To</div>
                                </li>
                                {reports ?
                                    reports.map((report) => {
                                        return (
                                            <li className="caseTable-row_reports" key={report.reportId}>
                                                <div className="col col-1" data-label="report Id">{report.reportId}</div>
                                                <div className="col col-2" data-label="Case Owner">{report.case_owner}</div>
                                                <div className="col col-3" data-label="case Id">{report.caseId}</div>
                                                <div className="col col-4" data-label="TimeStamp">{report.datetimeReceived}</div>
                                                <div className="col col-5" data-label="testDesc">{report.testDesc}</div>
                                                <div className="col col-6" data-label="status">{report.reportStatus}</div>
                                                <Link to={`../viewReport/${report.reportId}`} className="col col-7" data-label="Goto"><FiExternalLink className='icons' />
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

export default ReportList

