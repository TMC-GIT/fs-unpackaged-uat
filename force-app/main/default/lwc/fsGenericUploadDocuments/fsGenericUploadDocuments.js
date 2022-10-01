import { api, LightningElement, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import { setDeferralPicklistValue} from './fsGenericUploadDocumentsHelper';

import getUploadedRecords from '@salesforce/apex/fsGenericUploadDocumentsController.getUploadedRecords';
import getAdditionalRecords from '@salesforce/apex/fsGenericUploadDocumentsController.getAdditionalRecords';
import getAllRequiredData from '@salesforce/apex/fsGenericUploadDocumentsController.getAllRequiredData';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';

import STATUS_FIELD from '@salesforce/schema/ContentVersion.Status__c';
import TYPE_FIELD from '@salesforce/schema/Document_Master__c.Type__c';
import AGREEMENT_DOCUMENT_TYPE_FIELD from '@salesforce/schema/ContentVersion.Agreement_Document_Type__c';
import DOCUMENT_CONDITION_FIELD from '@salesforce/schema/ContentVersion.Document_Condition__c';
import createCVRecord from '@salesforce/apex/fsGenericUploadDocumentsController.createCVRecord';
import createDeferralRecord from '@salesforce/apex/fsGenericUploadDocumentsController.createDeferralRecord';
import getUploadedData from '@salesforce/apex/fsGenericUploadDocumentsController.getUploadedData';
import uploadAddtionalDocument from '@salesforce/apex/fsGenericUploadDocumentsController.uploadAddtionalDocument';

import { getRecord } from 'lightning/uiRecordApi';
import USER_ID from '@salesforce/user/Id';
import NAME_FIELD from '@salesforce/schema/User.Name';
export default class FsGenericUploadDocuments extends NavigationMixin(LightningElement) {
    @api stageName;
    @api applicationId;
    @api recordTypeId;
    @api isAgreementExecution;
    /**
     * Data Related Variables
     */
    @track addtionalDocData = {}
    @track listOfDocumentMaster;
    @track listOfDocumentSetCode;
    @track listOfLoanApplicant;
    @track listOfProperty;
    @track listOfEmpoymentDetails;
    @track listOfDeferralDocument;
    @track listOfContentVersion;
    @track listOfUploadedDef;
    @track documentData;
    @track addtionalDocuments;
    @track uploadedDocData;
    @track mapOfContentVersion;
    @track mapOfDeferralDocument;
    @track listOfDeferralMasterDocumentDocument;
    @track applicationJSON = [];
    @track applicantJSON = [];
    @track propertyJSON = []
    @track documentMasterIds = [];
    fileData;
    additionalFileData;
    /**
     * Picklist Related Variables
     */
    @track typePicklistOption;
    @track statusPicklistOption;
    @track deferalPicklistOption;
    @track applicantPicklistOption;
    @track assetPicklistOption;
    @track agreementDocumentTypePicklistOption;
    @track documentConditionPicklistOption;
    @track documentMasterOptions;
    @track originalPicklistOption = [
        { label: 'Yes', value: 'Yes' },
        { label: 'No', value: 'No' }
    ]
    /**
     * Other Variables
     */
    @track propertyIds;
    @track applicantId;
    @track isSaveDisabled = true;
    @track isSpinnerActive = true;
    @track currentDocumentType;
    @track tabName = 'Upload';
    @track isTypeApplicant;
    @track isTypeAsset;
    @track isButtonFlag;
    @track selectOptionTypeValue;
    @track isAddtionalDocument;
    @track headerDetails;
    @track userName;
    @wire(getRecord, { recordId: USER_ID, fields: [NAME_FIELD] })
    wireuser({ error, data }) {
        if (error) {
            this.error = error;
        } else if (data) {
            console.log('data :: ', JSON.stringify(data));
            this.userName = data.fields.Name.value;

        }
    }
    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: DOCUMENT_CONDITION_FIELD })
    picklistDocumentConditionValues({ error, data }) {
        if (data) {
            console.log(data);
            this.documentConditionPicklistOption = data.values;
        } else if (error) {
            console.log(error);
        }
    }
    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: AGREEMENT_DOCUMENT_TYPE_FIELD })
    picklistAgreementDocumentValues({ error, data }) {
        if (data) {
            this.agreementDocumentTypePicklistOption = data.values;
        } else if (error) {
            console.log(error);
        }
    }
    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: TYPE_FIELD })
    picklistTypeValues({ error, data }) {
        if (data) {
            this.typePicklistOption = data.values;
        } else if (error) {
            console.log(error);
        }
    }
    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: STATUS_FIELD })
    picklistStatusValues({ error, data }) {
        if (data) {
            console.log('data.values #### ', JSON.stringify(data.values));
            this.statusPicklistOption = data.values;
        } else if (error) {
            console.log(error);
        }
    }
    
    get todayDate() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();
        var todayDate = yyyy + '-' + mm + '-' + dd;
        return todayDate;
    }

    connectedCallback() {
        console.log('typeOf isAgreementExecution ', typeof this.isAgreementExecution);
        this.getAllRequiredData();
        this.getUploadedRecords();
        this.deferalPicklistOption = [];
        this.deferalPicklistOption = setDeferralPicklistValue(this.stageName);
    }
    @api
    getAllRequiredData() {
        getAllRequiredData({ stageName: this.stageName, applicationId: this.applicationId, recordTypeId: this.recordTypeId })
            .then(result => {
                console.log('result :: Required Data :: ', JSON.stringify(result));
                this.listOfDocumentMaster = result.listOfDocumentMaster;
                this.listOfDocumentSetCode = result.listOfDocumentSetCode;
                console.log('result.listOfLoanApplicant #### ', JSON.stringify(result.listOfLoanApplicant));
                this.listOfLoanApplicant = result.listOfLoanApplicant;
                this.listOfProperty = result.listOfProperty;
                this.listOfEmpoymentDetails = result.listOfEmpoymentDetails;

                this.mapOfContentVersion = result.mapOfContentVersion;
                this.mapOfDeferralDocument = result.mapOfDeferralDocument;
                this.listOfDeferralMasterDocumentDocument = result.listOfDeferralMasterDocumentDocument;
                console.log(':: listOfDocumentSetCode ## :: ', JSON.stringify(this.listOfDocumentSetCode));
            }).catch(error => {

            }).finally(() => {
                this.setApplicantPicklistValues();
                this.setPropertyPicklistValues();
                this.setAllData();
            });
    }
    handleSaveVariousDocument() {
        var isValidInputText = this.handleEditValidation();
        var isValidInputTextArea = this.handleTextAreaValidation();
        var isValidCombo = this.handleComboValidation();
        console.log('isValidInputText ### ', isValidInputText);
        console.log('isValidInputTextArea ### ', isValidInputTextArea);
        console.log('isValidCombo ### ', isValidCombo);
        if (!isValidInputText || !isValidInputTextArea || !isValidCombo) {
            this.toast('Error', 'Error', 'Complete Required Field.');
        } else {
            var actualData;
            var isAllValid = false;
            if (this.selectOptionTypeValue === 'Application') {
                actualData = this.documentData
                actualData.forEach(element => {
                    if (element.status === 'Not Received' && element.mandatory === 'Yes') {
                        isAllValid = true;
                        //this.toast('Error', 'Error', 'Status Should Not Be Not Received.');
                        //return;
                    }
                })
            }
            else if (this.selectOptionTypeValue === 'Applicant') {
                actualData = this.documentData//this.applicantJSON
                console.log('this.applicantJSON ### ',JSON.stringify(this.applicantJSON));
                console.log('this.documentData ### ',JSON.stringify(this.documentData));
                
                var splitedData = this.headerDetails.split(' - ');
                actualData.forEach(element => {
                    if (element.mandatory === 'Yes' && element.customerName === splitedData[1] && element.customerType === splitedData[0] && element.status === 'Not Received') {
                        isAllValid = true;
                    }
                })
            }
            else if (this.selectOptionTypeValue === 'Asset') {
                actualData = this.documentData//this.propertyJSON;
                console.log('actualData #### ',JSON.stringify(actualData));
                var proType = this.headerDetails.split('-')[0];
                var proName = this.headerDetails.replace(proType + '-', '');
                actualData.forEach(element => {
                    if (element.mandatory === 'Yes' && element.propertyName === proName && element.propertyType === proType && element.status === 'Not Received') {
                        isAllValid = true;
                    }
                })
            }
            if (isAllValid) {
                this.toast('Error', 'Error', 'Status Should Not Be Not Received.');
            } else {
                this.finalSubmit(actualData);
            }
        }
    }

    finalSubmit(actualData) {
        console.log(':: saved called :: ', JSON.stringify(actualData));
        this.isSaveDisabled = true;
        actualData.forEach(element => {
            console.log(':: saved called ::',JSON.stringify(element));
            if (element.status === 'Received' && element.fileData !== '') {
                //console.log('save element :: ', JSON.stringify(element));
                createCVRecord({ data: JSON.stringify(element), currentStageName: this.stageName })
                    .then(result => {
                        this.isSpinnerActive = false;
                        this.isSpinnerActive = false;
                        element.deferredStageDisable = true;
                        element.deferredRequired = false;
                        element.isReceivedDateRequired = false;
                        element.receivedDateDisable = true;
                        element.isWaiverRequired = false;
                        element.waiverReasonDisable = true;
                        element.isFileUploadDisabled = true;
                        element.isFileUploadRequired = false;
                        element.isoriginalDisabled = true;
                        element.fileName = '';
                        element.deferalRecordId = '';
                        this.toast('Success', 'Success', 'Document Uploaded Successfully');
                    })
                element.isNewRowAdded = false;
                element.isStatusDisabled = true;
            } else if ((element.status === 'Deferred' || element.status === 'Waived') && element.fileData === null) {
                console.log(':: deffered called :: ' + JSON.stringify(element));
                createDeferralRecord({ data: JSON.stringify(element), currentStageName: this.stageName, recordId: this.applicationId })
                    .then(result => {
                        this.isSpinnerActive = false;
                        element.deferredStageDisable = true;
                        element.deferredRequired = false;
                        element.isReceivedDateRequired = false;
                        element.receivedDateDisable = true;
                        element.isWaiverRequired = false;
                        element.waiverReasonDisable = true;
                        element.isFileUploadDisabled = true;
                        element.isFileUploadRequired = false;
                        element.isoriginalDisabled = true;
                        element.fileName = '';
                        element.deferalRecordId = result.deferalRecordId;
                        this.toast('Success', 'Success', 'Document Waived Or Deferred Successfully');
                    });
                element.isNewRowAdded = false;
                element.isStatusDisabled = true;
            }
        });
    }
    handleComboboxChange(event) {
        console.log('name :: ', event.target.name);
        console.log('value :: ', event.target.value);
        var name = event.target.name;
        var value = event.target.value;

        this.isTypeApplicant = false;
        this.isTypeAsset = false;
        this.isButtonFlag = true;
        this.documentData = undefined;
        this.headerDetails = undefined;
        /**
         * Set Additional Document
         */
        if (value === 'Application' || value === 'Applicant' || value === 'Asset') {
            this.currentDocumentType = value;
            this.documentMasterOptions = [];
            this.listOfDocumentMaster.forEach(element => {
                if (!this.documentMasterIds.includes(element.Id) && element.Type__c === value) {
                    this.documentMasterOptions.push({ label: element.Name, value: element.Id + '-' + element.Name });
                }
            });
            console.log(':: documentMasterOptions :: ', JSON.stringify(this.documentMasterOptions));
        }
        /**
         * Use For Application Type Picklist
         */
        if (name === 'type-picklist' && value === 'Application') {
            this.isSaveDisabled = true;
            this.selectOptionTypeValue = '';
            this.selectOptionTypeValue = value;
            if (this.applicationJSON.length > 0) {
                var counter = 0;
                this.applicationJSON.forEach(element => {
                    element.serialNumber = Number(counter) + Number(1)
                    counter++;
                })
                this.documentData = this.applicationJSON;
                console.log('this.documentData ##### ', JSON.stringify(this.documentData));
            }

        }
        /**
         * Use For Applicant Type Picklist
         */
        else if (name === 'type-picklist' && value === 'Applicant') {
            this.isTypeApplicant = true;
            this.isTypeAsset = false;
            this.isButtonFlag = false;
            this.documentData = undefined;
            this.selectOptionTypeValue = '';
            this.selectOptionTypeValue = value;
        }
        else if (name === 'applicant-picklist') {
            this.isSaveDisabled = true;
            this.isTypeApplicant = true;
            this.isButtonFlag = true;
            var counter = 0;
            var tempApplicantJSON = []
            this.applicantId = value;
            console.log('this.applicantJSON #### ',JSON.stringify(this.applicantJSON));
            this.applicantJSON.forEach(element => {
                if (element.applicantId === value) {
                    console.log(':: element :: ', JSON.stringify(element));
                    this.headerDetails = element.customerType + ' - ' + element.customerName;
                    element.serialNumber = Number(counter) + Number(1)
                    tempApplicantJSON.push(element);
                    counter++;
                }
            })
            this.documentData = tempApplicantJSON;
        }

        /**
         * Use For Asset Type Picklist
         */
        else if (name === 'type-picklist' && value === 'Asset') {
            this.isTypeApplicant = false;
            this.isTypeAsset = true;
            this.isButtonFlag = false;
            this.documentData = undefined;
            this.selectOptionTypeValue = '';
            this.selectOptionTypeValue = value;
        }
        else if (name === 'asset-picklist') {
            this.isSaveDisabled = true;
            this.isButtonFlag = true;
            this.isTypeAsset = true;
            var counter = 0;
            var tempAssetJSON = []
            this.propertyIds = value.split('-');
            console.log('propertyJSON :: ', JSON.stringify(this.propertyJSON));
            var propertyName;
            var propertyType;
            this.listOfProperty.forEach(element => {
                if(element.Id === this.propertyIds[0]){
                    propertyName = element.Name;
                    propertyType = element.Property_Type__c;
                }     
            })
            
            console.log('propertyName #### ',JSON.stringify(propertyName));
            console.log('this.propertyIds #### ',JSON.stringify(this.propertyIds));
            this.propertyJSON.forEach(element => {
                if (element.propertyId === this.propertyIds[0] || element.parentPropertyId === this.propertyIds[1]) {
                    console.log(':: element :: ', JSON.stringify(element));
                    this.headerDetails = propertyType + '-' + propertyName;
                    element.serialNumber = Number(counter) + Number(1),
                    element.propertyId = this.propertyIds[0];
                    element.parentPropertyId = this.propertyIds[1];
                    tempAssetJSON.push(element);
                    counter++;
                }
            })
            console.log('tempAssetJSON ##### ',JSON.stringify(tempAssetJSON));
            this.documentData = tempAssetJSON;
        }
    }


    selectOptionChange(event) {
        var name = event.target.name;
        var value = event.target.value;
        var rowNo = event.target.getAttribute("data-row-index");
        this.isSaveDisabled = false;
        console.log('name from select Option:: ', name);
        console.log('rowNo from select Option:: ', value);
        console.log('rowNo from select Option:: ', JSON.stringify(this.documentData[rowNo]));
        if (this.selectOptionTypeValue === 'Application') {
            this.documentData[rowNo]['applicationId'] = this.applicationId;
        }
        if (this.selectOptionTypeValue === 'Applicant') {
            var splitedData = this.headerDetails.split(' - ');
            this.documentData[rowNo]['applicationId'] = this.applicationId;
            this.documentData[rowNo]['applicantId'] = this.applicantId;
            this.documentData[rowNo]['customerName'] = splitedData[1];
            this.documentData[rowNo]['customerType'] = splitedData[0];
        }
        if (this.selectOptionTypeValue === 'Asset') {
            console.log(' :: propertyJSON :: ', JSON.stringify(this.propertyJSON));
            this.documentData[rowNo]['applicationId'] = this.applicationId;
            this.documentData[rowNo]['propertyId'] = this.propertyIds[0];
            this.documentData[rowNo]['parentPropertyId'] = this.propertyIds[1];
        }

        if (name === 'application-status' && value === 'Received') {
            /*Received Date Related Functionality */
            this.documentData[rowNo]['receivedDateDisable'] = false;
            this.documentData[rowNo]['isReceivedDateRequired'] = true;
            this.documentData[rowNo]['isoriginalDisabled'] = false;

            /*File Related Functionality */
            this.documentData[rowNo]['isFileUploadDisabled'] = false;
            this.documentData[rowNo]['isFileUploadRequired'] = true;

            /*Waiver Related Functionality */
            this.documentData[rowNo]['waiverReason'] = '';
            this.documentData[rowNo]['waiverReasonDisable'] = true;
            this.documentData[rowNo]['isWaiverRequired'] = false;

            /*Deferred Stage Related Funtionality*/
            this.documentData[rowNo]['deferredStageDisable'] = true;
            this.documentData[rowNo]['deferredRequired'] = false;
            this.documentData[rowNo]['stage'] = '';
            this.documentData[rowNo]['deferredDate'] = null;
        }
        if (name === 'application-status' && value === 'Waived') {
            /*Waiver Related Functionality */
            this.documentData[rowNo]['waiverReasonDisable'] = false;
            this.documentData[rowNo]['isWaiverRequired'] = true;

            /*File Related Functionality */
            this.documentData[rowNo]['fileData'] = null;
            this.documentData[rowNo]['fileName'] = '';
            this.documentData[rowNo]['isFileUploadDisabled'] = true;
            this.documentData[rowNo]['isFileUploadRequired'] = false;

            /*Received Date && No Pages Related Functionality */
            this.documentData[rowNo]['receivedDate'] = null;
            this.documentData[rowNo]['noOfPages'] = '';
            this.documentData[rowNo]['receivedDateDisable'] = true;
            this.documentData[rowNo]['isReceivedDateRequired'] = false;
            this.documentData[rowNo]['original'] = '';
            this.documentData[rowNo]['isoriginalDisabled'] = true;

            /*Deferred Stage Related Funtionality*/
            this.documentData[rowNo]['deferredStageDisable'] = true;
            this.documentData[rowNo]['deferredRequired'] = false;
            this.documentData[rowNo]['stage'] = '';
            this.documentData[rowNo]['deferredDate'] = null;

        }
        if (name === 'application-status' && value === 'Deferred') {
            /*Deferral Related Functionality */
            this.documentData[rowNo]['deferredStageDisable'] = false;
            this.documentData[rowNo]['deferredRequired'] = true;

            /*File Related Functionality */
            this.documentData[rowNo]['fileData'] = null;
            this.documentData[rowNo]['fileName'] = '';
            this.documentData[rowNo]['isFileUploadDisabled'] = true;
            this.documentData[rowNo]['isFileUploadRequired'] = false;

            /*Received Date && No Pages Related Functionality */
            this.documentData[rowNo]['receivedDate'] = null;
            this.documentData[rowNo]['noOfPages'] = '';
            this.documentData[rowNo]['receivedDateDisable'] = true;
            this.documentData[rowNo]['isReceivedDateRequired'] = false;
            this.documentData[rowNo]['original'] = '';
            this.documentData[rowNo]['isoriginalDisabled'] = true;

            /*Waiver Related Functionality */
            this.documentData[rowNo]['waiverReason'] = '';
            this.documentData[rowNo]['waiverReasonDisable'] = true;
            this.documentData[rowNo]['isWaiverRequired'] = false;
        }
        if (name === 'application-status' && value == 'Not Received') {
            /*File Related Functionality */
            this.documentData[rowNo]['fileData'] = null;
            this.documentData[rowNo]['fileName'] = '';
            this.documentData[rowNo]['isFileUploadDisabled'] = true;
            this.documentData[rowNo]['isFileUploadRequired'] = false;

            /*Deferred Stage Related Funtionality*/
            this.documentData[rowNo]['deferredStageDisable'] = true;
            this.documentData[rowNo]['deferredRequired'] = false;
            this.documentData[rowNo]['stage'] = '';
            this.documentData[rowNo]['deferredDate'] = null;


            /*Received Date && No Pages Related Functionality */
            this.documentData[rowNo]['receivedDate'] = null;
            this.documentData[rowNo]['noOfPages'] = '';
            this.documentData[rowNo]['receivedDateDisable'] = true;
            this.documentData[rowNo]['isReceivedDateRequired'] = false;
            this.documentData[rowNo]['original'] = '';
            this.documentData[rowNo]['isoriginalDisabled'] = true;

            /*Waiver Related Functionality */
            this.documentData[rowNo]['waiverReason'] = '';
            this.documentData[rowNo]['waiverReasonDisable'] = true;
            this.documentData[rowNo]['isWaiverRequired'] = false;
        }
        if (this.documentData[rowNo].isNewRowAdded === true && name === 'application-documentName') {
            this.documentData[rowNo][name.split('-')[1]] = value.split('-')[1];
            this.documentData[rowNo].documentCode = value.split('-')[1];
            this.documentData[rowNo].documentType = this.currentDocumentType;
            this.documentData[rowNo].docSetCodeId = value.split('-')[0];
            this.documentData[rowNo].isDocumentMaster = true;
            this.documentData[rowNo].isNewRowAdded = true;
        } else {
            this.documentData[rowNo][name.split('-')[1]] = value;
        }

        console.log('after from select Option:: ', JSON.stringify(this.documentData));
    }
    handleAddNewDocument(event) {

        var actualData;
        if (this.selectOptionTypeValue === 'Application') {
            actualData = this.applicationJSON;

        }
        if (this.selectOptionTypeValue === 'Applicant') {
            actualData = this.applicantJSON;
        }
        if (this.selectOptionTypeValue === 'Asset') {
            actualData = this.propertyJSON;
        }
        if (event.target.name === 'addNewDocument-application') {
            var isValidInputText = this.handleEditValidation();
            var isValidInputTextArea = this.handleTextAreaValidation();
            var isValidCombo = this.handleComboValidation();

            console.log('isValidInputText ### ', isValidInputText);
            console.log('isValidInputTextArea ### ', isValidInputTextArea);
            console.log('isValidCombo ### ', isValidCombo);

            if (!isValidInputText || !isValidInputTextArea || !isValidCombo) {
                this.toast('Error', 'Error', 'Complete Required Field.');
            } else {
                if (actualData.length > 0 || this.documentData.length > 0) {
                    var tempRow = JSON.parse(JSON.stringify(this.newRowDocumentRecord));
                    tempRow.serialNumber = Number(this.documentData.length) + Number(1);
                    tempRow.isNewRowAdded = true;
                    this.documentData.push(tempRow);
                } else {
                    this.documentData = [];
                    var tempRow = JSON.parse(JSON.stringify(this.newRowDocumentRecord));
                    tempRow.serialNumber = Number(1);
                    tempRow.isNewRowAdded = true;
                    this.documentData.push(tempRow);
                }
            }
        }

        else if (event.target.name === 'deleteDocument-application') {
            console.log('documentData :: ', JSON.stringify(this.documentData));
            var len = 0;
            if (this.documentData.length) {
                len = this.documentData.length - Number(1);
            }
            if (this.documentData[len].isNewRowAdded === true) {
                this.documentData.pop();
            } else {
                this.toast('Warning', 'Warning', 'User Don\'t Have Access To Delete Record.');
            }
        } else {
            this.isAddtionalDocument = true;
        }

    }
    
    
    
    /**
     *  ====== Checking Input Field Vallidation ======
     */
    handleEditValidation() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('lightning-input');
        inputFields.forEach(inputField => {
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }

    handleTextAreaValidation() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('lightning-textarea');
        inputFields.forEach(inputField => {
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }
    handleComboValidation() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('lightning-combobox');
        inputFields.forEach(inputField => {
            console.log('inputField #### ', inputField.disabled);
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });
        return isValid;
    }
    /**
     *  ====== Set All Static Data ======
     */
    setApplicantPicklistValues() {
        this.applicantPicklistOption = [];
        console.log('this.listOfLoanApplicant #### ', JSON.stringify(this.listOfLoanApplicant));
        this.listOfLoanApplicant.forEach(element => {
            this.applicantPicklistOption.push({ label: element.Applicant_Name__c, value: element.Customer_Information__c });
        })
    }
    setPropertyPicklistValues() {
        this.assetPicklistOption = [];
        this.listOfProperty.forEach(element => {
            if(this.stageName !== 'Login'){
                this.assetPicklistOption.push({ label: element.Name, value: element.Id + '-' + element.Property__c});
            } else{
                this.assetPicklistOption.push({ label: element.Name, value: element.Id + '-' + element.Id});
            }
                
        })
    }
    @api
    checkAllRequiredDocument() {
        var finalValidation = [];
        var applicationValidation = [];
        var applicantValidation = [];
        var assetValidation = [];

        getUploadedData({ stageName: this.stageName, applicationId: this.applicationId })
            .then(result => {
                this.listOfContentVersion = result.listOfContentVersion;
                this.listOfUploadedDef = result.listOfDeferralDocument;
            }).catch(error => {

            }).finally(() => {
                var cvApplicationIds = []
                var cvApplicantIds = []
                var cvAssetIds = []
                this.listOfContentVersion.forEach(cv => {
                    if (cv.Document_Type__c === 'Application') {
                        cvApplicationIds.push(cv.Parent_Id__c);
                    }
                    if (cv.Document_Type__c === 'Applicant') {
                        cvApplicantIds.push(cv.Current_Record_Id__c);
                    }
                    if (cv.Document_Type__c === 'Asset') {
                        cvAssetIds.push(cv.Current_Record_Id__c);
                    }
                });

                this.listOfUploadedDef.forEach(def => {
                    if (def.Type__c === 'Application') {
                        cvApplicationIds.push(def.Application__c);
                    }
                    if (def.Type__c === 'Applicant') {
                        cvApplicantIds.push(def.Current_Record_Id__c);
                    }
                    if (def.Type__c === 'Asset') {
                        cvAssetIds.push(def.Current_Record_Id__c);
                    }
                });
                console.log('this.applicationJSON $$$$$ ',JSON.stringify(this.applicationJSON));
                this.applicationJSON.forEach(element => {
                    if ((element.status === 'Not Received' && element.mandatory === 'Yes' && !cvApplicationIds.includes(element.applicationId)) || (element.mandatory === 'Yes' && this.stageName === element.stage && element.status === 'Deferred')) {
                        var requireData = {
                            'documentName': element.documentName,
                            'documentType': element.documentType,
                        }
                        applicationValidation.push(requireData);
                    }
                });
                //Applicant Related Validation
                this.applicantJSON.forEach(element => {
                    if ((element.status === 'Not Received' && element.mandatory === 'Yes' && !cvApplicantIds.includes(element.applicantId)) || (element.mandatory === 'Yes' && this.stageName === element.stage && element.status === 'Deferred')) {
                        var requireData = {
                            'documentName': element.documentName,
                            'documentType': element.documentType,
                            'customerType': element.customerType,
                            'customerName': element.customerName,
                        }
                        applicantValidation.push(requireData);
                    }
                });
                //Property Related Validation
                console.log('this.propertyJSON ', JSON.stringify(this.propertyJSON))
                console.log('this.cvAssetIds ', JSON.stringify(cvAssetIds))
                this.propertyJSON.forEach(element => {
                    if ((element.status === 'Not Received' && element.mandatory === 'Yes' && !cvAssetIds.includes(element.propertyId)) || (element.mandatory === 'Yes' && this.stageName === element.stage && element.status === 'Deferred')) {
                        var requireData = {
                            'documentName': element.documentName,
                            'documentType': element.documentType,
                            'propertyType': element.propertyType,
                            'propertyName': element.propertyName,
                        }
                        assetValidation.push(requireData);
                    }
                });
                finalValidation.push(...applicationValidation);
                finalValidation.push(...applicantValidation);
                finalValidation.push(...assetValidation);
                console.log(':: finalValidation :: ', JSON.stringify(finalValidation));
                const docEvent = new CustomEvent("requireddocument", {
                    detail: finalValidation
                });
                this.dispatchEvent(docEvent);
            });
    }

    setAllData() {
        this.applicationJSON = [];
        this.applicantJSON = [];
        this.propertyJSON = []
        console.log('this.listOfDeferralMasterDocumentDocument #### ', JSON.stringify(this.listOfDeferralMasterDocumentDocument));
        
        /** For Show All Document Master Record */
        this.documentMasterIds = []
        this.listOfDeferralMasterDocumentDocument.forEach(element => {
            if (element.Deferral_Stage__c === this.stageName && element.Is_Document_Master_Record__c && !element.Is_Document_Received__c && element.Type__c === 'Asset') {
                console.log('inside deferal master record first');
                var newRow = {
                    'documentCode': element.Document_Name__c,
                    'docSetCodeId': element.Document_Set_Code__c,
                    'applicationId': '',
                    'serialNumber': '',
                    'documentName': element.Document_Name__c,
                    'documentFamily': '',
                    'mandatory': element.Mandatory__c,
                    'documentType': element.Type__c,
                    'status': element.Is_Document_Received__c ? 'Received' : element.Status__c,
                    'stage': element.Deferral_Stage__c,
                    'isStatusDisabled': element.Is_Document_Received__c ? true : element.Deferred_From__c === this.stageName ? true : element.Deferral_Stage__c === this.stageName && element.Status__c === 'Waived' ? true : false,
                    'deferredStageDisable': true,
                    'deferredRequired': false,
                    'deferredDate': element.Deferral_Date__c,
                    'receivedDate': '',
                    'isReceivedDateRequired': false,
                    'receivedDateDisable': true,
                    'noOfPages': '',
                    'waiverReason': element.Waiver_Reason__c,
                    'isWaiverRequired': false,
                    'waiverReasonDisable': true,
                    'remarks': element.Remarks__c,
                    'isNewRowAdded': false,
                    'fileName': '',
                    'isFileUploadDisabled': true,
                    'isFileUploadRequired': true,
                    'original': '',
                    'isoriginalDisabled': true,
                    'fileData': '',
                    'isAgreementExecution': this.isAgreementExecution,
                    'isDeferalRecord': true,
                    'deferalRecordId': element.Id,
                    'isDocumentMaster': true,
                    'applicantId': element.Type__c === 'Applicant' ? element.Current_Record_Id__c : '',
                    'propertyId': element.Type__c === 'Asset' ? element.Current_Record_Id__c : '',
                    'parentPropertyId' : element.Parent_Property_Id__c !== undefined ? element.Parent_Property_Id__c : '',
                    'applicableFor' : element.Type__c === 'Applicant' ? element.Applicable_For__c : '',
                    'customerName' : element.Type__c === 'Applicant' ? element.Applicant_Name__c : '',
                    'customerType' : element.Type__c === 'Applicant' ? element.Applicant_Type__c : '',
                }
                if (element.Type__c === 'Application') {
                    this.applicationJSON.push(newRow)
                }
                if (element.Type__c === 'Applicant') {
                    this.applicantJSON.push(newRow)
                }
                if (element.Type__c === 'Asset') {
                    this.propertyJSON.push(newRow)
                }
            }
            if (element.Deferred_From__c === this.stageName) {
                console.log('inside deferal master record second');
                var newRow = {
                    'documentCode': element.Document_Name__c,
                    'docSetCodeId': element.Document_Set_Code__c,
                    'applicationId': '',
                    'serialNumber': '',
                    'documentName': element.Document_Name__c,
                    'documentFamily': '',
                    'mandatory': element.Mandatory__c,
                    'documentType': element.Type__c,
                    'status': element.Status__c === 'Deferred' ? 'Deferred' : element.Deferred_From__c === element.Uploaded_From__c && element.Status__c === 'Waived' ? 'Waived' : element.Deferred_From__c !== element.Uploaded_From__c && element.Status__c === 'Waived' ? 'Deferred' : '',
                    'stage': element.Deferral_Stage__c,
                    'isStatusDisabled': element.Is_Document_Received__c ? true : element.Deferred_From__c === this.stageName ? true : element.Deferral_Stage__c === this.stageName && element.Status__c === 'Waived' ? true : false,
                    'deferredStageDisable': true,
                    'deferredRequired': false,
                    'deferredDate': element.Deferral_Date__c,
                    'receivedDate': '',
                    'isReceivedDateRequired': false,
                    'receivedDateDisable': true,
                    'noOfPages': '',
                    'waiverReason': element.Waiver_Reason__c,
                    'isWaiverRequired': false,
                    'waiverReasonDisable': true,
                    'remarks': element.Remarks__c,
                    'isNewRowAdded': false,
                    'fileName': '',
                    'isFileUploadDisabled': true,
                    'isFileUploadRequired': true,
                    'original': '',
                    'isoriginalDisabled': true,
                    'fileData': '',
                    'isAgreementExecution': this.isAgreementExecution,
                    'isDeferalRecord': true,
                    'deferalRecordId': element.Id,
                    'isDocumentMaster': true,
                    'applicantId': element.Type__c === 'Applicant' ? element.Current_Record_Id__c : '',
                    'propertyId': element.Type__c === 'Asset' ? element.Current_Record_Id__c : '',
                    'parentPropertyId' : element.Parent_Property_Id__c !== undefined ? element.Parent_Property_Id__c : '',
                    'applicableFor' : element.Type__c === 'Applicant' ? element.Applicable_For__c : '',
                    'customerName' : element.Type__c === 'Applicant' ? element.Applicant_Name__c : '',
                    'customerType' : element.Type__c === 'Applicant' ? element.Applicant_Type__c : '',
                }
                if (element.Type__c === 'Application') {
                    this.applicationJSON.push(newRow)
                }
                if (element.Type__c === 'Applicant') {
                    this.applicantJSON.push(newRow)
                }
                if (element.Type__c === 'Asset') {
                    this.propertyJSON.push(newRow)
                }
            }
            if (element.Deferral_Stage__c === this.stageName && !element.Is_Document_Received__c) {
                console.log('inside deferal master record third');
                var newRow = {
                    'documentCode': element.Document_Name__c,
                    'docSetCodeId': element.Document_Set_Code__c,
                    'applicationId': '',
                    'serialNumber': '',
                    'documentName': element.Document_Name__c,
                    'documentFamily': '',
                    'mandatory': element.Mandatory__c,
                    'documentType': element.Type__c,
                    'status': element.Is_Document_Received__c ? 'Received' : element.Status__c,
                    'stage': element.Deferral_Stage__c,
                    'isStatusDisabled': element.Is_Document_Received__c ? true : element.Deferred_From__c === this.stageName ? true : element.Deferral_Stage__c === this.stageName && element.Status__c === 'Waived' ? true : false,
                    'deferredStageDisable': true,
                    'deferredRequired': false,
                    'deferredDate': element.Deferral_Date__c,
                    'receivedDate': '',
                    'isReceivedDateRequired': false,
                    'receivedDateDisable': true,
                    'noOfPages': '',
                    'waiverReason': element.Waiver_Reason__c,
                    'isWaiverRequired': false,
                    'waiverReasonDisable': true,
                    'remarks': element.Remarks__c,
                    'isNewRowAdded': false,
                    'fileName': '',
                    'isFileUploadDisabled': true,
                    'isFileUploadRequired': true,
                    'original': '',
                    'isoriginalDisabled': true,
                    'fileData': '',
                    'isAgreementExecution': this.isAgreementExecution,
                    'isDeferalRecord': true,
                    'deferalRecordId': element.Id,
                    'isDocumentMaster': true,
                    'applicantId': element.Type__c === 'Applicant' ? element.Current_Record_Id__c : '',
                    'propertyId': element.Type__c === 'Asset' ? element.Current_Record_Id__c : '',
                    'applicableFor' : element.Type__c === 'Applicant' ? element.Applicable_For__c : '',
                    'customerName' : element.Type__c === 'Applicant' ? element.Applicant_Name__c : '',
                    'customerType' : element.Type__c === 'Applicant' ? element.Applicant_Type__c : '',
                }
                if (element.Type__c === 'Application') {
                    this.applicationJSON.push(newRow)
                }
                if (element.Type__c === 'Applicant') {
                    this.applicantJSON.push(newRow)
                }
                if (element.Type__c === 'Asset') {
                    this.propertyJSON.push(newRow)
                }
            }
        });
        /** For Show All Current Stage Deferral Document Record */
        console.log('this.mapOfDeferralDocument #### ', JSON.stringify(this.mapOfDeferralDocument));
        if (this.mapOfDeferralDocument !== undefined) {
            var cvMap = this.mapOfDeferralDocument;
            for (var key in cvMap) {
                if (cvMap[key].Deferral_Stage__c === this.stageName && !cvMap[key].Is_Document_Master_Record__c && !cvMap[key].Is_Document_Received__c) {
                    console.log('inside map of deferal document first');
                    var newRow = {
                        'documentCode': cvMap[key].Document_Name__c,
                        'docSetCodeId': cvMap[key].Document_Set_Code__c,
                        'applicationId': this.applicationId,
                        'serialNumber': '',
                        'documentName': cvMap[key].Document_Name__c,
                        'documentFamily': cvMap[key].Document_Family__c,
                        'mandatory': cvMap[key].Mandatory__c,
                        'documentType': cvMap[key].Type__c,
                        'isStatusDisabled': cvMap[key].Is_Document_Received__c  ? true : !cvMap[key].Is_Document_Received__c && cvMap[key].Status__c === 'Waived' ? true : false,
                        'status': cvMap[key].Status__c,//cvMap[key].Deferred_From__c === this.stageName,//this.stageName === cvMap[key].Uploaded_From__c ? cvMap[key].Status__c : 'Deferred',
                        'stage': this.stageName,
                        'deferredStageDisable': true,
                        'deferredRequired': false,
                        'deferredDate': cvMap[key].Deferral_Date__c,
                        'receivedDate': '',
                        'isReceivedDateRequired': false,
                        'receivedDateDisable': true,
                        'noOfPages': '',
                        'waiverReason': '',
                        'isWaiverRequired': false,
                        'waiverReasonDisable': true,
                        'remarks': cvMap[key].Remarks__c,
                        'isNewRowAdded': false,
                        'fileName': '',
                        'isFileUploadDisabled': true,
                        'isFileUploadRequired': true,
                        'original': '',
                        'isoriginalDisabled': true,
                        'fileData': '',
                        'isAgreementExecution': this.isAgreementExecution,
                        'isDeferalRecord': cvMap[key].Is_Deferral_Document__c,
                        'deferalRecordId': cvMap[key].Id,
                        'isDocumentMaster': false,
                        'contentDocumentId': '',
                        'applicantId' : cvMap[key].Type__c === 'Applicant' ? cvMap[key].Current_Record_Id__c : '',
                        'propertyId' : cvMap[key].Type__c === 'Asset' ? cvMap[key].Current_Record_Id__c : '',
                        'applicableFor' : cvMap[key].Type__c === 'Applicant' ? cvMap[key].Applicable_For__c : '',
                        'customerName' : cvMap[key].Type__c === 'Applicant' ? cvMap[key].Applicant_Name__c : '',
                        'customerType' : cvMap[key].Type__c === 'Applicant' ? cvMap[key].Applicant_Type__c : '',
                        'parentPropertyId' : cvMap[key].Parent_Property_Id__c !== undefined ? cvMap[key].Parent_Property_Id__c : '',
                    }
                    if (cvMap[key].Type__c === 'Application') {
                        this.applicationJSON.push(newRow)
                    }
                    if (cvMap[key].Type__c === 'Applicant') {
                        this.applicantJSON.push(newRow)
                    }
                    if (cvMap[key].Type__c === 'Asset') {
                        this.propertyJSON.push(newRow)
                    }
                }
            }
        }
        /** For Show All Content Version Record */
        if (this.mapOfContentVersion !== undefined) {
            var cvMap = this.mapOfContentVersion;
            for (var key in cvMap) {
                if (cvMap[key].Current_Stage__c !== this.stageName && cvMap[key].Uploaded_From__c === this.stageName || cvMap[key].Is_Document_Master_Record__c === true) {
                    console.log('inside map of cv document first');
                    var newRow = {
                        'documentCode': cvMap[key].Document_Name__c,
                        'docSetCodeId': cvMap[key].Document_Set_Code_Id__c,
                        'applicationId': '',
                        'serialNumber': '',
                        'documentName': cvMap[key].Document_Name__c,
                        'documentFamily': '',
                        'mandatory': cvMap[key].Mandatory__c,
                        'documentType': cvMap[key].Document_Type__c,
                        'isStatusDisabled': this.stageName === cvMap[key].Uploaded_From__c ? true : false,
                        'status': 'Received',
                        'stage': '',
                        'deferredStageDisable': true,
                        'deferredRequired': false,
                        'deferredDate': '',
                        'receivedDate': cvMap[key].Received_Date__c,
                        'isReceivedDateRequired': false,
                        'receivedDateDisable': true,
                        'noOfPages': cvMap[key].Number_of_Pages__c,
                        'waiverReason': '',
                        'isWaiverRequired': false,
                        'waiverReasonDisable': true,
                        'remarks': cvMap[key].Remarks__c,
                        'isNewRowAdded': false,
                        'fileName': '',
                        'isFileUploadDisabled': true,
                        'isFileUploadRequired': true,
                        'original': cvMap[key].Original__c,
                        'isoriginalDisabled': true,
                        'fileData': '',
                        'isAgreementExecution': this.isAgreementExecution,
                        'isDeferalRecord': false,
                        'deferalRecordId': '',
                        'isDocumentMaster': true,
                        'contentDocumentId': cvMap[key].ContentDocumentId,
                        'applicantId' : cvMap[key].Document_Type__c === 'Applicant' ? cvMap[key].Current_Record_Id__c : '',
                        'propertyId' : cvMap[key].Document_Type__c === 'Asset' ? cvMap[key].Current_Record_Id__c : '',
                    }
                    if (cvMap[key].Document_Type__c === 'Application') {
                        this.applicationJSON.push(newRow)
                    }
                    if (cvMap[key].Document_Type__c === 'Applicant') {
                        this.applicantJSON.push(newRow)
                    }
                    if (cvMap[key].Document_Type__c === 'Asset') {
                        this.propertyJSON.push(newRow)
                    }
                }
            }
        }
        /** For Show All Document Set Code Record */
        this.listOfDocumentSetCode.forEach(element => {
            this.documentMasterIds.push(element.Document_Master__c);
            /**
             * Set Application JSON
             */

            if (element.Type__c === 'Application') {
                console.log('** inside application **');
                //For Content Version
                var isCVRecordFound = false;
                var cvRecord;
                for (var key in this.mapOfContentVersion) {
                    if (key === element.Id && element.Type__c === this.mapOfContentVersion[key].Document_Type__c) {
                        isCVRecordFound = true;
                        cvRecord = this.mapOfContentVersion[key];
                    }
                }
                //For Deferral Document
                var isDefRecordFound = false;
                var defRecord;
                for (var key in this.mapOfDeferralDocument) {
                    if (key === element.Id && element.Type__c === this.mapOfDeferralDocument[key].Type__c) {
                        isDefRecordFound = true;
                        defRecord = this.mapOfDeferralDocument[key];
                    }
                }
                var newRowDocumentRecord = {
                    'documentCode': element.Document_Master__r.Name,
                    'docSetCodeId': element.Id,
                    'applicationId': this.applicationId,
                    'serialNumber': '',
                    'documentName': element.Name,
                    'documentFamily': element.Family__c,
                    'mandatory': element.Mandatory__c,
                    'documentType': element.Type__c,
                    'status': isCVRecordFound ? 'Received' : isDefRecordFound && defRecord.Status__c === 'Deferred' ? 'Deferred' : isDefRecordFound && defRecord.Deferred_From__c === defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Waived' : isDefRecordFound && defRecord.Deferred_From__c !== defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Deferred' : 'Not Received',
                    'isStatusDisabled': isCVRecordFound ? true : isDefRecordFound && defRecord !== undefined && element.Stage__c === this.stageName ? true : isDefRecordFound && defRecord !== undefined && defRecord.Is_Document_Received__c ? true : isDefRecordFound && defRecord !== undefined && defRecord.Status__c === 'Waived' ? true : false, //isDefRecordFound && defRecord !== undefined ? true : false,
                    'stage': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Stage__c : isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Deferral_Stage__c : '',
                    'deferredStageDisable': true,
                    'deferredRequired': false,
                    'deferredDate': isDefRecordFound && defRecord ? defRecord.Deferral_Date__c : '', //isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Date__c : '',
                    'receivedDate': isCVRecordFound === true ? cvRecord.Received_Date__c : '',
                    'isReceivedDateRequired': false,
                    'receivedDateDisable': true,
                    'noOfPages': isCVRecordFound === true ? cvRecord.Number_of_Pages__c : '',
                    'waiverReason': isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Waiver_Reason__c : '',
                    'isWaiverRequired': false,
                    'waiverReasonDisable': true,
                    'remarks': isCVRecordFound === true ? cvRecord.Remarks__c : isDefRecordFound ? defRecord.Remarks__c : '',
                    'isNewRowAdded': false,
                    'isDocumentMaster': false,
                    'fileName': '',
                    'isFileUploadDisabled': true,
                    'isFileUploadRequired': true,
                    'original': isCVRecordFound === true ? cvRecord.Original__c : '',
                    'isoriginalDisabled': true,
                    'fileData': '',
                    'isAgreementExecution': this.isAgreementExecution,
                    'isDeferalRecord': defRecord !== undefined !== undefined ? true : false,
                    'deferalRecordId': defRecord !== undefined ? defRecord.Id : '',
                    'contentDocumentId': isCVRecordFound === true ? cvRecord.ContentDocumentId : '',
                }
                this.applicationJSON.push(newRowDocumentRecord);
            }

            /**
             * Set Applicant JSON
             */
            if (element.Type__c === 'Applicant') {
                if (element.Applicable_For__c === 'All' && element.Income_Type__c === 'All') {
                    console.log('** Inside first case **');
                    this.listOfLoanApplicant.forEach(loan => {
                        var isCVRecordFound = false;
                        var cvRecord;
                        var uniqueKey = element.Id + '-' + loan.Customer_Information__c;
                        for (var key in this.mapOfContentVersion) {
                            if (key === uniqueKey && element.Type__c === this.mapOfContentVersion[key].Document_Type__c) {
                                isCVRecordFound = true;
                                cvRecord = this.mapOfContentVersion[key];
                            }
                        }
                        //For Deferral Document
                        var isDefRecordFound = false;
                        var defRecord;
                        for (var key in this.mapOfDeferralDocument) {
                            if (key === uniqueKey && element.Type__c === this.mapOfDeferralDocument[key].Type__c) {
                                isDefRecordFound = true;
                                defRecord = this.mapOfDeferralDocument[key];
                            }
                        }
                        var newRowDocumentRecord = {
                            'documentCode': element.Document_Master__r.Name,
                            'docSetCodeId': element.Id,
                            'serialNumber': '',
                            'documentName': element.Name,
                            'documentFamily': element.Family__c,
                            'applicableFor': element.Applicable_For__c,
                            'mandatory': 'Yes',
                            'documentType': element.Type__c,
                            'status': isCVRecordFound ? 'Received' : isDefRecordFound && defRecord.Status__c === 'Deferred' ? 'Deferred' : isDefRecordFound && defRecord.Deferred_From__c === defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Waived' : isDefRecordFound && defRecord.Deferred_From__c !== defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Deferred' : 'Not Received',
                            'isStatusDisabled': isCVRecordFound ? true : isDefRecordFound && defRecord !== undefined && element.Stage__c === this.stageName ? true : isDefRecordFound && defRecord !== undefined && defRecord.Is_Document_Received__c ? true : isDefRecordFound && defRecord !== undefined && defRecord.Status__c === 'Waived' ? true : false,
                            'stage': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Stage__c : '',
                            'deferredStageDisable': true,
                            'deferredRequired': false,
                            'deferredDate': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Date__c : '',
                            'receivedDate': isCVRecordFound === true ? cvRecord.Received_Date__c : '',
                            'isReceivedDateRequired': false,
                            'receivedDateDisable': true,
                            'noOfPages': isCVRecordFound === true ? cvRecord.Number_of_Pages__c : '',
                            'waiverReason': isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Waiver_Reason__c : '',
                            'isWaiverRequired': false,
                            'waiverReasonDisable': true,
                            'remarks': isCVRecordFound === true ? cvRecord.Remarks__c : isDefRecordFound ? defRecord.Remarks__c : '',
                            'isNewRowAdded': false,
                            'isDocumentMaster': false,
                            'fileName': '',
                            'isFileUploadDisabled': true,
                            'isFileUploadRequired': true,
                            'original': isCVRecordFound === true ? cvRecord.Original__c : '',
                            'isoriginalDisabled': true,
                            'fileData': '',
                            'isAgreementExecution': this.isAgreementExecution,
                            'applicantId': loan.Customer_Information__c,
                            'customerType': loan.Customer_Type__c,
                            'customerName': loan.Applicant_Name__c,
                            'isDeferalRecord': element.isDeferalRecord !== undefined ? element.isDeferalRecord : false,
                            'deferalRecordId': element.deferalRecordId !== undefined ? element.deferalRecordId : '',
                            'contentDocumentId': isCVRecordFound === true ? cvRecord.ContentDocumentId : '',
                        }
                        this.applicantJSON.push(newRowDocumentRecord);
                    });

                } else {
                    if (element.Applicable_For__c === "All" && element.Income_Type__c !== "All" && !this.listOfEmpoymentDetails.length) {
                        console.log('** Inside second case ** ' + JSON.stringify(this.listOfLoanApplicant));
                        this.listOfLoanApplicant.forEach(loan => {
                            var isCVRecordFound = false;
                            var cvRecord;
                            var uniqueKey = element.Id + '-' + loan.Customer_Information__c;
                            for (var key in this.mapOfContentVersion) {
                                if (key === uniqueKey && element.Type__c === this.mapOfContentVersion[key].Document_Type__c) {
                                    isCVRecordFound = true;
                                    cvRecord = this.mapOfContentVersion[key];
                                }
                            }
                            //For Deferral Document
                            var isDefRecordFound = false;
                            var defRecord;
                            for (var key in this.mapOfDeferralDocument) {
                                if (key === uniqueKey && element.Type__c === this.mapOfDeferralDocument[key].Type__c) {
                                    isDefRecordFound = true;
                                    defRecord = this.mapOfDeferralDocument[key];
                                }
                            }
                            var newRowDocumentRecord = {
                                'documentCode': element.Document_Master__r.Name,
                                'docSetCodeId': element.Id,
                                'serialNumber': '',
                                'documentName': element.Name,
                                'documentFamily': element.Family__c,
                                'applicableFor': element.Applicable_For__c,
                                'mandatory': element.Applicable_For__c === loan.Customer_Type__c ? 'Yes' : 'No',
                                'documentType': element.Type__c,
                                'status': isCVRecordFound ? 'Received' : isDefRecordFound && defRecord.Status__c === 'Deferred' ? 'Deferred' : isDefRecordFound && defRecord.Deferred_From__c === defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Waived' : isDefRecordFound && defRecord.Deferred_From__c !== defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Deferred' : 'Not Received',
                                'isStatusDisabled': isCVRecordFound ? true : isDefRecordFound && defRecord !== undefined && element.Stage__c === this.stageName ? true : isDefRecordFound && defRecord !== undefined && defRecord.Is_Document_Received__c ? true : isDefRecordFound && defRecord !== undefined && defRecord.Status__c === 'Waived' ? true : false,
                                'stage': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Stage__c : '',
                                'deferredStageDisable': true,
                                'deferredRequired': false,
                                'deferredDate': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Date__c : '',
                                'receivedDate': isCVRecordFound === true ? cvRecord.Received_Date__c : '',
                                'isReceivedDateRequired': false,
                                'receivedDateDisable': true,
                                'noOfPages': isCVRecordFound === true ? cvRecord.Number_of_Pages__c : '',
                                'waiverReason': isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Waiver_Reason__c : '',
                                'isWaiverRequired': false,
                                'waiverReasonDisable': true,
                                'remarks': isCVRecordFound === true ? cvRecord.Remarks__c : isDefRecordFound ? defRecord.Remarks__c : '',
                                'isNewRowAdded': false,
                                'isDocumentMaster': false,
                                'fileName': '',
                                'isFileUploadDisabled': true,
                                'isFileUploadRequired': true,
                                'original': isCVRecordFound === true ? cvRecord.Original__c : '',
                                'isoriginalDisabled': true,
                                'fileData': '',
                                'isAgreementExecution': this.isAgreementExecution,
                                'applicantId': loan.Customer_Information__c,
                                'customerType': loan.Customer_Type__c,
                                'customerName': loan.Applicant_Name__c,
                                'isDeferalRecord': element.isDeferalRecord !== undefined ? element.isDeferalRecord : false,
                                'deferalRecordId': element.deferalRecordId !== undefined ? element.deferalRecordId : '',
                                'contentDocumentId': isCVRecordFound === true ? cvRecord.ContentDocumentId : '',
                            }
                            this.applicantJSON.push(newRowDocumentRecord);
                        });

                    }
                    else if (element.Applicable_For__c !== "All" && element.Income_Type__c === "All" && !this.listOfEmpoymentDetails.length) {
                        console.log('** Inside third case **');
                        this.listOfLoanApplicant.forEach(loan => {
                            var isCVRecordFound = false;
                            var cvRecord;
                            var uniqueKey = element.Id + '-' + loan.Customer_Information__c;
                            for (var key in this.mapOfContentVersion) {
                                if (key === uniqueKey && element.Type__c === this.mapOfContentVersion[key].Document_Type__c) {
                                    isCVRecordFound = true;
                                    cvRecord = this.mapOfContentVersion[key];
                                }
                            }
                            console.log('isCVRecordFound #### ',isCVRecordFound);
                            console.log('cvRecord #### ',cvRecord);
                            var isDefRecordFound = false;
                            var defRecord;
                            for (var key in this.mapOfDeferralDocument) {
                                if (key === uniqueKey && element.Type__c === this.mapOfDeferralDocument[key].Type__c) {
                                    isDefRecordFound = true;
                                    defRecord = this.mapOfDeferralDocument[key];
                                }
                            }
                            console.log('isDefRecordFound #### ',isDefRecordFound);
                            console.log('defRecord #### ',defRecord);
                            var newRowDocumentRecord = {
                                'documentCode': element.Document_Master__r.Name,
                                'docSetCodeId': element.Id,
                                'serialNumber': '',
                                'documentName': element.Name,
                                'documentFamily': element.Family__c,
                                'applicableFor': element.Applicable_For__c,
                                'mandatory': element.Applicable_For__c === loan.Customer_Type__c ? 'Yes' : 'No',
                                'documentType': element.Type__c,
                                'status': isCVRecordFound ? 'Received' : isDefRecordFound && defRecord.Status__c === 'Deferred' ? 'Deferred' : isDefRecordFound && defRecord.Deferred_From__c === defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Waived' : isDefRecordFound && defRecord.Deferred_From__c !== defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Deferred' : 'Not Received',
                                'isStatusDisabled': isCVRecordFound ? true : isDefRecordFound && defRecord !== undefined && element.Stage__c === this.stageName ? true : isDefRecordFound && defRecord !== undefined && defRecord.Is_Document_Received__c ? true : isDefRecordFound && defRecord !== undefined && defRecord.Status__c === 'Waived' ? true : false,
                                'stage': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Stage__c : '',
                                'deferredStageDisable': true,
                                'deferredRequired': false,
                                'deferredDate': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Date__c : '',
                                'receivedDate': isCVRecordFound === true ? cvRecord.Received_Date__c : '',
                                'isReceivedDateRequired': false,
                                'receivedDateDisable': true,
                                'noOfPages': isCVRecordFound === true ? cvRecord.Number_of_Pages__c : '',
                                'waiverReason': isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Waiver_Reason__c : '',
                                'isWaiverRequired': false,
                                'waiverReasonDisable': true,
                                'remarks': isCVRecordFound === true ? cvRecord.Remarks__c : isDefRecordFound ? defRecord.Remarks__c : '',
                                'isNewRowAdded': false,
                                'isDocumentMaster': false,
                                'fileName': '',
                                'isFileUploadDisabled': true,
                                'isFileUploadRequired': true,
                                'original': isCVRecordFound === true ? cvRecord.Original__c : '',
                                'isoriginalDisabled': true,
                                'fileData': '',
                                'isAgreementExecution': this.isAgreementExecution,
                                'applicantId': loan.Customer_Information__c,
                                'customerType': loan.Customer_Type__c,
                                'customerName': loan.Applicant_Name__c,
                                'isDeferalRecord': element.isDeferalRecord !== undefined ? element.isDeferalRecord : false,
                                'deferalRecordId': element.deferalRecordId !== undefined ? element.deferalRecordId : '',
                                'contentDocumentId': isCVRecordFound === true ? cvRecord.ContentDocumentId : '',
                            }
                            this.applicantJSON.push(newRowDocumentRecord);
                        });
                    }
                    else if (element.Applicable_For__c !== "All" && element.Income_Type__c !== "All" && !this.listOfEmpoymentDetails.length) {
                        console.log('** Inside fourth case **');
                        this.listOfLoanApplicant.forEach(loan => {
                            var isCVRecordFound = false;
                            var cvRecord;
                            var uniqueKey = element.Id + '-' + loan.Customer_Information__c;
                            for (var key in this.mapOfContentVersion) {
                                if (key === uniqueKey && element.Type__c === this.mapOfContentVersion[key].Document_Type__c) {
                                    isCVRecordFound = true;
                                    cvRecord = this.mapOfContentVersion[key];
                                }
                            }
                            //For Deferral Document
                            var isDefRecordFound = false;
                            var defRecord;
                            for (var key in this.mapOfDeferralDocument) {
                                if (key === uniqueKey && element.Type__c === this.mapOfDeferralDocument[key].Type__c) {
                                    isDefRecordFound = true;
                                    defRecord = this.mapOfDeferralDocument[key];
                                }
                            }
                            var newRowDocumentRecord = {
                                'documentCode': element.Document_Master__r.Name,
                                'docSetCodeId': element.Id,
                                'serialNumber': '',
                                'documentName': element.Name,
                                'documentFamily': element.Family__c,
                                'applicableFor': element.Applicable_For__c,
                                'mandatory': 'No',
                                'documentType': element.Type__c,
                                'status': isCVRecordFound ? 'Received' : isDefRecordFound && defRecord.Status__c === 'Deferred' ? 'Deferred' : isDefRecordFound && defRecord.Deferred_From__c === defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Waived' : isDefRecordFound && defRecord.Deferred_From__c !== defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Deferred' : 'Not Received',
                                'isStatusDisabled': isCVRecordFound ? true : isDefRecordFound && defRecord !== undefined && element.Stage__c === this.stageName ? true : isDefRecordFound && defRecord !== undefined && defRecord.Is_Document_Received__c ? true : isDefRecordFound && defRecord !== undefined && defRecord.Status__c === 'Waived' ? true : false,
                                'stage': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Stage__c : '',
                                'deferredDate': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Date__c : '',
                                'receivedDate': isCVRecordFound === true ? cvRecord.Received_Date__c : '',
                                'noOfPages': isCVRecordFound === true ? cvRecord.Number_of_Pages__c : '',
                                'waiverReason': isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Waiver_Reason__c : '',
                                'remarks': isCVRecordFound === true ? cvRecord.Remarks__c : isDefRecordFound ? defRecord.Remarks__c : '',
                                'original': isCVRecordFound === true ? cvRecord.Original__c : '',
                                'deferredStageDisable': true,
                                'deferredRequired': false,
                                'isReceivedDateRequired': false,
                                'receivedDateDisable': true,
                                'isWaiverRequired': false,
                                'waiverReasonDisable': true,
                                'isNewRowAdded': false,
                                'isDocumentMaster': false,
                                'fileName': '',
                                'isFileUploadDisabled': true,
                                'isFileUploadRequired': true,
                                'isoriginalDisabled': true,
                                'fileData': '',
                                'isAgreementExecution': this.isAgreementExecution,
                                'applicantId': loan.Customer_Information__c,
                                'customerType': loan.Customer_Type__c,
                                'customerName': loan.Applicant_Name__c,
                                'isDeferalRecord': element.isDeferalRecord !== undefined ? element.isDeferalRecord : false,
                                'deferalRecordId': element.deferalRecordId !== undefined ? element.deferalRecordId : '',
                                'contentDocumentId': isCVRecordFound === true ? cvRecord.ContentDocumentId : '',
                            }
                            this.applicantJSON.push(newRowDocumentRecord);
                        });
                    }


                    //
                    else if (element.Applicable_For__c === "All" && element.Income_Type__c !== "All" && this.listOfEmpoymentDetails.length) {
                        console.log('** Inside five case **');
                        var loanApplicantIds = [];
                        this.listOfLoanApplicant.forEach(loan => {
                            var isCVRecordFound = false;
                            var cvRecord;
                            var uniqueKey = element.Id + '-' + loan.Customer_Information__c;
                            for (var key in this.mapOfContentVersion) {
                                if (key === uniqueKey && element.Type__c === this.mapOfContentVersion[key].Document_Type__c) {
                                    isCVRecordFound = true;
                                    cvRecord = this.mapOfContentVersion[key];
                                }
                            }
                            //For Deferral Document
                            var isDefRecordFound = false;
                            var defRecord;
                            for (var key in this.mapOfDeferralDocument) {
                                if (key === uniqueKey && element.Type__c === this.mapOfDeferralDocument[key].Type__c) {
                                    isDefRecordFound = true;
                                    defRecord = this.mapOfDeferralDocument[key];
                                }
                            }
                            this.listOfEmpoymentDetails.forEach(emp => {
                                if (emp.Loan_Applicant__c === loan.Id) {
                                    loanApplicantIds.push(loan.Id);
                                    var newRowDocumentRecord = {
                                        'documentCode': element.Document_Master__r.Name,
                                        'docSetCodeId': element.Id,
                                        'serialNumber': '',
                                        'documentName': element.Name,
                                        'documentFamily': element.Family__c,
                                        'applicableFor': element.Applicable_For__c,
                                        'mandatory': emp.Occupation__c === element.Income_Type__c ? 'Yes' : 'No',
                                        'documentType': element.Type__c,
                                        'status': isCVRecordFound ? 'Received' : isDefRecordFound && defRecord.Status__c === 'Deferred' ? 'Deferred' : isDefRecordFound && defRecord.Deferred_From__c === defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Waived' : isDefRecordFound && defRecord.Deferred_From__c !== defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Deferred' : 'Not Received',
                                        'isStatusDisabled': isCVRecordFound ? true : isDefRecordFound && defRecord !== undefined && element.Stage__c === this.stageName ? true : isDefRecordFound && defRecord !== undefined && defRecord.Is_Document_Received__c ? true : isDefRecordFound && defRecord !== undefined && defRecord.Status__c === 'Waived' ? true : false,
                                        'stage': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Stage__c : '',
                                        'deferredDate': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Date__c : '',
                                        'receivedDate': isCVRecordFound === true ? cvRecord.Received_Date__c : '',
                                        'noOfPages': isCVRecordFound === true ? cvRecord.Number_of_Pages__c : '',
                                        'waiverReason': isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Waiver_Reason__c : '',
                                        'remarks': isCVRecordFound === true ? cvRecord.Remarks__c : isDefRecordFound ? defRecord.Remarks__c : '',
                                        'original': isCVRecordFound === true ? cvRecord.Original__c : '',
                                        'deferredStageDisable': true,
                                        'deferredRequired': false,
                                        'isReceivedDateRequired': false,
                                        'receivedDateDisable': true,
                                        'isWaiverRequired': false,
                                        'waiverReasonDisable': true,
                                        'isNewRowAdded': false,
                                        'isDocumentMaster': false,
                                        'fileName': '',
                                        'isFileUploadDisabled': true,
                                        'isFileUploadRequired': true,
                                        'isoriginalDisabled': true,
                                        'fileData': '',
                                        'isAgreementExecution': this.isAgreementExecution,
                                        'applicantId': loan.Customer_Information__c,
                                        'customerType': loan.Customer_Type__c,
                                        'customerName': loan.Applicant_Name__c,
                                        'isDeferalRecord': element.isDeferalRecord !== undefined ? element.isDeferalRecord : false,
                                        'deferalRecordId': element.deferalRecordId !== undefined ? element.deferalRecordId : '',
                                        'contentDocumentId': isCVRecordFound === true ? cvRecord.ContentDocumentId : '',
                                    }
                                    this.applicantJSON.push(newRowDocumentRecord);
                                }
                            })
                            if (!loanApplicantIds.includes(loan.Id)) {
                                var newRowDocumentRecord = {
                                    'documentCode': element.Document_Master__r.Name,
                                    'docSetCodeId': element.Id,
                                    'serialNumber': '',
                                    'documentName': element.Name,
                                    'documentFamily': element.Family__c,
                                    'applicableFor': element.Applicable_For__c,
                                    'mandatory': 'No',
                                    'documentType': element.Type__c,
                                    'status': isCVRecordFound ? 'Received' : isDefRecordFound && defRecord.Status__c === 'Deferred' ? 'Deferred' : isDefRecordFound && defRecord.Deferred_From__c === defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Waived' : isDefRecordFound && defRecord.Deferred_From__c !== defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Deferred' : 'Not Received',
                                    'isStatusDisabled': isCVRecordFound ? true : isDefRecordFound && defRecord !== undefined && element.Stage__c === this.stageName ? true : isDefRecordFound && defRecord !== undefined && defRecord.Is_Document_Received__c ? true : isDefRecordFound && defRecord !== undefined && defRecord.Status__c === 'Waived' ? true : false,
                                    'stage': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Stage__c : '',
                                    'deferredDate': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Date__c : '',
                                    'receivedDate': isCVRecordFound === true ? cvRecord.Received_Date__c : '',
                                    'noOfPages': isCVRecordFound === true ? cvRecord.Number_of_Pages__c : '',
                                    'waiverReason': isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Waiver_Reason__c : '',
                                    'remarks': isCVRecordFound === true ? cvRecord.Remarks__c : isDefRecordFound ? defRecord.Remarks__c : '',
                                    'original': isCVRecordFound === true ? cvRecord.Original__c : '',
                                    'deferredStageDisable': true,
                                    'deferredRequired': false,
                                    'isReceivedDateRequired': false,
                                    'receivedDateDisable': true,
                                    'isWaiverRequired': false,
                                    'waiverReasonDisable': true,
                                    'isNewRowAdded': false,
                                    'isDocumentMaster': false,
                                    'fileName': '',
                                    'isFileUploadDisabled': true,
                                    'isFileUploadRequired': true,
                                    'isoriginalDisabled': true,
                                    'fileData': '',
                                    'isAgreementExecution': this.isAgreementExecution,
                                    'applicantId': loan.Customer_Information__c,
                                    'customerType': loan.Customer_Type__c,
                                    'customerName': loan.Applicant_Name__c,
                                    'isDeferalRecord': element.isDeferalRecord !== undefined ? element.isDeferalRecord : false,
                                    'deferalRecordId': element.deferalRecordId !== undefined ? element.deferalRecordId : '',
                                    'contentDocumentId': isCVRecordFound === true ? cvRecord.ContentDocumentId : '',
                                }
                                this.applicantJSON.push(newRowDocumentRecord);
                            }
                        })
                    }
                    else if (element.Applicable_For__c !== "All" && element.Income_Type__c === "All" && this.listOfEmpoymentDetails.length) {
                        console.log('** Inside six case **');
                        var loanApplicantIds = [];
                        this.listOfLoanApplicant.forEach(loan => {
                            var isCVRecordFound = false;
                            var cvRecord;
                            var uniqueKey = element.Id + '-' + loan.Customer_Information__c;
                            for (var key in this.mapOfContentVersion) {
                                if (key === uniqueKey && element.Type__c === this.mapOfContentVersion[key].Document_Type__c) {
                                    isCVRecordFound = true;
                                    cvRecord = this.mapOfContentVersion[key];
                                }
                            }
                            //For Deferral Document
                            var isDefRecordFound = false;
                            var defRecord;
                            for (var key in this.mapOfDeferralDocument) {
                                if (key === uniqueKey && element.Type__c === this.mapOfDeferralDocument[key].Type__c) {
                                    isDefRecordFound = true;
                                    defRecord = this.mapOfDeferralDocument[key];
                                }
                            }
                            this.listOfEmpoymentDetails.forEach(emp => {
                                if (emp.Loan_Applicant__c === loan.Id) {
                                    loanApplicantIds.push(loan.Id);
                                    var newRowDocumentRecord = {
                                        'documentCode': element.Document_Master__r.Name,
                                        'docSetCodeId': element.Id,
                                        'serialNumber': '',
                                        'documentName': element.Name,
                                        'documentFamily': element.Family__c,
                                        'applicableFor': element.Applicable_For__c,
                                        'mandatory': loan.Customer_Type__c === element.Applicable_For__c ? 'Yes' : 'No',
                                        'documentType': element.Type__c,
                                        'status': isCVRecordFound ? 'Received' : isDefRecordFound && defRecord.Status__c === 'Deferred' ? 'Deferred' : isDefRecordFound && defRecord.Deferred_From__c === defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Waived' : isDefRecordFound && defRecord.Deferred_From__c !== defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Deferred' : 'Not Received',
                                        'isStatusDisabled': isCVRecordFound ? true : isDefRecordFound && defRecord !== undefined && element.Stage__c === this.stageName ? true : isDefRecordFound && defRecord !== undefined && defRecord.Is_Document_Received__c ? true : isDefRecordFound && defRecord !== undefined && defRecord.Status__c === 'Waived' ? true : false,
                                        'stage': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Stage__c : '',
                                        'deferredDate': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Date__c : '',
                                        'receivedDate': isCVRecordFound === true ? cvRecord.Received_Date__c : '',
                                        'noOfPages': isCVRecordFound === true ? cvRecord.Number_of_Pages__c : '',
                                        'waiverReason': isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Waiver_Reason__c : '',
                                        'remarks': isCVRecordFound === true ? cvRecord.Remarks__c : isDefRecordFound ? defRecord.Remarks__c : '',
                                        'original': isCVRecordFound === true ? cvRecord.Original__c : '',
                                        'deferredStageDisable': true,
                                        'deferredRequired': false,
                                        'isReceivedDateRequired': false,
                                        'receivedDateDisable': true,
                                        'isWaiverRequired': false,
                                        'waiverReasonDisable': true,
                                        'isNewRowAdded': false,
                                        'isDocumentMaster': false,
                                        'fileName': '',
                                        'isFileUploadDisabled': true,
                                        'isFileUploadRequired': true,
                                        'isoriginalDisabled': true,
                                        'fileData': '',
                                        'isAgreementExecution': this.isAgreementExecution,
                                        'applicantId': loan.Customer_Information__c,
                                        'customerType': loan.Customer_Type__c,
                                        'customerName': loan.Applicant_Name__c,
                                        'isDeferalRecord': element.isDeferalRecord !== undefined ? element.isDeferalRecord : false,
                                        'deferalRecordId': element.deferalRecordId !== undefined ? element.deferalRecordId : '',
                                        'contentDocumentId': isCVRecordFound === true ? cvRecord.ContentDocumentId : '',
                                    }
                                    this.applicantJSON.push(newRowDocumentRecord);
                                }
                            })
                            if (!loanApplicantIds.includes(loan.Id)) {
                                var newRowDocumentRecord = {
                                    'documentCode': element.Document_Master__r.Name,
                                    'docSetCodeId': element.Id,
                                    'serialNumber': '',
                                    'documentName': element.Name,
                                    'documentFamily': element.Family__c,
                                    'applicableFor': element.Applicable_For__c,
                                    'mandatory': 'No',
                                    'documentType': element.Type__c,
                                    'status': isCVRecordFound ? 'Received' : isDefRecordFound && defRecord.Status__c === 'Deferred' ? 'Deferred' : isDefRecordFound && defRecord.Deferred_From__c === defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Waived' : isDefRecordFound && defRecord.Deferred_From__c !== defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Deferred' : 'Not Received',
                                    'isStatusDisabled': isCVRecordFound ? true : isDefRecordFound && defRecord !== undefined && element.Stage__c === this.stageName ? true : isDefRecordFound && defRecord !== undefined && defRecord.Is_Document_Received__c ? true : isDefRecordFound && defRecord !== undefined && defRecord.Status__c === 'Waived' ? true : false,
                                    'stage': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Stage__c : '',
                                    'deferredDate': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Date__c : '',
                                    'receivedDate': isCVRecordFound === true ? cvRecord.Received_Date__c : '',
                                    'noOfPages': isCVRecordFound === true ? cvRecord.Number_of_Pages__c : '',
                                    'waiverReason': isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Waiver_Reason__c : '',
                                    'remarks': isCVRecordFound === true ? cvRecord.Remarks__c : isDefRecordFound ? defRecord.Remarks__c : '',
                                    'original': isCVRecordFound === true ? cvRecord.Original__c : '',
                                    'deferredStageDisable': true,
                                    'deferredRequired': false,
                                    'isReceivedDateRequired': false,
                                    'receivedDateDisable': true,
                                    'isWaiverRequired': false,
                                    'waiverReasonDisable': true,
                                    'isNewRowAdded': false,
                                    'isDocumentMaster': false,
                                    'fileName': '',
                                    'isFileUploadDisabled': true,
                                    'isFileUploadRequired': true,
                                    'isoriginalDisabled': true,
                                    'fileData': '',
                                    'isAgreementExecution': this.isAgreementExecution,
                                    'applicantId': loan.Customer_Information__c,
                                    'customerType': loan.Customer_Type__c,
                                    'customerName': loan.Applicant_Name__c,
                                    'isDeferalRecord': element.isDeferalRecord !== undefined ? element.isDeferalRecord : false,
                                    'deferalRecordId': element.deferalRecordId !== undefined ? element.deferalRecordId : '',
                                    'contentDocumentId': isCVRecordFound === true ? cvRecord.ContentDocumentId : '',
                                }
                                this.applicantJSON.push(newRowDocumentRecord);
                            }
                        })
                    }
                    else if (element.Applicable_For__c !== "All" && element.Income_Type__c !== "All" && this.listOfEmpoymentDetails.length) {
                        console.log('** Inside seven case **');
                        var loanApplicantIds = [];
                        this.listOfLoanApplicant.forEach(loan => {

                            var isCVRecordFound = false;
                            var cvRecord;
                            var uniqueKey = element.Id + '-' + loan.Customer_Information__c;
                            for (var key in this.mapOfContentVersion) {
                                if (key === uniqueKey && element.Type__c === this.mapOfContentVersion[key].Document_Type__c) {
                                    isCVRecordFound = true;
                                    cvRecord = this.mapOfContentVersion[key];
                                }
                            }
                            //For Deferral Document
                            var isDefRecordFound = false;
                            var defRecord;
                            for (var key in this.mapOfDeferralDocument) {
                                if (key === uniqueKey && element.Type__c === this.mapOfDeferralDocument[key].Type__c) {
                                    isDefRecordFound = true;
                                    defRecord = this.mapOfDeferralDocument[key];
                                }
                            }
                            this.listOfEmpoymentDetails.forEach(emp => {
                                if (emp.Loan_Applicant__c === loan.Id) {
                                    loanApplicantIds.push(loan.Id);
                                    var newRowDocumentRecord = {
                                        'documentCode': element.Document_Master__r.Name,
                                        'docSetCodeId': element.Id,
                                        'serialNumber': '',
                                        'documentName': element.Name,
                                        'documentFamily': element.Family__c,
                                        'applicableFor': element.Applicable_For__c,
                                        'mandatory': emp.Occupation__c === element.Income_Type__c && loan.Customer_Type__c === element.Applicable_For__c ? 'Yes' : 'No',
                                        'documentType': element.Type__c,
                                        'status': isCVRecordFound ? 'Received' : isDefRecordFound && defRecord.Status__c === 'Deferred' ? 'Deferred' : isDefRecordFound && defRecord.Deferred_From__c === defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Waived' : isDefRecordFound && defRecord.Deferred_From__c !== defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Deferred' : 'Not Received',
                                        'isStatusDisabled': isCVRecordFound ? true : isDefRecordFound && defRecord !== undefined && element.Stage__c === this.stageName ? true : isDefRecordFound && defRecord !== undefined && defRecord.Is_Document_Received__c ? true : isDefRecordFound && defRecord !== undefined && defRecord.Status__c === 'Waived' ? true : false,
                                        'stage': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Stage__c : '',
                                        'deferredDate': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Date__c : '',
                                        'receivedDate': isCVRecordFound === true ? cvRecord.Received_Date__c : '',
                                        'noOfPages': isCVRecordFound === true ? cvRecord.Number_of_Pages__c : '',
                                        'waiverReason': isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Waiver_Reason__c : '',
                                        'remarks': isCVRecordFound === true ? cvRecord.Remarks__c : isDefRecordFound ? defRecord.Remarks__c : '',
                                        'original': isCVRecordFound === true ? cvRecord.Original__c : '',
                                        'deferredStageDisable': true,
                                        'deferredRequired': false,
                                        'isReceivedDateRequired': false,
                                        'receivedDateDisable': true,
                                        'isWaiverRequired': false,
                                        'waiverReasonDisable': true,
                                        'isNewRowAdded': false,
                                        'isDocumentMaster': false,
                                        'fileName': '',
                                        'isFileUploadDisabled': true,
                                        'isFileUploadRequired': true,
                                        'isoriginalDisabled': true,
                                        'fileData': '',
                                        'isAgreementExecution': this.isAgreementExecution,
                                        'applicantId': loan.Customer_Information__c,
                                        'customerType': loan.Customer_Type__c,
                                        'customerName': loan.Applicant_Name__c,
                                        'isDeferalRecord': element.isDeferalRecord !== undefined ? element.isDeferalRecord : false,
                                        'deferalRecordId': element.deferalRecordId !== undefined ? element.deferalRecordId : '',
                                        'contentDocumentId': isCVRecordFound === true ? cvRecord.ContentDocumentId : '',
                                    }
                                    this.applicantJSON.push(newRowDocumentRecord);
                                }
                            });
                            if (!loanApplicantIds.includes(loan.Id)) {
                                var newRowDocumentRecord = {
                                    'documentCode': element.Document_Master__r.Name,
                                    'docSetCodeId': element.Id,
                                    'serialNumber': '',
                                    'documentName': element.Name,
                                    'documentFamily': element.Family__c,
                                    'applicableFor': element.Applicable_For__c,
                                    'mandatory': 'No',
                                    'documentType': element.Type__c,
                                    'status': isCVRecordFound ? 'Received' : isDefRecordFound && defRecord.Status__c === 'Deferred' ? 'Deferred' : isDefRecordFound && defRecord.Deferred_From__c === defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Waived' : isDefRecordFound && defRecord.Deferred_From__c !== defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Deferred' : 'Not Received',
                                    'isStatusDisabled': isCVRecordFound ? true : isDefRecordFound && defRecord !== undefined && element.Stage__c === this.stageName ? true : isDefRecordFound && defRecord !== undefined && defRecord.Is_Document_Received__c ? true : isDefRecordFound && defRecord !== undefined && defRecord.Status__c === 'Waived' ? true : false,
                                    'stage': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Stage__c : '',
                                    'deferredDate': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Date__c : '',
                                    'receivedDate': isCVRecordFound === true ? cvRecord.Received_Date__c : '',
                                    'noOfPages': isCVRecordFound === true ? cvRecord.Number_of_Pages__c : '',
                                    'waiverReason': isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Waiver_Reason__c : '',
                                    'remarks': isCVRecordFound === true ? cvRecord.Remarks__c : isDefRecordFound ? defRecord.Remarks__c : '',
                                    'original': isCVRecordFound === true ? cvRecord.Original__c : '',
                                    'deferredStageDisable': true,
                                    'deferredRequired': false,
                                    'isReceivedDateRequired': false,
                                    'receivedDateDisable': true,
                                    'isWaiverRequired': false,
                                    'waiverReasonDisable': true,
                                    'isNewRowAdded': false,
                                    'isDocumentMaster': false,
                                    'fileName': '',
                                    'isFileUploadDisabled': true,
                                    'isFileUploadRequired': true,
                                    'isoriginalDisabled': true,
                                    'fileData': '',
                                    'isAgreementExecution': this.isAgreementExecution,
                                    'applicantId': loan.Customer_Information__c,
                                    'customerType': loan.Customer_Type__c,
                                    'customerName': loan.Applicant_Name__c,
                                    'isDeferalRecord': element.isDeferalRecord !== undefined ? element.isDeferalRecord : false,
                                    'deferalRecordId': element.deferalRecordId !== undefined ? element.deferalRecordId : '',
                                    'contentDocumentId': isCVRecordFound === true ? cvRecord.ContentDocumentId : '',
                                }
                                this.applicantJSON.push(newRowDocumentRecord);
                            }
                        });
                    }
                }
            }
            /**
             * Set Asset JSON
             */
            if (element.Type__c === 'Asset') {
                this.listOfProperty.forEach(property => {
                    var isCVRecordFound = false;
                    var cvRecord;
                    
                    var setCodeWithPropertyId = element.Id + property.Id;
                    var setCodeWithParentPropertyId = element.Id;
                    if(this.stageName === 'Login'){
                        setCodeWithParentPropertyId += property.Id;
                    }else{
                        setCodeWithParentPropertyId += property.Property__c
                    }
                    console.log('uniqueKey1 >>>> ' + setCodeWithPropertyId)
                    console.log('uniqueKey2 >>>> ' + setCodeWithParentPropertyId)

                    for (var key in this.mapOfContentVersion) {
                        var splitedCVIds = key.split('-');
                        console.log(':: mapOfContentVersion key :: ' + splitedCVIds)
                        
                        if ((splitedCVIds[0] === setCodeWithPropertyId || splitedCVIds[1] === setCodeWithParentPropertyId) && element.Type__c === this.mapOfContentVersion[key].Document_Type__c) {
                            isCVRecordFound = true;
                            cvRecord = this.mapOfContentVersion[key];
                        }
                    }
                    //For Deferral Document
                    var isDefRecordFound = false;
                    var defRecord;
                    for (var key in this.mapOfDeferralDocument) {
                        var splitedDefIds = key.split('-');
                        console.log('asset key def >>>> ' + splitedDefIds)
                        if ((splitedDefIds[0] === setCodeWithPropertyId || splitedDefIds[1] === setCodeWithParentPropertyId) && element.Type__c === this.mapOfDeferralDocument[key].Type__c) {
                            isDefRecordFound = true;
                            defRecord = this.mapOfDeferralDocument[key];
                        }
                    }
                    console.log(':: defRecord :: ', defRecord);
                    if (element.Asset_Type__c === 'All') {
                        console.log('inside asset case 1');
                        var newRowDocumentRecord = {
                            'documentCode': element.Document_Master__r.Name,
                            'docSetCodeId': element.Id,
                            'serialNumber': '',
                            'documentName': element.Name,
                            'documentFamily': element.Family__c,
                            'documentType': element.Type__c,
                            'mandatory': 'Yes',
                            'status': isCVRecordFound ? 'Received' : isDefRecordFound && defRecord.Status__c === 'Deferred' ? 'Deferred' : isDefRecordFound && defRecord.Deferred_From__c === defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Waived' : isDefRecordFound && defRecord.Deferred_From__c !== defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Deferred' : 'Not Received',
                            'isStatusDisabled': isCVRecordFound ? true : isDefRecordFound && defRecord !== undefined && element.Stage__c === this.stageName ? true : isDefRecordFound && defRecord !== undefined && defRecord.Is_Document_Received__c ? true : isDefRecordFound && defRecord !== undefined && defRecord.Status__c === 'Waived' ? true : false,
                            'stage': isDefRecordFound && (defRecord.Status__c === 'Deferred' || defRecord.Status__c === 'Waived') ? defRecord.Deferral_Stage__c : '',
                            'deferredDate': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Date__c : '',
                            'receivedDate': isCVRecordFound === true ? cvRecord.Received_Date__c : '',
                            'noOfPages': isCVRecordFound === true ? cvRecord.Number_of_Pages__c : '',
                            'waiverReason': isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Waiver_Reason__c : '',
                            'remarks': isCVRecordFound === true ? cvRecord.Remarks__c : isDefRecordFound ? defRecord.Remarks__c : '',
                            'original': isCVRecordFound === true ? cvRecord.Original__c : '',
                            'deferredStageDisable': true,
                            'deferredRequired': false,
                            'isReceivedDateRequired': false,
                            'receivedDateDisable': true,
                            'isWaiverRequired': false,
                            'waiverReasonDisable': true,
                            'isNewRowAdded': false,
                            'isDocumentMaster': false,
                            'fileName': '',
                            'isFileUploadDisabled': true,
                            'isFileUploadRequired': true,
                            'isoriginalDisabled': true,
                            'fileData': '',
                            'isAgreementExecution': this.isAgreementExecution,
                            'propertyId': property.Id,
                            'propertyName': property.Name,
                            'propertyType': property.Property_Type__c,
                            'isDeferalRecord': element.isDeferalRecord !== undefined ? element.isDeferalRecord : false,
                            'deferalRecordId': element.deferalRecordId !== undefined ? element.deferalRecordId : '',
                            'contentDocumentId': isCVRecordFound === true ? cvRecord.ContentDocumentId : '',
                        }
                        this.propertyJSON.push(newRowDocumentRecord);
                    } else if (element.Asset_Type__c !== 'All') {
                        console.log('inside asset case 2');
                        var newRowDocumentRecord = {
                            'documentCode': element.Document_Master__r.Name,
                            'docSetCodeId': element.Id,
                            'serialNumber': '',
                            'documentName': element.Name,
                            'documentFamily': element.Family__c,
                            'mandatory': element.Asset_Type__c === property.Property_Type__c ? 'Yes' : 'No',
                            'documentType': element.Type__c,
                            'status': isCVRecordFound ? 'Received' : isDefRecordFound && defRecord.Status__c === 'Deferred' ? 'Deferred' : isDefRecordFound && defRecord.Deferred_From__c === defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Waived' : isDefRecordFound && defRecord.Deferred_From__c !== defRecord.Uploaded_From__c && defRecord.Status__c === 'Waived' ? 'Deferred' : 'Not Received',
                            'isStatusDisabled': isCVRecordFound ? true : isDefRecordFound && defRecord !== undefined && element.Stage__c === this.stageName ? true : isDefRecordFound && defRecord !== undefined && defRecord.Is_Document_Received__c ? true : isDefRecordFound && defRecord !== undefined && defRecord.Status__c === 'Waived' ? true : false,
                            'stage': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Stage__c : '',
                            'deferredDate': isDefRecordFound && defRecord.Status__c === 'Deferred' ? defRecord.Deferral_Date__c : '',
                            'receivedDate': isCVRecordFound === true ? cvRecord.Received_Date__c : '',
                            'noOfPages': isCVRecordFound === true ? cvRecord.Number_of_Pages__c : '',
                            'waiverReason': isDefRecordFound && defRecord.Status__c === 'Waived' ? defRecord.Waiver_Reason__c : '',
                            'remarks': isCVRecordFound === true ? cvRecord.Remarks__c : isDefRecordFound ? defRecord.Remarks__c : '',
                            'original': isCVRecordFound === true ? cvRecord.Original__c : '',
                            'deferredStageDisable': true,
                            'deferredRequired': false,
                            'isReceivedDateRequired': false,
                            'receivedDateDisable': true,
                            'isWaiverRequired': false,
                            'waiverReasonDisable': true,
                            'isNewRowAdded': false,
                            'isDocumentMaster': false,
                            'fileName': '',
                            'isFileUploadDisabled': true,
                            'isFileUploadRequired': true,
                            'isoriginalDisabled': true,
                            'fileData': '',
                            'isAgreementExecution': this.isAgreementExecution,
                            'propertyId': property.Id,
                            'propertyName': property.Name,
                            'propertyType': property.Property_Type__c,
                            'isDeferalRecord': element.isDeferalRecord !== undefined ? element.isDeferalRecord : false,
                            'deferalRecordId': element.deferalRecordId !== undefined ? element.deferalRecordId : '',
                            'contentDocumentId': isCVRecordFound === true ? cvRecord.ContentDocumentId : '',
                        }
                        this.propertyJSON.push(newRowDocumentRecord);
                    }
                })
            }
        })
        console.log('** this.propertyJSON @@@@ ', JSON.stringify(this.propertyJSON));
        this.isSpinnerActive = false;
        console.log('** inside cv map out side @@@@ ', JSON.stringify(this.applicantJSON));
    }

    mandatoryDocumentValidation() {
        console.log('application data :: ', JSON.stringify(this.applicationJSON));
        var mandatoryDocuments = [];
        this.applicationJSON(element => {
            if (element.mandatory === 'Yes' && element.stage !== 'Deferred' && element.stage !== 'Waived') {
                var details = 'Upload Application Type Document - ' + element.documentName;
                mandatoryDocuments.push(details);
            }
        })
        console.log('mandatoryDocuments #### ' + mandatoryDocuments);
    }
    toast(title, variant, message) {
        const toastEvent = new ShowToastEvent({
            title,
            variant: variant,
            message: message
        })
        this.dispatchEvent(toastEvent)
    }
    @track newRowDocumentRecord = {
        'docSetCodeId': '',
        'serialNumber': '',
        'documentName': '',
        'documentFamily': '',
        'documentType': this.currentDocumentType,
        'documentCode': '',
        'mandatory': '',
        'status': 'Not Received',
        'isStatusDisabled': false,
        'stage': '',
        'deferredStageDisable': true,
        'deferredRequired': false,
        'deferredDate': '',
        'receivedDate': '',
        'isReceivedDateRequired': false,
        'receivedDateDisable': true,
        'noOfPages': '',
        'waiverReason': '',
        'isWaiverRequired': false,
        'waiverReasonDisable': true,
        'original': '',
        'isoriginalDisabled': true,
        'remarks': '',
        'isNewRowAdded': false,
        'isDocumentMaster': false,
        'fileName': '',
        'isAgreementExecution': this.isAgreementExecution,
        'documentCondition': '',
        'agreementDocumentType': '',
        'isFileUploadDisabled': true,
        'isFileUploadRequired': false,
        'isDeferalRecord': false,
        'deferalRecordId': '',
        'contentDocumentId': '',
    }
    /**
     *  ====== File Upload Functionality ======
     */
    openfileUpload(event) {
        var rowNo = event.target.getAttribute("data-row-index");
        var sr = Number(rowNo) + Number(1);

        if (this.documentData[rowNo]['documentName'] === '' && this.documentData[rowNo]['isNewRowAdded'] === true) {
            this.toast('Warning', 'Warning', 'Enter Document Name On Serial No ' + sr + '.');
            return;
        } else {
            console.log('this.documentData[rowNo].documentName ', JSON.stringify(this.documentData[rowNo]));
            const file = event.target.files[0]
            var reader = new FileReader()
            reader.onload = () => {
                var base64 = reader.result.split(',')[1]
                this.fileData = {
                    'filename': this.documentData[rowNo].documentName + '.' + file.name.substr(file.name.lastIndexOf('.') + 1),
                    'base64': base64,
                    'recordId': this.applicationId
                }
                this.documentData[rowNo].fileName = this.fileData.filename;
                this.documentData[rowNo].fileData = this.fileData;
                console.log('this.documentRequiredData[rowNo] ', this.documentData[rowNo])
            }
            reader.readAsDataURL(file)
        }
    }
    handleActive(event) {
        this.tabName = event.target.value;
        console.log('this.tabName ### ', this.tabName);
        if (this.tabName === 'View Documents') {
            this.getUploadedRecords();
            this.getAdditionalRecords();
        }
    }


    getUploadedRecords() {
        getUploadedRecords({ parentId: this.applicationId })
            .then(result => {
                console.log('uploaded document :: ', JSON.stringify(result));
                this.uploadedDocData = result;
            })
            .catch(error => {

            })
    }
    getAdditionalRecords() {
        getAdditionalRecords({ parentId: this.applicationId })
            .then(result => {
                console.log('uploaded document :: ', JSON.stringify(result));
                this.addtionalDocuments = result;
            })
            .catch(error => {

            })
    }

    viewDocument(event) {
        var contentDocumentId = event.target.dataset.index;
        console.log('contentDocumentId ### ', contentDocumentId);
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'filePreview'
            },
            state: {
                selectedRecordId: contentDocumentId
            }
        })
    }
    handleAddtionalDocumentChange(event) {
        var name = event.target.name;
        if (name === 'Description') {
            this.addtionalDocData.description = event.target.value;
        }
        if (name === 'Addtional Document') {
            const file = event.target.files[0]
            var reader = new FileReader()
            reader.onload = () => {
                var base64 = reader.result.split(',')[1]
                this.additionalFileData = {
                    'filename': file.name,
                    'base64': base64,
                    'recordId': this.applicationId
                }
                this.addtionalDocData.additionalDocument = this.additionalFileData
                console.log(this.additionalFileData)
            }
            reader.readAsDataURL(file)
        }
    }
    handleSaveAddNewDocument() {
        let isValid = true;
        let inputFields = this.template.querySelectorAll('.validate');
        inputFields.forEach(inputField => {
            if (!inputField.checkValidity()) {
                inputField.reportValidity();
                isValid = false;
            }
        });
        if (!isValid) {
            this.toast('Error', 'Error', 'Complete Required Field.');
        } else {
            this.isSpinnerActive = true;
            console.log('this.addtionalDocData ### ', JSON.stringify(this.addtionalDocData));
            var cvData = this.addtionalDocData.additionalDocument;
            uploadAddtionalDocument({ base64: cvData.base64, filename: cvData.filename, recordId: cvData.recordId, description: this.addtionalDocData.description })
                .then(result => {
                    this.fileData = null
                    this.isAddtionalDocument = false;
                    this.isSpinnerActive = false;
                    this.addtionalDocData = null;
                    this.toast('Success', 'Success', 'Document Uploaded Successfully');
                })
        }
    }




    handleAdditionalCancel() {
        this.isAddtionalDocument = false;
    }
    
}