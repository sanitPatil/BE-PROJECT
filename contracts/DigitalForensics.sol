// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

contract DigitalForensics{

    //state variables

    int caseCount=1000;
    int reportCount=5000;

    struct indiCase {
        string desc; //desc about evidence
        int datetime;//date time of evidence added
        address owner;//owner of case
        string[] evidenceCids;//list of evidence cids
        string[] evidenceCollected_by;//list of people collected evidence
        address labAssigned;//address of labs
        int[] reportIds;//list of reports ids
        string inference;
        string[] inferenceIds;
    }

    struct indiChainOfCustody {
        int datetime;
        string action;//action taken place at a chain of custody
        address performed_by;//who performed action
        string status;//Unsolved,Solved
    }

    struct indiReport {
        int case_id;
        string case_desc;
        address case_owner;
        string[] evidenceCids;
        address lab_owner;
        string testDesc;
        string reportStatus;// Pending / Done
        string[] reportCids;
        string reportInference;
        int datetimeReceived;
    }

    //mappings

    //1. address to police,court,admin,labs
    mapping(address => string) addressIdentity;  //police,admin,lab,court

    address[] keysOfIdentity = new address[](0);

    //2. police_address to list of cases
    mapping(address => int[]) addressCases;

    //3. caseid to caseStructure
    mapping(int => indiCase) cases;

    //4. lab_address to list of reports
    mapping(address => int[] ) addressReports;

    //5. reportid to reportStructure
    mapping(int => indiReport) reports;

    //6. caseid to chainOfCustody
    mapping(int => indiChainOfCustody[]) chainOfCustodies;

    //7. caseid to court access
    mapping(int => address[]) courtAccessedToCaseId;

    //8. court Access to case Id
    mapping(address => int[]) caseIdAssociatedToCourt;

    // useful Functions


    function getAllCasesAssignedToCourt(address _add) public view returns (int[] memory val) {

        bool hasAccess = false;
        if(keccak256(abi.encodePacked(addressIdentity[msg.sender])) == keccak256(abi.encodePacked("admin"))){
            hasAccess  = true;
        }
        else if(_add == msg.sender){
            hasAccess = true;
        }

        if(hasAccess ){
            return caseIdAssociatedToCourt[_add];
        }
    }

    function addressToString(address _address) internal pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(_address)));
        bytes memory alphabet = "0123456789abcdef";

        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint128 i = 0; i < 20; i++) {
            uint8 byteValue = uint8(value[i + 12]);
            str[2 + i * 2] = alphabet[byteValue >> 4];
            str[3 + i * 2] = alphabet[byteValue & 0x0f];
        }
        return string(str);
    }

    constructor() {
        addressIdentity[0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266] = "admin";
    }

    // police Functions

    //add Case

    function addCase( string memory _desc, int _datetime, string[] memory _evidenceCids, string[] memory _evidenceCollected_by) public returns( indiCase  memory) {

        //Authentication whether the user is allowed to add or not 
        //if he is a police he is allowed else not

        require(keccak256(abi.encodePacked(addressIdentity[msg.sender])) == keccak256(abi.encodePacked("police")), "You are not allowed to Add a Case");

        //finding the id
        int newcaseId = caseCount;
        caseCount+=1;

        //adding the mapping of case in the police case list
        addressCases[msg.sender].push(newcaseId);

        //adding the case inside the case mapping
        cases[newcaseId]=indiCase(_desc,_datetime,msg.sender,_evidenceCids,_evidenceCollected_by,address(0),new int[](0),"",new string[](0));

        //adding the evidence chain of custody for first time as created
        chainOfCustodies[newcaseId].push(
            indiChainOfCustody( _datetime,"Created",msg.sender,"Unsolved")
            );

        return cases[newcaseId];

    }

    //grant Access To Court
    
    function grantAccessToCourt(int _caseId , address  to_grant_add , int _datetime  ) public returns(bool) {
            
        //check if the access is given by owner only and not anyone else
        require(msg.sender == cases[_caseId].owner , "You are not Owner of the Case");

        //allowed

        //checking if to_grant_address is already given access

        uint lenOfCoc = chainOfCustodies[_caseId].length;

        bool isGrantedAlready = false;

        for (uint i=0; i < courtAccessedToCaseId[_caseId].length; i++) 
        {
            if(courtAccessedToCaseId[_caseId][i] == to_grant_add){
                isGrantedAlready = true;
            }
        }

        require(!isGrantedAlready,"Address is already Granted Access");

        courtAccessedToCaseId[_caseId].push(to_grant_add);
        caseIdAssociatedToCourt[to_grant_add].push(_caseId);

        //now updating chain of custody

        indiChainOfCustody memory newCoc;
        newCoc.datetime = _datetime;
        string memory to_add_string = addressToString(to_grant_add);
        newCoc.action = string(abi.encodePacked("Allowed Access To Court  ",to_add_string));

        newCoc.performed_by = msg.sender;
        newCoc.status =  chainOfCustodies[_caseId][lenOfCoc-1].status;
        chainOfCustodies[_caseId].push(newCoc);

        return true;

    }

    //revoke Access From Court

    
    function revokeAccessFromCourt(int _caseId , address  to_revoke_add , int _datetime  ) public returns(bool) {
            
        
        //check if the access is taken by owner only and not anyone else

        require(msg.sender == cases[_caseId].owner , "You are not Owner of the Evidence");

        //allowed

        //checking if to_take_address is not given access

        uint lenOfCoc = chainOfCustodies[_caseId].length;
        uint accessListLen = courtAccessedToCaseId[_caseId].length;

        for (uint i=0; i < accessListLen; i++) 
        {
            if(courtAccessedToCaseId[_caseId][i] == to_revoke_add){
                //remove karenge access and return kar denge

                //removing accessRight address of court from caseId
                courtAccessedToCaseId[_caseId][i] = courtAccessedToCaseId[_caseId][accessListLen-1];
                courtAccessedToCaseId[_caseId].pop();
                //now updating chain of custody


                indiChainOfCustody memory newCoc;
                newCoc.datetime = _datetime;
                string memory to_revoke_string = addressToString(to_revoke_add);
                newCoc.action = string(abi.encodePacked("Revoked Access From Court  ",to_revoke_string));

                newCoc.performed_by = msg.sender;
                newCoc.status =  chainOfCustodies[_caseId][lenOfCoc-1].status;
                chainOfCustodies[_caseId].push(newCoc);

                return true;
            }
        }

        uint len = caseIdAssociatedToCourt[to_revoke_add].length;
        for(uint i=0;i<len;i++){
            if(caseIdAssociatedToCourt[to_revoke_add][i] == _caseId){
                caseIdAssociatedToCourt[to_revoke_add][i] = caseIdAssociatedToCourt[to_revoke_add][len-1];
                caseIdAssociatedToCourt[to_revoke_add].pop();
            }
        }
        return false;

    }

    //assign Lab

    function assignLab(int _caseId, address labAddress, string memory testDesc,int _currdatetime) public returns (bool) {
        
        //check if the access is given by owner only and not anyone else
        require(msg.sender == cases[_caseId].owner , "You are not Owner of the Case");

        //do the assignment only if lab assigned is initially null ie. no lab is assigned yet
        require(cases[_caseId].labAssigned == address(0) , "Case already Assigned to some Lab");

        //updating the case details 

        // cases[_caseId].isTestRequired = true;
        cases[_caseId].labAssigned = labAddress ;
        cases[_caseId].reportIds = new int[](0);

        //creating the report record and adding it

        //finding the id
        int newreportId = reportCount;
        reportCount+=1;

        //adding the mapping of report in the lab report list
        addressReports[labAddress].push(newreportId);

        cases[_caseId].reportIds.push(newreportId);

        //adding the report inside the reports mapping
        reports[newreportId]=indiReport(_caseId,cases[_caseId].desc,msg.sender,cases[_caseId].evidenceCids,labAddress,testDesc,"Pending",new string[](0),"",_currdatetime);

        //updating the chain of custody
        uint lenOfCoc = chainOfCustodies[_caseId].length;
        indiChainOfCustody memory newCoc;
        newCoc.datetime = _currdatetime;
        string memory to_add_string = addressToString(labAddress);
        newCoc.action = string(abi.encodePacked("Assigned Case to Lab with address ",to_add_string));

        newCoc.performed_by = msg.sender;
        newCoc.status =  chainOfCustodies[_caseId][lenOfCoc-1].status;
        chainOfCustodies[_caseId].push(newCoc);

        return true;

    }

    //get case details

    function getCaseDetails(int _caseId) public view returns(indiCase memory returnedCase ){

        bool hasAccess = false;

        // Check if the sender is owner or admin

        if (msg.sender == cases[_caseId].owner) {
            hasAccess = true;
        }
        else if(keccak256(abi.encodePacked(addressIdentity[msg.sender])) == keccak256(abi.encodePacked("admin"))){
            hasAccess  = true;
        }
        else{
            // Check if the sender's address is accessed court address
            for (uint i = 0; i < courtAccessedToCaseId[_caseId].length; i++) {
                if (msg.sender == courtAccessedToCaseId[_caseId][i]) {
                    hasAccess = true;
                    break;
                }
            }
        }

        require(hasAccess, "You don't have access to this case");

        // Return the evidence if the sender has access
        return cases[_caseId];
    }

    
    //get Chain of custody
    

    function getCOC(int _caseId) public view returns(indiChainOfCustody[]  memory) {

        bool hasAccess = false;
        
        //check if sender is owner or admin 
        if (msg.sender == cases[_caseId].owner) {
            hasAccess = true;
        }
        else if(keccak256(abi.encodePacked(addressIdentity[msg.sender])) == keccak256(abi.encodePacked("admin"))){
            hasAccess  = true;
        }
        else{
            // Check if the sender's address is accessed court address
            for (uint i = 0; i < courtAccessedToCaseId[_caseId].length; i++) {
                if (msg.sender == courtAccessedToCaseId[_caseId][i]) {
                    hasAccess = true;
                    break;
                }
            }
        }
        require(hasAccess, "You don't have access to this case Coc");

        return chainOfCustodies[_caseId];
    }


    //listAllCases

    function listAllCases( address _add) public view returns( int[] memory listOfCases){

        bool hasAccess = false;
        if(keccak256(abi.encodePacked(addressIdentity[msg.sender])) == keccak256(abi.encodePacked("admin"))){
            hasAccess  = true;
        }
        else if(_add == msg.sender){
            hasAccess = true;
        }

        if(hasAccess  && addressCases[_add].length > 0){
            return addressCases[_add];
        }

    }
    function getCourtsAccessed(int _caseId) public view returns (address[] memory)  {
        require(msg.sender == cases[_caseId].owner , "You are not Owner of the Case");
        return(courtAccessedToCaseId[_caseId]);
    }

    //lab functions

    //update report

    function updateReport(int _reportId, int _datetime, string[] memory _reportCids, string memory _reportInference ) public returns (bool){
        
        require(msg.sender == reports[_reportId].lab_owner,"You don't have access to update the report details");

        //updating reportCids if added
        for(uint i=0;i<_reportCids.length;i++){
            reports[_reportId].reportCids.push(_reportCids[i]);
        }

        //updating report inference 
        reports[_reportId].reportInference = _reportInference;

        int caseId = reports[_reportId].case_id;

        //updating the chain of custody
        uint lenOfCoc = chainOfCustodies[caseId].length;
        indiChainOfCustody memory newCoc;
        newCoc.datetime = _datetime;
        string memory to_add_string = addressToString(msg.sender);
        newCoc.action = string(abi.encodePacked("Updated Report by Lab ",to_add_string," with inference as ->",_reportInference));

        newCoc.performed_by = msg.sender;
        newCoc.status =  chainOfCustodies[caseId][lenOfCoc-1].status;
        chainOfCustodies[caseId].push(newCoc);

        return true;
    }

    //listAllReports

    function listAllReports( address _add) public view returns( int[] memory listOfReports){

        bool hasAccess = false;
        if(keccak256(abi.encodePacked(addressIdentity[msg.sender])) == keccak256(abi.encodePacked("admin"))){
            hasAccess  = true;
        }
        else if(_add == msg.sender){
            hasAccess = true;
        }

        if(hasAccess  && addressReports[_add].length > 0){
            return addressReports[_add];
        }

    }

    //get Report details

    function getReportDetails(int _reportId) public view returns(indiReport memory returnedReport){

        bool hasAccess = false;

        if(keccak256(abi.encodePacked(addressIdentity[msg.sender])) == keccak256(abi.encodePacked("lab"))){

            require(reports[_reportId].lab_owner == msg.sender,"You don't have access to others reports");
            hasAccess = true;
        }
        else if(keccak256(abi.encodePacked(addressIdentity[msg.sender])) == keccak256(abi.encodePacked("admin"))){
            hasAccess  = true;
        }
        else if(keccak256(abi.encodePacked(addressIdentity[msg.sender])) == keccak256(abi.encodePacked("police"))){

            require(reports[_reportId].case_owner == msg.sender , "You don't have access");
            hasAccess = true;
        }
        else{
            //court
            for(uint i=0;i< courtAccessedToCaseId[reports[_reportId].case_id].length;i++){
                if(msg.sender == courtAccessedToCaseId[reports[_reportId].case_id][i]){
                    hasAccess = true;
                }
            }
        }

        require(hasAccess == true,"You are not allowed");

        return reports[_reportId];

    }

    function markReportAsDone(int _reportId) public returns (bool){

        require(msg.sender == reports[_reportId].lab_owner,"You don't have access to update the report details");

        require(reports[_reportId].reportCids.length > 0 , "First submit the report");

        require(bytes(reports[_reportId].reportInference).length > 0, "First submit the inference");

        reports[_reportId].reportStatus = "Done";

        return true;
    }

    //admin functions
    function addUser(address add, string memory userType) public returns(bool){
        require(keccak256(abi.encodePacked(addressIdentity[msg.sender])) == keccak256(abi.encodePacked("admin")),"You are not allowed");
        addressIdentity[add] = userType;
        keysOfIdentity.push(add);
        return true;
    }

    // function removeUser(address add) public returns(bool){
    //     require(keccak256(abi.encodePacked(addressIdentity[msg.sender])) == keccak256(abi.encodePacked("admin")),"You are not allowed");
    //     addressIdentity[add] = "null";
    //     return true;
    // }

    function getUsers()public view  returns(address[] memory , string[] memory){

        require(keccak256(abi.encodePacked(addressIdentity[msg.sender])) == keccak256(abi.encodePacked("admin")),"You are not allowed");

        address[] memory tempAddress = new address[](keysOfIdentity.length);
        string[] memory tempUsers = new string[](keysOfIdentity.length);

        for(uint i=0;i<keysOfIdentity.length;i++){
            tempAddress[i] = keysOfIdentity[i];
            tempUsers[i] = addressIdentity[keysOfIdentity[i]];
        }

        return (tempAddress,tempUsers);

    }

    function getMyRole() public view returns(string memory role){
        return(addressIdentity[msg.sender]);
    }

    //court


    function markCaseSolved(int _caseId,int _datetime,string[] memory _inferenceId, string memory _inference) public returns (bool){

        require(msg.sender == courtAccessedToCaseId[_caseId][0],"You don't have access to update state of Case");

        cases[_caseId].inference = _inference;
        cases[_caseId].inferenceIds = _inferenceId;

        indiChainOfCustody memory newCoc;
        newCoc.datetime = _datetime;
        string memory to_add_string = addressToString(msg.sender);
        newCoc.action = string(abi.encodePacked("Marked Case as Solved by ",to_add_string," with Inference as ->",_inference));
        newCoc.performed_by = msg.sender;

        newCoc.status =  'Solved';
        chainOfCustodies[_caseId].push(newCoc);

        return true;
    }

}

