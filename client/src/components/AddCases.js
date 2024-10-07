import React, { cloneElement } from "react";
import { useState } from "react";
import "../styles/addCase.css";

const AddCases = ({ isOpen, onClose, onSubmit, contract, account }) => {
  //user address to be added

  const [CaseData, setCaseData] = useState({
    desc: "",
    collected_by: "",
    key1: "",
    value1: "",
    key2: "",
    value2: "",
    key3: "",
    value3: "",
  });
  const [evidenceFiles, setEvidenceFiles] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCaseData((prevCaseData) => ({
      ...prevCaseData,
      [name]: value,
    }));
    console.log(CaseData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentTimestampMilliseconds = Date.now();
    const currentTimestampSeconds = Math.floor(
      currentTimestampMilliseconds / 1000
    );

    //validating the inputs

    //desc and collected by is must to add with

    const currCaseData = CaseData;
    const currEvidenceFiles = evidenceFiles;

    if (!currCaseData["desc"] || !currCaseData["collected_by"]) {
      alert("Invalid Case, Please Enter Complete Details");
      return;
    }
    const Cids = [];

    //coping with files

    if (
      currEvidenceFiles ||
      currCaseData["key1"].length > 0 ||
      currCaseData["key2"].length > 0 ||
      currCaseData["key3"].length > 0
    ) {
      try {
        if (currEvidenceFiles.length > 0) {
          const headers = new Headers();
          headers.append("pinata_api_key", `PQR`); // ADD YOUR API KEY
          headers.append("pinata_secret_api_key", `ABCD`); // ADD YOUR SECRET KEY

          for (let i = 0; i < currEvidenceFiles.length; i++) {
            const formData = new FormData();
            formData.append("file", currEvidenceFiles[i]);
            const resData = await fetch(
              "https://api.pinata.cloud/pinning/pinFileToIPFS",
              {
                method: "POST",
                headers: headers,
                body: formData,
              }
            );
            const data = await resData.json();
            // console.log(data);
            Cids.push(
              `https://maroon-historical-firefly-523.mypinata.cloud/ipfs/${data.IpfsHash}`
            );
          }
        }
        if (
          currCaseData["key1"].length > 0 ||
          currCaseData["key2"].length > 0 ||
          currCaseData["key3"].length > 0
        ) {
          const { key1, key2, key3, value1, value2, value3 } = currCaseData;
          const extraInfo = { key1, key2, key3, value1, value2, value3 };
          // console.log(extraInfo);

          const jsonData = JSON.stringify(extraInfo);

          const blob = new Blob([jsonData], { type: "application/json" });
          const file = new File([blob], `${currentTimestampSeconds}.json`, {
            type: "application/json",
          });

          // Create a FormData object and append the file
          const formData = new FormData();
          formData.append("file", file);

          const headers = new Headers();
          headers.append("pinata_api_key", `ADD YOUR KEY`);
          headers.append("pinata_secret_api_key", `ADD SCRET`);

          const resData = await fetch(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            {
              method: "POST",
              headers: headers,
              body: formData,
            }
          );
          const data = await resData.json();
          Cids.push(
            `https://maroon-historical-firefly-523.mypinata.cloud/ipfs/${data.IpfsHash}`
          );
        }
        onClose();
      } catch (error) {
        alert(error);
      }
    } else {
      console.log("no files / evidence /json file provided");
    }

    //pushing data into smart contract

    const { desc, collected_by } = currCaseData;
    console.log(desc, collected_by);
    const collected_by_list = [collected_by];

    const resFromContractAddCase = await contract.addCase(
      desc,
      currentTimestampSeconds,
      Cids,
      collected_by_list
    );

    if (resFromContractAddCase) {
      alert("Successfully Added a Case");
      onSubmit({ currCaseData, Cids });
    } else {
      alert("Some Problem Occured");
    }

    setCaseData({
      desc: "",
      collected_by: "",
      key1: "",
      value1: "",
      key2: "",
      value2: "",
      key3: "",
      value3: "",
    });
    setEvidenceFiles([]);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    //displaying essential details on ui
    if (files.length > 0) {
      document.getElementById(
        "fileLabel"
      ).innerHTML = `${files.length} Files Selected`;
    } else {
      document.getElementById("fileLabel").innerHTML = "Add Evidences Image";
    }

    setEvidenceFiles(files);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="popupAddCases prevent-select">
      <div className="nav">
        <button onClick={onClose}>X</button>
      </div>
      <div className="AddCaseWrapper">
        <h2>Add Case</h2>
        <form className="AddCaseForm" onSubmit={handleSubmit}>
          <div className="sections">
            <div className="leftSide">
              <input
                type="text"
                name="desc"
                id="desc"
                placeholder="Description"
                onChange={handleChange}
              />
              <input
                type="text"
                name="collected_by"
                id="collected_by"
                placeholder="Collected By"
                onChange={handleChange}
              />

              <input
                type="file"
                name="evidenceFiles"
                id="evidenceFiles"
                className="evidenceFiles"
                multiple
                onChange={handleFileChange}
              />
              <label
                htmlFor="evidenceFiles"
                className="evidenceFilesLabel"
                id="fileLabel"
              >
                Add Evidences Images
              </label>
              {evidenceFiles.map((file) => {
                return (
                  <p id="fileNames" key={file.lastModfied}>
                    {file.name}
                  </p>
                );
              })}
            </div>
            <div className="rightSide">
              <h5>More Informations</h5>
              <div className="extraInfo">
                <input
                  className="key key1"
                  name="key1"
                  id="key1"
                  placeholder="key1"
                  onChange={handleChange}
                ></input>
                <input
                  className="value value1"
                  name="value1"
                  id="value1"
                  placeholder="value1"
                  onChange={handleChange}
                ></input>
              </div>
              <div className="extraInfo">
                <input
                  className="key key2"
                  name="key2"
                  id="key2"
                  placeholder="key2"
                  onChange={handleChange}
                ></input>
                <input
                  className="value value2"
                  name="value2"
                  id="value2"
                  placeholder="value2"
                  onChange={handleChange}
                ></input>
              </div>
              <div className="extraInfo">
                <input
                  className="key key3"
                  name="key3"
                  id="key3"
                  placeholder="key3"
                  onChange={handleChange}
                ></input>
                <input
                  className="value value3"
                  name="value3"
                  id="value3"
                  placeholder="value3"
                  onChange={handleChange}
                ></input>
              </div>
            </div>
          </div>
          <div className="btnDiv">
            <button className="AddCaseBtn bold" type="submit">
              Add Case
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCases;
