import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getCapabiltyData from '@salesforce/apex/fsPcAcController.getCapabiltyData';
export default class PcCapability extends LightningElement {

    @api isSalaried = false;
    @api isRentalMortgage = false;
    @api isRentalOther = false;
    @api isDailyWages = false;
    @api isPension = false;
    @api isAbroadIncome = false;
    @api isOther = false;
    @api isSelfEmployedOrBusiness = false;
    @api isEateriesAndOthers = false;
    @api isDayBasis = false;
    @api isMarginBasis = false;
    @api isDisabled = false;
    @api sectiontitle;
    @api capabilityRecordId;
    @api verificationId;
    @api capabilityRecordTypeId;
    @api applicationId;
    @api relationshipId;
    @api otherConfirmation;
    @api natureofdocumentProof;
    @api proofRemarks;
    @api otherConfirmationsDailyWages;
    @api ownershipProof;
    @api fcEnquiry;
    @api customerList;
    @api appId;

    @track segMentValue;
    @track subSegMentValue;
    @track dayOrMaginValue;
    @track loanApplicantId;
    @track salesPerMonth;
    @track marginInAmount;
    @track grossMonthlyIncome;
    @track capabilitychildSpinner = false;
    @track capabilitypcTableData;
    @track showDeleteModal = false;
    @track capRecordId;
    @track capaccheck;
    @track showAcCapabilityForm = false;
    @track labelSave = 'Save';
    @track isAc = false;
    @track isFIVC = true;
    @track percentageOfIncome; // done
    @track yearOfBusiness; // done
    @track totalExpInBusiness; // done
    @track yearOfServiceWidEmp; // done
    @track totalWorkExp; // done
    @track monthlySalary; // done
    @track yearOfOccupation; // done
    @track incomePerDayVal; // done
    @track numberOfDays; // done
    @track incomePerMonth; // done
    @track numberOfUnits; // done
    @track rentalIncome; // done
    @track employerName; // done
    @track tableTitle ;
    @track rowAction = [
        {
            //label: 'Edit',
            type: 'button-icon',
            fixedWidth: 50,
            typeAttributes: {
                iconName: 'utility:edit',
                title: 'Edit',
                variant: 'border-filled',
                alternativeText: 'Edit',
                name: 'edit'
            }
        },
        {
            //label: 'Delete',
            type: 'button-icon',
            fixedWidth: 50,
            typeAttributes: {
                iconName: 'utility:delete',
                title: 'Delete',
                variant: 'border-filled',
                alternativeText: 'Delete',
                name: 'delete'
            }
        }

    ];

    connectedCallback() {
        console.log('segmentValue>>>>>in child ### ', this.segmentValue);
        console.log('dayOrMaginValue>>>>>in child ### ', this.dayOrMaginValue);
        console.log('subSegMentValue>>>>>in child ### ', this.subSegMentValue);
        console.log('loan applicant id>>>>> ', this.loanApplicantId);
        console.log('loan applicant id>>>>> ', this.verificationId);
        console.log('track loan applicant id>>>>> ', this.laId);
        console.log('Capability Record Type Id', this.capabilityRecordTypeId);
        console.log('Capability relationship Id', this.relationshipId);
        console.log('Capability Id for AC', this.capabilityRecordId);
        this.tableTitle = this.sectiontitle +' - List of Capabilities';
        this.capabilitychildSpinner = true;
        if (this.sectiontitle == 'PC') {
            this.showAcCapabilityForm = true;
            this.isFIVC = false;
        }
        else if (this.sectiontitle == 'AC') {
            this.isAc = true;
            setTimeout(() => {
                this.rowAction.splice(1, 1/*,{
                    //label: 'Edit',
                    type: 'button-icon',
                    fixedWidth: 50,
                    typeAttributes: {
                        iconName: 'utility:edit',
                        title: 'Edit',
                        variant: 'border-filled',
                        alternativeText: 'Edit',
                        name: 'edit'
                    }
                } */)
                //this.rowAction.push()
            }, 200);
            this.isFIVC = false;
        }
        else if(this.sectiontitle == 'FIV-C')
        {
            this.showAcCapabilityForm = true;
        }
        this.getCapabilityTableRecords();
    }

    handleCapabiltySubmit(event) {
        console.log('capability submit called');
        if (this.sectiontitle == 'AC') {
            this.capaccheck = true;
        }

        if (!this.loanApplicantId) {
            event.preventDefault();
            this.showToast('Missing values', 'error', 'You haven\'t selected any customer');
        }
        else {
            this.showTemporaryLoader();
        }

    }
    renderedCallback(){
        console.log('verfid in rendered',this.verificationId);
        
    }




    handleCapabiltySuccess(event) {
        this.showAcCapabilityForm = false;
        console.log('handleCapabilitySubmit called');
        console.log(event.detail.id);
        if (this.labelSave == 'Save') {
            this.showToast('Success', 'success', 'Record Created Successfully');
        }
        if (this.labelSave == 'Update') {
            this.showToast('Success', 'success', 'Record Updated Successfully');
        }
        const changeEvent = new CustomEvent('checkcapabilityvalidation', {
            detail: true
        });
        this.dispatchEvent(changeEvent);
        const inputFields = this.template.querySelectorAll(
            '.capable'
        );
        if (inputFields) {
            inputFields.forEach(field => {
                field.value = "";
            });
        }
        this.handleReset();
        this.makeAllFalse();
         setTimeout(()=>{
            this.capabilityRecordId = undefined;
            this.showAcCapabilityForm = true;
        },200);
        if (this.sectiontitle == 'PC')
            this.labelSave = 'Save'
        if (this.sectiontitle == 'AC')
            this.showAcCharacterForm = false;
       
        this.capabilitychildSpinner = true;
        this.getCapabilityTableRecords();

    }

    // This Method Is Used To Handle Customer Selection
    handleCustomerSelection(evt) {
        console.log('handleCustomer Selection =', evt.target.value)
        this.loanApplicantId = evt.target.value;
    }

    // This Method Is Used To Handle Form Values
    handleFormValue(evt) {
        if (evt.target.fieldName == 'Income_segment__c') {
            this.isSalaried = false;
            this.isDailyWages = false;
            this.isPension = false;
            this.isAbroadIncome = false;
            this.isOther = false;
            this.isSelfEmployedOrBusiness = false;
            this.isEateriesAndOthers = false;
            this.isDayBasis = false;
            this.isMarginBasis = false;
            let dayMarginBasis = this.template.querySelector('[data-id="Day_Margin_Basis__c"]');
            if (dayMarginBasis) {
                dayMarginBasis.value = '';
            }
            if (evt.target.value == 'Salaried') {
                this.isSalaried = true;
            } else if (evt.target.value == 'Pension') {
                this.isPension = true;
            } else if (evt.target.value == 'Daily wages') {
                this.isDailyWages = true;
            } else if (evt.target.value == 'Income from Abroad') {
                this.isAbroadIncome = true;
            } else if (evt.target.value == 'Eateries' || evt.target.value == 'Food business' ||
                evt.target.value == 'Manufacturing' || evt.target.value == 'Shop owner' ||
                evt.target.value == 'Milk business' || evt.target.value == 'General shops' ||
                evt.target.value == 'Vegetables/Fruits/Flower/Vendor'
            ) {
                this.isEateriesAndOthers = true;
            } else if (evt.target.value == 'Self Employed') {
                this.isSelfEmployedOrBusiness = true;
            } else if (evt.target.value == 'Housewife' || evt.target.value == 'Retired' ||
                evt.target.value == 'Unemployed' || evt.target.value == 'Others') {
                this.isOther = true;
            }
        } else if (evt.target.fieldName == 'Subsegment__c') {
            this.isRentalMortgage = false;
            this.isRentalOther = false;
            if (evt.target.value == 'Commercial - mortgage proeprty' || evt.target.value == 'Residential - Mortgage property') {
                this.isRentalMortgage = true;
            } else if (evt.target.value == 'Commercial - Other property' || evt.target.value == 'Residential - Other proeprty') {
                this.isRentalOther = true;
            }
        } else if (evt.target.fieldName == 'Day_Margin_Basis__c') {
            if (evt.target.value == 'Day Basis') {
                this.isDayBasis = true;
                this.isMarginBasis = false;
            } else if (evt.target.value == 'Margin Basis') {
                this.isMarginBasis = true;
                this.isDayBasis = false;
            }
        }
        else if (evt.target.name == 'of_income_transacted_through_bank_acco__c') {
            this.percentageOfIncome = evt.target.value;
        } else if (evt.target.name == 'Monthly_Salary__c') {
            this.monthlySalary = evt.target.value;
        } else if (evt.target.name == 'Year_of_Business__c') {
            this.yearOfBusiness = evt.target.value;
        } else if (evt.target.name == 'Total_experience_in_this_business_yrs__c') {
            this.totalExpInBusiness = evt.target.value;
        } else if (evt.target.name == 'Year_of_Service_With_Employer__c') {
            this.yearOfServiceWidEmp = evt.target.value;
        } else if (evt.target.name == 'Total_Work_Experience__c') {
            this.totalWorkExp = evt.target.value;
        } else if (evt.target.name == 'Year_of_Occupation__c') {
            this.yearOfOccupation = evt.target.value;
        } else if (evt.target.name == 'Income_per_month__c') {
            this.incomePerMonth = evt.target.value;
        } else if (evt.target.name == 'No_of_Units__c') {
            this.numberOfUnits = evt.target.value;
        } else if (evt.target.name == 'Rental_Income__c') {
            this.rentalIncome = evt.target.value;
        } else if (evt.target.name == 'Name_of_the_Employer__c') {
            this.employerName = evt.target.value;
        }
    }


    // This Method Is Used To Handle All Calculations
    handleCalculations(evt) {
        console.log('name ##',evt.target.name);
        console.log('value ##',evt.target.value);
        let incomeSegment = this.template.querySelector('[data-id="Income_segment__c"]').value;
        this.grossMonthlyIncome = undefined;
        this.salesPerMonth = undefined;
        this.marginInAmount = undefined;
        if (incomeSegment == 'Daily wages') {
            this.incomePerDayVal = (evt.target.name == 'Income_per_day__c') ? (evt.target.value ? evt.target.value : 0) : this.incomePerDayVal;
            this.numberOfDays = (evt.target.name == 'Number_of_days__c') ? (evt.target.value ? evt.target.value : 0) : this.numberOfDays;
            this.incomePerDayVal = parseFloat(this.incomePerDayVal);
            this.numberOfDays = parseFloat(this.numberOfDays);
            this.grossMonthlyIncome = this.incomePerDayVal * this.numberOfDays;
        } else if (incomeSegment == 'Eateries' || incomeSegment == 'Food business' ||
            incomeSegment == 'Manufacturing' || incomeSegment == 'Shop owner' ||
            incomeSegment == 'Milk business' || incomeSegment == 'General shops' ||
            incomeSegment == 'Vegetables/Fruits/Flower/Vendor' || incomeSegment == 'Self Employed') {
            let dayMarginBasis = this.template.querySelector('[data-id="Day_Margin_Basis__c"]').value;
            if (dayMarginBasis == 'Day Basis') {
                this.incomePerDayVal = (evt.target.name == 'Income_per_day__c') ? (evt.target.value ? evt.target.value : 0) : this.incomePerDayVal;
                this.numberOfDays = (evt.target.name == 'Number_of_days__c') ? (evt.target.value ? evt.target.value : 0) : this.numberOfDays;
                this.incomePerDayVal = parseFloat(this.incomePerDayVal);
                this.numberOfDays = parseFloat(this.numberOfDays);
                this.grossMonthlyIncome = this.incomePerDayVal * this.numberOfDays;
            } else if (dayMarginBasis == 'Margin Basis') {
                console.log('inside margin');
                let salesPerDay = this.template.querySelector('[data-id="Sales_per_day__c"]').value !== undefined ? this.template.querySelector('[data-id="Sales_per_day__c"]').value : 0;
                this.numberOfDays = (evt.target.name == 'Number_of_days__c') ? (evt.target.value ? evt.target.value : 0) : this.numberOfDays; let margin = this.template.querySelector('[data-id="Margin__c"]').value !== undefined ? this.template.querySelector('[data-id="Margin__c"]').value : 0;
                let electricity = this.template.querySelector('[data-id="Electricity__c"]').value !== undefined ? this.template.querySelector('[data-id="Electricity__c"]').value : 0;
                let salary = this.template.querySelector('[data-id="Salary__c"]').value !== undefined ? this.template.querySelector('[data-id="Salary__c"]').value : 0;
                let rent = this.template.querySelector('[data-id="Rent__c"]').value !== undefined ? this.template.querySelector('[data-id="Rent__c"]').value : 0;
                let others = this.template.querySelector('[data-id="Others__c"]').value !== undefined ? this.template.querySelector('[data-id="Others__c"]').value : 0;
                salesPerDay = parseFloat(salesPerDay);
                this.numberOfDays = parseFloat(this.numberOfDays);
                electricity = parseFloat(electricity);
                salary = parseFloat(salary);
                rent = parseFloat(rent);
                others = parseFloat(others);

                this.salesPerMonth = salesPerDay * this.numberOfDays;
                console.log('salespermonth ###',this.salesPerMonth)
                this.marginInAmount = this.salesPerMonth / 100 * margin;
                this.grossMonthlyIncome = (this.marginInAmount - (electricity + salary + rent + others));
            }
        }
    }

    handleReset(event) {
        if (this.sectiontitle == 'AC') {
            this.showAcCapabilityForm = false;
            const refreshEvent = new CustomEvent("refreshcapability", { detail: true });
            this.dispatchEvent(refreshEvent);
            this.capabilitypcTableData = undefined;
        }
        if (this.sectiontitle == 'PC') {
            this.capabilityRecordId = undefined;
            this.loanApplicantId = undefined;
            this.segMentValue = undefined;
            this.subSegMentValue = undefined;
            this.dayOrMaginValue = undefined;
            this.percentageOfIncome = undefined;
            this.monthlySalary = undefined;
            this.yearOfBusiness = undefined;
            this.totalExpInBusiness = undefined;
            this.yearOfServiceWidEmp = undefined;
            this.totalWorkExp = undefined;
            this.yearOfOccupation = undefined;
            this.incomePerDayVal = undefined;
            this.numberOfDays = undefined;
            this.incomePerMonth = undefined;
            this.numberOfUnits = undefined;
            this.rentalIncome = undefined;
            this.makeAllFalse();
            this.labelSave = 'Save';
        }
        this.resetLogic();
    }


    handleSelectedCapabilityMember(event) {
        var data = event.detail;
        console.log('CAP DATA ###',data);
        this.capRecordId = data.recordData.Id;
        if (data && data.ActionName == 'delete') {
            console.log('char id', data.recordData.Id);
            this.showDeleteModal = true;
        }
        if (data && data.ActionName == 'edit') {
            this.labelSave = 'Update';
            this.capabilityRecordId = this.capRecordId;
            this.loanApplicantId = data.recordData.Loan_Applicant__c;
            this.showAcCapabilityForm = true;
            this.percentageOfIncome = data.recordData.of_income_transacted_through_bank_acco__c;
            this.monthlySalary = data.recordData.Monthly_Salary__c;
            this.yearOfBusiness = data.recordData.Year_of_Business__c;
            this.totalExpInBusiness = data.recordData.Total_experience_in_this_business_yrs__c;
            this.yearOfServiceWidEmp = data.recordData.Year_of_Service_With_Employer__c;
            this.totalWorkExp = data.recordData.Total_Work_Experience__c;
            this.yearOfOccupation = data.recordData.Year_of_Occupation__c;
            this.incomePerDayVal = data.recordData.Income_per_day__c;
            this.numberOfDays = data.recordData.Number_of_days__c;
            this.incomePerMonth = data.recordData.Income_per_month__c;
            this.numberOfUnits = data.recordData.No_of_Units__c;
            this.rentalIncome = data.recordData.Rental_Income__c;
            this.employerName = data.recordData.Name_of_the_Employer__c;
            console.log('char id', data.recordData.Id);
            this.makeAllFalse();

            if (data.recordData.Income_segment__c == 'Salaried') {
                this.isSalaried = true;
            } else if (data.recordData.Income_segment__c == 'Pension') {
                this.isPension = true;
            } else if (data.recordData.Income_segment__c == 'Daily wages') {
                this.isDailyWages = true;
            } else if (data.recordData.Income_segment__c == 'Income from Abroad') {
                this.isAbroadIncome = true;
            } else if (data.recordData.Income_segment__c == 'Eateries' || data.recordData.Income_segment__c == 'Food business' ||
                data.recordData.Income_segment__c == 'Manufacturing' || data.recordData.Income_segment__c == 'Shop owner' ||
                data.recordData.Income_segment__c == 'Milk business' || data.recordData.Income_segment__c == 'General shops' ||
                data.recordData.Income_segment__c == 'Vegetables/Fruits/Flower/Vendor'
            ) {
                this.isEateriesAndOthers = true;
            } else if (data.recordData.Income_segment__c == 'Self Employed') {
                this.isSelfEmployedOrBusiness = true;
            } else if (data.recordData.Income_segment__c == 'Housewife' || data.recordData.Income_segment__c == 'Retired' ||
                data.recordData.Income_segment__c == 'Unemployed' || data.recordData.Income_segment__c == 'Others') {
                this.isOther = true;
            }
            if (data.recordData.Subsegment__c == 'Commercial - mortgage proeprty' || data.recordData.Subsegment__c == 'Residential - Mortgage property') {
                this.isRentalMortgage = true;
            } else if (data.recordData.Subsegment__c == 'Commercial - Other property' || data.recordData.Subsegment__c == 'Residential - Other proeprty') {
                this.isRentalOther = true;
            }
            if (data.recordData.Day_Margin_Basis__c == 'Day Basis') {
                this.isDayBasis = true;
            } else if (data.recordData.Day_Margin_Basis__c == 'Margin Basis') {
                this.isMarginBasis = true;
            }

        }
    }


    // This Method Is Used To Make All Falgs False.
    makeAllFalse() {
        this.isSalaried = false;
        this.isRentalMortgage = false;
        this.isRentalOther = false;
        this.isDailyWages = false;
        this.isPension = false;
        this.isAbroadIncome = false;
        this.isOther = false;
        this.isSelfEmployedOrBusiness = false;
        this.isEateriesAndOthers = false;
        this.isMarginBasis = false;
        this.isDayBasis = false;
    }

    handlemodalactions(event) {
        this.showDeleteModal = false;
        console.log('event.detail>>>>> ', event.detail);
        if (event.detail === true) {
            this.capabilitychildSpinner = true;
            this.getCapabilityTableRecords();
        }
    }

    // to reset the form fields;
    resetLogic() {
        const inputFields = this.template.querySelectorAll('.capable');
        if (inputFields) {
            inputFields.forEach(field => {
                field.value = "";
            });
        }
    }

    // to get the Capability Table Records for PC/AC -----
    getCapabilityTableRecords() {
        console.log('loan applicant data in pc capanbility>>>> ', this.loanApplicantId);
        let vefType, capType;
        if (this.sectiontitle == 'PC') {
            vefType = 'PC';
            capType = 'PC Capability';
        }
        else if (this.sectiontitle == 'AC') {
            vefType = 'AC';
            capType = 'AC Capability';

        }
        console.log('vef type', vefType, 'capType', capType);
        this.capabilitypcTableData = undefined;
        getCapabiltyData({ appId: this.appId, loanAppId: this.loanApplicantId, recTypeName: vefType, metadataName: 'PC_Capabilty_Table', caprecordTypeName: capType }).then((result) => {
            console.log('getCapabilityTableRecords in pc= ', result);
            this.capabilitypcTableData = result;
            console.log('cap data', JSON.parse(JSON.stringify(result)));
            const changeEvent = new CustomEvent('checkcapabilityvalidation', {
                detail: true
            });
            this.dispatchEvent(changeEvent);
            this.capabilitychildSpinner = false;
        }).catch((err) => {
            this.capabilitypcTableData = undefined;
            console.log('getCapabilityTableRecords in pc Error= ', err);
            this.capabilitychildSpinner = false;
        });
    }

    // show toast Method
    showToast(title, variant, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                variant: variant,
                message: message,
            })
        );
    }

    // This Method Is Used To Show Loader For Short Time
    showTemporaryLoader() {
        this.capabilitychildSpinner = true;
        let ref = this;
        setTimeout(function () {
            ref.capabilitychildSpinner = false;
        }, 500);
    }



}