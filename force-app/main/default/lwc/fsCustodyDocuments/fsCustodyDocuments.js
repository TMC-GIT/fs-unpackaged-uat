import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
//import getUploadedRecords from '@salesforce/apex/fsGenericUploadDocumentsController.getUploadedRecords';
import getAdditionalRecords from '@salesforce/apex/FsCustodyController.getAdditionalRecords';
import getUploadedRecords from '@salesforce/apex/FsCustodyController.getContentVersionRecordsNew';
export default class FsCustodyDocuments extends NavigationMixin(LightningElement) {
    @api applicationId;
    @track uploadedDocData;
    @track addtionalDocuments;

    connectedCallback() {
        console.log('application Id', this.applicationId);
        this.getUploadedRecords();
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
        getUploadedRecords({ parentId: this.applicationId})
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
                console.log('  Additional  uploaded document :: ', JSON.stringify(result));
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
}