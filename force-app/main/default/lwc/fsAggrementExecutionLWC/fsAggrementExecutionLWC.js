import { LightningElement, api, wire, track } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import PROPERTY_OBJECT from '@salesforce/schema/Property__c';
import { getRecord } from 'lightning/uiRecordApi';
import getRecordTypeId from '@salesforce/apex/DatabaseUtililty.getRecordTypeId';
import getLastLoginDate from '@salesforce/apex/DatabaseUtililty.getLastLoginDate';
import generatePublicLink from '@salesforce/apex/DatabaseUtililty.generatePublicLink';
//import getRequiredDocuments from '@salesforce/apex/fsGenericUploadDocumentsController.getRequiredDocuments';
import checkCKYCId from '@salesforce/apex/AgreementExecutionController.checkCKYCId';
import checkDocGenerated from '@salesforce/apex/AgreementExecutionController.checkDocGenerated';
import moveApplicationStage from '@salesforce/apex/AgreementExecutionController.moveApplicationStage';
import checkSendBackVaidation from '@salesforce/apex/AgreementExecutionController.checkSendBackVaidation';
import sendBackLegalApproval from '@salesforce/apex/AgreementExecutionController.sendBackLegalApproval';
import sendBackAprovalCredit from '@salesforce/apex/AgreementExecutionController.sendBackAprovalCredit';
import checkPennyDrop from '@salesforce/apex/AgreementExecutionController.checkPennyDrop';
import checkBankDetailsExist from '@salesforce/apex/AgreementExecutionController.checkBankDetailsExist';
import checkDecision from '@salesforce/apex/AgreementExecutionController.checkDecision';
import generateApplicantAgreementExecutionDocs from '@salesforce/apex/ApplicantDocumentGeneratorController.generateApplicantAgreementExecutionDocs';
import generateAgreementExecutionDocs from '@salesforce/apex/DocumentGenerationVFController.generateAgreementExecutionDocs';
import { updateRecord } from 'lightning/uiRecordApi';
import NAME from '@salesforce/schema/Application__c.Name';
import BusinessDate from '@salesforce/label/c.Business_Date';
import APPLICATION_ID from '@salesforce/schema/Application__c.Id';
import STAGE from '@salesforce/schema/Application__c.Stage__c';
import SUB_STAGE_FIELD from "@salesforce/schema/Application__c.Sub_Stage__c";
import checkDOSCondition from '@salesforce/apex/AgreementExecutionController.checkDOSCondition';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
export default class FsAggrementExecutionLWC extends NavigationMixin(LightningElement) {

    @api recordId;

    @track todaysDate = BusinessDate;
    @track lastLoginDate;
    @track applicationName;
    @track tabName = 'CKYC';
    @track errorMsgs = [];
    @track showErrorTab = false;
    @track isRequired = false;
    @track hasDocVerified = false;
    @track hasCKYCVerified = false;
    @track hasNACHVerified = false;
    @track hasPennyVerified = false;
    @track hasBankDetails = false;
    @track hasDecision = false;
    @track hasDocGeneratedVerified = false;
    @track hasListOfDocVerified = false;
    @track showSpinner = false;
    @track _allPreviousStageDone = false;
    @track showRepaymentSchedule = false;
    @track propRecTypeId;
    @track requiredDocuments = [];
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
        },
        {
            name: 'Generate_Repayment_Schedule',
            label: 'Generate Repayment Schedule',
            variant: 'brand',
            class: 'slds-m-left_x-small'
        }
    ];
    @track openSendBack = false;
    loadAll = false;


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
            console.log(':: data :: ',JSON.stringify(data));
            const rtis = data.recordTypeInfos;
            this.propRecTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'AC Property Detail');
        } else if (error) {
            
        }
    }

    connectedCallback() {
        //this.getPropRecTypeId();
        this.handleGetLastLoginDate();
        this.checkAllCKYCId();
        this.checkAllPennyDrop();
        this.checkAllBankDetail();
        this.checkDecisionApp();
        //  this.checkSendBackVaidation();
        console.log('appId', this.recordId);
    }

    renderedCallback() {
        if (this.loadAll == false) {
            //this.getPropRecTypeId();
            console.log('i am in check validity');
            let currentTab = this.tabName;
            console.log('currentTab= ', currentTab);
            let tabs = this.template.querySelectorAll('lightning-tab');
            console.log('tabs ', tabs);
            tabs.forEach(element => {
                element.loadContent();
            });
            console.log('currentTab= ', currentTab);
            this.tabName = currentTab;
            if (tabs && tabs.length == 7) {
                this.loadAll = true;
            }
        }
    }

    getPropRecTypeId(){
        getRecordTypeId({sObjectName : 'Property__c',recordTypeName : 'AC Property Detail'})
        .then(result =>{
            if(result)
            this.propRecTypeId = result;
        })
        .catch(error=>{
            console.log(error);
        })
    }

    handleActive(event) {
        this.tabName = event.target.value;
        if (this.tabName === 'CKYC') {
            setTimeout(() => {
                this.template.querySelector('c-fs-aggrement-execution-c-k-y-c').getAllApplicant();
            }, 300);
        }
        if (this.tabName === 'Doc_Gen') {
            setTimeout(() => {
                this.template.querySelector('c-fs-aggrement-execution-d-g').getAllApplicant();
            }, 300);
        }
        if (this.tabName === 'DocList') {
            setTimeout(() => {
                this.template.querySelector('c-fs-agreement-execution-list-of-documents').getContentVersionRecords();
            }, 300);
        }
    }

    handleFileUplaod(event) {
        generatePublicLink({ contentVersionId: event.detail[0].contentVersionId, uploadedFrom: 'LegalOpinion' }).then((result) => {
            console.log('handleFileUplaod= ', result);
            this.template.querySelector('c-generic-view-documents').getDocuments();
        }).catch((err) => {
            console.log('Error in handle File upload= ', err);
        });
    }

    checkAppStatus(event) {
        console.log(event.target.value);
        if (event.target.value === 'Cancelled')
            this.isRequired = true;
        else
            this.isRequired = false;
    }

    handleRequiredDocument(event){
        console.log('required doc list :: ',JSON.stringify(event.detail));
        this.requiredDocuments = event.detail;
    }

    requiredDocumentValidation() {
        console.log('requiredDocuments ',JSON.stringify(this.requiredDocuments));
        if (this.requiredDocuments.length > 0) {
            this.requiredDocuments.forEach(element => {
                console.log('element #### ',JSON.stringify(element));
                if(element.documentType === 'Application'){
                    this.errorMsgs.push(' Upload Application Document ' + element.documentName + ' In Document Upload Tab');
                }
                if(element.documentType === 'Applicant'){
                    this.errorMsgs.push(' Upload Document ' + element.documentName + ' For '+ element.customerName + ' In Document Upload Tab');
                }
                if(element.documentType === 'Asset'){
                    this.errorMsgs.push(' Upload Document ' + element.documentName + ' For '+ element.propertyName + ' In Document Upload Tab');
                }
            });
        } 
    }

    handleAgreementExecutionSubmit(event) {
        this.showSpinner = true;
        try{
            this.template.querySelector('c-fs-generic-upload-documents').checkAllRequiredDocument();   
        }catch(error){
            console.log(error)
        }
        setTimeout(() => {
            this.requiredDocumentValidation();
        }, 3000);
        this.showErrorTab = false;
        this.errorMsgs = [];
        this.checkValidations();
        if (this.requiredDocuments.length == 0 && this.hasCKYCVerified  && this.hasPennyVerified && this.hasBankDetails && this.hasDecision /* && this.hasDocVerified && this.hasDocGeneratedVerified */) {
            this.showSpinner = false;
            this.redirectApplication();
        }
        else {
            this.showSpinner = false;
            this.showErrorTab = true;
            setTimeout(() => {
                this.tabName = 'Error';
            }, 300);
        }
    }


    handleDecisionSuccess(event) {
        this.showToast('Success', 'Success', 'Record Saved Successfully!!');
    }

    checkValidations() {
        this.checkAllCKYCId();
        this.checkAllPennyDrop();
        this.checkAllBankDetail();
        this.checkDecisionApp();
    }

    async redirectApplication() {
        console.log('app Id ', this.recordId);
        this.showSpinner = true;
        await checkDOSCondition({recordId : this.recordId}).then(result =>{
            if(result){
                this.showToast('', 'Info', 'DOS is mendatory for this application!!');
            }
            else{
                this.showToast('', 'Info', 'DOS is not mendatory for this application!!');
            }
        })
        .catch(error =>{
            console.log(error);
        })
        moveApplicationStage({ applicationId: this.recordId }).then(result => {
            console.log('res ', result);
            this.showSpinner = false;
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.recordId,
                    actionName: 'view'
                }
            });
        })
            .catch(error => {
                this.showSpinner = false;
                console.log('Error', error);
            })
    }

    showToast(title, variant, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                variant: variant,
                message: message,
            })
        );
    }


    /* ----------------- All the apex method below --------------------- */

    handleGetLastLoginDate() {
        getLastLoginDate().then((result) => {
            console.log('getLastLoginDate= ', result);
            this.lastLoginDate = result
        }).catch((err) => {
            console.log('Error in getLastLoginDate= ', err);
        });
    }

    checkRequiredDocs() {
        console.log('call check required');
    }

    checkAllCKYCId() {
        checkCKYCId({ applicationId: this.recordId })
            .then(result => {
                console.log('ckyccheck result ', result);
                if (result.length > 0) {
                    this.errorMsgs.push('Update CKYC Id Of ' + result.join() + ' In CKYC Tab');
                    this.hasCKYCVerified = false;
                }
                else {
                    this.hasCKYCVerified = true;
                }
            })
            .catch(error => {
                console.log('ckyc get error ', error)
            })
    }

    checkAllPennyDrop(){
        checkPennyDrop({applicationId : this.recordId}).then(result =>{
            console.log('penny check result = ',result);
            if(result.length > 0){
                this.errorMsgs.push(result);
                this.hasPennyVerified = false;
            }
            else{
                this.hasPennyVerified = true;
            }
        })
        .catch(error => {
                console.log('penny get error ', error)
        })
    }

    checkAllBankDetail(){
        checkBankDetailsExist({applicationId : this.recordId}).then(result =>{
            console.log('bank check result = ',result);
            if(result.length > 0){
                this.errorMsgs.push(result);
                this.hasBankDetails = false;
            }
            else{
                this.hasBankDetails = true;
            }
        })
        .catch(error => {
                console.log('hasBankDetails get error ', error)
        })
    }

    checkAlldocumentGenerated() {
        checkDocGenerated({ applicationId: this.recordId })
            .then(result => {
                console.log('checkDocGenerated result ', result);
                if (result) {
                    this.errorMsgs.push('ADD Record For ' + result.join() + ' In Document Generation Tab');
                    this.hasDocGeneratedVerified = false;
                }
                else {
                    this.hasDocGeneratedVerified = true;
                }
            })
            .catch(error => {
                console.log('doc gen get error ', error)
            })
    }

    checkDecisionApp(){
        checkDecision({applicationId : this.recordId}).then(result =>{
            console.log('dcision preset ',result);
            if (!result) {
                this.errorMsgs.push('Decision Pending in Decision Tab');
                this.hasDecision = false;
            }
            else {
                this.hasDecision = true;
            }
        })
        .catch(error => {
                console.log('hasDecision gen get error ', error)
            })
    }

    /*-------------------SendBack Implementation------------------------*/
    rowselectionevent(event) {
        var detail = event.detail;
        if (detail === 'SendBack') {
            this.openSendBack = true;
        }
        if (detail === 'Generate_Repayment_Schedule') {
            this.showRepaymentSchedule = true;
        }
        if(detail === 'Submit'){
            this.handleAgreementExecutionSubmit();
        }
    }

    closeModal(){
        this.showRepaymentSchedule = false;
    }

    handleSendBackClose(event) {
        if (event.detail == true) {
            this.openSendBack = false;
        }
    }

    handleSendBackSubmit(event) {
        let value = event.detail;
        console.log('value' + value);
        if (value != null) {
            if (value == "Approval Credit") {
                sendBackAprovalCredit({ applicationId: this.recordId })
                    .then(result => {
                        console.log('result' + result);
                        this.updateApplication(value);
                    })
                    .catch(error => {
                console.log('Error', error)
            })
            }
            if (value == 'Legal Approval') {
                sendBackLegalApproval({ applicationId: this.recordId })
                    .then(result => {
                        this.updateApplication(value);
                    })
                    .catch(error => {
                console.log('Error', error)
            })
            }

        }
    }
    navigateToApplication() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                actionName: 'view',
            }
        });
    }

    updateApplication(stageValue) {
        const fields = {};
        fields[APPLICATION_ID.fieldApiName] = this.recordId;
        if (stageValue === 'Legal Approval') {
            fields[SUB_STAGE_FIELD.fieldApiName] = stageValue;
        } else {
            if (stageValue === 'Approval Credit') {
                fields[STAGE.fieldApiName] = stageValue;
                console.log('fields' + fields[STAGE.fieldApiName]);
            }
        }
        const recordInput = {
            fields: fields
        };

        console.log('fields To Upddate ',recordInput);
        updateRecord(recordInput)
            .then((record) => {
                this.showToast('Success', 'success', 'Agreement Execution moved to ' + stageValue + ' successfully.');
                this.navigateToApplication();
            })
            .catch(error => {
                this.showToast('Error', 'error', error.body.message);
            });
    }
}