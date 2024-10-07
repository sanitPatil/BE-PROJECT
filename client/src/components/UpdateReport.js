import React from "react";
import { useState } from "react";
import "../styles/updateReport.css";

const UpdateReport = ({
  reportId,
  isOpenReport,
  onClose,
  onSubmit,
  contract,
  account,
}) => {
  //user address to be added

  const [reportFiles, setReportFiles] = useState([]);
  const [reportInference, setReportInference] = useState("");

  const handleChange = (e) => {
    setReportInference(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentTimestampMilliseconds = Date.now();
    const currentTimestampSeconds = Math.floor(
      currentTimestampMilliseconds / 1000
    );

    //validating the inputs

    //inference and file is must to add with

    const currReportInference = reportInference;
    const currReportFiles = reportFiles;

    if (!currReportInference || currReportFiles.length == 0) {
      alert("Invalid Report Update, Please Enter Complete Details");
      return;
    }
    const Rids = [];

    //coping with files

    if (currReportFiles) {
      try {
        if (currReportFiles.length > 0) {
          const headers = new Headers();
          headers.append("pinata_api_key", `ADD YOUR API KEY`);
          headers.append("pinata_secret_api_key", `SECRET`);

          for (let i = 0; i < currReportFiles.length; i++) {
            const formData = new FormData();
            formData.append("file", currReportFiles[i]);
            const resData = await fetch(
              "https://api.pinata.cloud/pinning/pinFileToIPFS",
              {
                method: "POST",
                headers: headers,
                body: formData,
              }
            );
            const data = await resData.json();
            Rids.push(
              `https://maroon-historical-firefly-523.mypinata.cloud/ipfs/${data.IpfsHash}`
            );
          }
        }
        onClose();
      } catch (error) {
        alert(error);
      }
    } else {
      console.log("no files / evidence /json file provided");
    }

    //pushing data into smart contract

    const resFromContractUpdateReport = await contract.updateReport(
      reportId,
      currentTimestampSeconds,
      Rids,
      currReportInference
    );

    if (resFromContractUpdateReport) {
      alert("Successfully Added a Case");
      onSubmit({ currReportInference, Rids });
    } else {
      alert("Some Problem Occured");
    }

    setReportFiles([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    //displaying essential details on ui
    if (files.length > 0) {
      document.getElementById(
        "fileLabel"
      ).innerHTML = `${files.length} Files Selected`;
    } else {
      document.getElementById("fileLabel").innerHTML = "Add Report Files";
    }
    setReportFiles(files);
  };

  if (!isOpenReport) {
    return null;
  }

  return (
    <div className="popupUpdateReport prevent-select">
      <div className="nav">
        <button onClick={onClose}>X</button>
      </div>
      <div className="UpdateReportWrapper">
        <h2>Update Report</h2>
        <form className="UpdateReportForm" onSubmit={handleSubmit}>
          <div className="details">
            <input
              type="text"
              name="reportInference"
              id="reportInference"
              placeholder="Report Inference"
              onChange={handleChange}
            />

            <input
              type="file"
              name="reportFiles"
              id="reportFiles"
              className="reportFiles"
              multiple
              onChange={handleFileChange}
            />
            <label
              htmlFor="reportFiles"
              className="reportFilesLabel"
              id="fileLabel"
            >
              Add Report Files
            </label>
            {reportFiles.map((file) => {
              return (
                <p id="fileNames" key={file.lastModfied}>
                  {file.name}
                </p>
              );
            })}
          </div>
          <div className="btnDiv">
            <button className="UpdateReportBtn bold" type="submit">
              Update Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateReport;
