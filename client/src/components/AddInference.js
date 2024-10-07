import React from "react";
import { useState } from "react";
import "../styles/addInference.css";

const AddInference = ({ caseId, isOpen, onClose, onSubmit, contract }) => {
  const [courtFiles, setCourtFiles] = useState([]);
  const [caseInference, setCaseInference] = useState("");

  const handleChange = (e) => {
    setCaseInference(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentTimestampMilliseconds = Date.now();
    const currentTimestampSeconds = Math.floor(
      currentTimestampMilliseconds / 1000
    );

    //validating the inputs

    //inference and file is must to add with

    const currCaseInference = caseInference;
    const currCourtFiles = courtFiles;

    if (!currCaseInference || currCourtFiles.length == 0) {
      alert("Invalid Inference, Please Enter Complete Details");
      return;
    }
    const InferenceId = [];

    //coping with files

    if (currCourtFiles) {
      try {
        if (currCourtFiles.length > 0) {
          const headers = new Headers();
          headers.append("pinata_api_key", `KEY`);
          headers.append("pinata_secret_api_key", `SECRET`);

          for (let i = 0; i < currCourtFiles.length; i++) {
            const formData = new FormData();
            formData.append("file", currCourtFiles[i]);
            const resData = await fetch(
              "https://api.pinata.cloud/pinning/pinFileToIPFS",
              {
                method: "POST",
                headers: headers,
                body: formData,
              }
            );
            const data = await resData.json();
            InferenceId.push(
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

    const resFromContractAddInference = await contract.markCaseSolved(
      caseId,
      currentTimestampSeconds,
      InferenceId,
      currCaseInference
    );

    if (resFromContractAddInference) {
      alert("Successfully Added a Case");
      onSubmit({ currCaseInference, InferenceId });
    } else {
      alert("Some Problem Occured");
    }

    setCourtFiles([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    //displaying essential details on ui
    if (files.length > 0) {
      document.getElementById(
        "fileLabel"
      ).innerHTML = `${files.length} Files Selected`;
    } else {
      document.getElementById("fileLabel").innerHTML = "Add Inference Files";
    }
    setCourtFiles(files);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="popupAddInference prevent-select">
      <div className="nav">
        <button onClick={onClose}>X</button>
      </div>
      <div className="AddInferenceWrapper">
        <h2>Add Inference</h2>
        <form className="AddInferenceForm" onSubmit={handleSubmit}>
          <div className="details">
            <input
              type="text"
              name="caseInference"
              id="caseInference"
              placeholder="Case Inference"
              onChange={handleChange}
            />

            <input
              type="file"
              name="courtFiles"
              id="courtFiles"
              className="courtFiles"
              multiple
              onChange={handleFileChange}
            />
            <label
              htmlFor="courtFiles"
              className="courtFilesLabel"
              id="fileLabel"
            >
              Add Report Files
            </label>
            {courtFiles.map((file) => {
              return (
                <p id="fileNames" key={file.lastModfied}>
                  {file.name}
                </p>
              );
            })}
          </div>
          <div className="btnDiv">
            <button className="AddInferenceBtn bold" type="submit">
              Add Inference
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddInference;
