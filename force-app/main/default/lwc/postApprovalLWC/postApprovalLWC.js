import { LightningElement, api, wire, track } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';
import postApprovalData from '@salesforce/apex/PostApprovalController.postApprovalData';
import getLastLoginDate from '@salesforce/apex/DatabaseUtililty.getLastLoginDate';
import generateFinalSanctionLetter from '@salesforce/apex/PostApprovalController.generateFinalSanctionLetter';
import checkFinalSanctionLetter from '@salesforce/apex/PostApprovalController.checkFinalSanctionLetter';
import sendBackAprovalCredit from '@salesforce/apex/PostApprovalController.sendBackAprovalCredit';
//import getRequiredDocuments from '@salesforce/apex/fsGenericUploadDocumentsController.getRequiredDocuments';
import BusinessDate from '@salesforce/label/c.Business_Date';
import NAME from '@salesforce/schema/Application__c.Name';
import { updateRecord } from 'lightning/uiRecordApi';
import APPLICATION_ID from '@salesforce/schema/Application__c.Id';
import STAGE from '@salesforce/schema/Application__c.Stage__c';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import PROPERTY_OBJECT from '@salesforce/schema/Property__c';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';

export default class PostApprovalLWC extends NavigationMixin(LightningElement) {

    @api recordId;
    @track postApp = [];
    @track todaysDate1 = BusinessDate;
    @track lastLoginDate;
    @track applicationName;
    @track tabName = 'Upload_Document';
    @track applicationIds = [];
    @track showErrorTab = false;
    @track isSpinner = false;
    @track modId;
    @track errorMsgs;
    @track validationObj = {
        fileUpload: false,
        isLetterGenerated: false
    };
    @track button = [
        {
            name: 'Submit',
            label: 'Submit',
            variant: 'brand',
            class: 'slds-m-left_x-small'
        },
        {
            name: 'SendBack',
            label: 'Send Back',
            variant: 'brand',
            class: 'slds-m-left_x-small'
        }

    ];
    @track openSendBack = false;
    @track requiredDocuments;
    @track recordTypeName;

    @wire(getRecord, { recordId: '$recordId', fields: [NAME] })
    applicationDetails({ error, data }) {
        console.log('applicationDetails= ', data);
        if (data) {
            this.applicationName = data.fields.Name.value;
        } else if (error) {
            console.log('error in getting applicationDetails = ', error);
        }
    }

    @wire(getObjectInfo, { objectApiName: PROPERTY_OBJECT })
    getRecordType({ data, error }) {
        if (data) {
            console.log(':: data :: ', JSON.parse(JSON.stringify(data)));
            const rtis = data.recordTypeInfos;
            this.recordTypeName = Object.keys(rtis).find(rti => rtis[rti].name === 'AC Property Detail');
        } else if (error) {

        }
    }

    @wire(postApprovalData, { applicationId: '$recordId' })
    wiredPostApp({ error, data }) {
        if (data) {
            this.postApp = data;
            console.log('Data###', data);
        }
        else if (error) {
            console.log('ERRRRRRRRRRRR  ', error);
            this.error = error;
            this.postApp = undefined;
        }
    }

    connectedCallback() {
        console.log('Loaded')
        this.handleGetLastLoginDate();
        this.handlecheckFinalSanctionLetter();
        //    this.handleGetRequiredDocuments();
    }

    // handleGetRequiredDocuments() {
    //     this.validationObj.fileUpload = false;
    //     getRequiredDocuments({ stage: 'Post Approval', parentId: this.recordId }).then((result) => {
    //         console.log('GetRequiredDocuments= ', result);
    //         if (!result.length) {
    //             this.validationObj.fileUpload = true;
    //         }
    //     }).catch((err) => {
    //         console.log('Error in getRequiredDocuments= ', err);
    //     });
    // }

    /*-------------------------------SendBAck Implementation---------------------------------*/
    rowselectionevent(event) {
        var detail = event.detail;
        if (detail === 'SendBack') {
            this.openSendBack = true;
        }
        if(detail === 'Submit'){
            this.handleSubmitMOD();
        }
    }

    handleSendBackClose(event) {
        if (event.detail == true) {
            this.openSendBack = false;
        }
    }

    handleSendBackSubmit(event) {
        let value = event.detail;
        if (value != null) {
            sendBackAprovalCredit({ applicationId: this.recordId })
                .then(result => {
                    const fields = {};
                    fields[APPLICATION_ID.fieldApiName] = this.recordId;
                    fields[STAGE.fieldApiName] = 'Approval Credit';
                    const recordInput = { fields };
                    updateRecord(recordInput)
                        .then(() => {
                            this.toastMessage('', 'Application has been sent back to Approval Credit stage.', 'success');
                            this[NavigationMixin.Navigate]({
                                type: 'standard__recordPage',
                                attributes: {
                                    recordId: this.recordId,
                                    actionName: 'view'
                                }
                            });
                        })
                        .catch(error => {
                            console.log('Error in send back.', error);
                        });
                })
        }
    }

    /*--------------------------------------------------------------------------------------------------*/

    handleActive(event) {
        this.tabName = event.target.value;
    }

    handleGetLastLoginDate() {
        getLastLoginDate().then((result) => {
            console.log('getLastLoginDate= ', result);
            this.lastLoginDate = result
        }).catch((err) => {
            console.log('Error in getLastLoginDate= ', err);
        });
    }

    handleRequiredDocument(event) {
        console.log('required doc list :: ', JSON.stringify(event.detail));
        this.requiredDocuments = event.detail;
        this.isSpinner = false;
        this.handleMODSubmit()
    }

    requiredDocumentValidation() {
        console.log('requiredDocuments ',JSON.stringify(this.requiredDocuments));
        if (this.requiredDocuments.length > 0) {
            this.requiredDocuments.forEach(element => {
                console.log('element #### ',JSON.stringify(element));
                if(element.documentType === 'Application'){
                    this.errorMsgs.push('Upload Application Document ' + element.documentName + ' In Document Upload Tab');
                }
                if(element.documentType === 'Applicant'){
                    this.errorMsgs.push('Upload Document ' + element.documentName + ' For '+ element.customerName + ' In Document Upload Tab');
                }
                if(element.documentType === 'Asset'){
                    this.errorMsgs.push('Upload Document ' + element.documentName + ' For '+ element.propertyName + ' In Document Upload Tab');
                }
            });
        } 
    }

    handleSubmitMOD(){
        this.isSpinner = true;
        this.template.querySelector('c-fs-generic-upload-documents').checkAllRequiredDocument();   
        // setTimeout(() => {
        //     this.isSpinner = false;
        //     this.handleMODSubmit();
        // }, 3000);
    }

    handleMODSubmit() {
        this.errorMsgs = [];
        this.requiredDocumentValidation();
        console.log('this.errorMsgs. #### ', JSON.stringify(this.errorMsgs));
        // if (!this.validationObj.fileUpload) {
        //     this.errorMsgs.push('Please upload MOD Scanned Copy')
        // }
        if (!this.validationObj.isLetterGenerated) {
            this.errorMsgs.push('Please generate Loan Sanction Letter.');
        }
        if (this.errorMsgs && this.errorMsgs.length) {
            this.showErrorTab = true;
            let ref = this;
            setTimeout(() => {
                ref.tabName = 'Error';
            }, 300);
        } else {
            this.showErrorTab = false;
            const fields = {};
            fields[APPLICATION_ID.fieldApiName] = this.recordId;
            fields[STAGE.fieldApiName] = 'MOD Registration';
            const recordInput = { fields };
            updateRecord(recordInput).then(() => {
                console.log('Stage Updated= ');
            //    this.toastMessage('', 'Post Approval stage is completed successfully!', 'success');
                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: this.recordId,
                        objectApiName: 'Application__c',
                        actionName: 'view'
                    }
                });
            }).catch(error => {
                console.log('Error in Stage Updation= ', error);
            });
        }

    }
    handleLoanSanction() {
        this.validationObj.isLetterGenerated = true;
        generateFinalSanctionLetter({ applicationId: this.recordId })
            .then(result => {
                this.validationObj.isLetterGenerated = true;
                this.showNotifications('', 'Loan Sanction Letter Generated Successfully.', 'success');
            })
            .catch(error => {
                console.log('err' + error);
            })
        this[NavigationMixin.GenerateUrl]({
            type: 'standard__webPage',
            attributes: {
                url: '/apex/LoanSanctionLetterVf?id=' + this.recordId
            }
        }).then(generatedUrl => {
            window.open(generatedUrl);
        });

    }

    toastMessage(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }

    handlecheckFinalSanctionLetter() {
        checkFinalSanctionLetter({ aaplicationId: this.recordId })
            .then((result) => {
                console.log('checkFinalSanctionLetter= ', result);
                this.validationObj.isLetterGenerated = result;
            }).catch((err) => {
                console.log('Error in checkFinalSanctionLetter= ', err);
            });
    }
}