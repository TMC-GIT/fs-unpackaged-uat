export function setDeferralPicklistValue(stageName) {
    var deferalPicklistOption = [];
    if (stageName === 'Login') {
        var option = [
            { label: 'FIV - B', value: 'FIV - B' },
            { label: 'FIV - C', value: 'FIV - C' },
            { label: 'Online EC', value: 'Online EC' },
            { label: 'Lead Detail', value: 'Lead Detail' },
            { label: 'In Principle Sanction', value: 'In Principle Sanction' },
            { label: 'Process Credit', value: 'Process Credit' },
            { label: 'Approval Credit', value: 'Approval Credit' },
            { label: 'Final Sanction', value: 'Final Sanction' },
            { label: 'Post Approval', value: 'Post Approval' },
            { label: 'MOD Registration', value: 'MOD Registration' },
            { label: 'Agreement Execution', value: 'Agreement Execution' },
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'FIV - B') {
        var option = [
            { label: 'FIV - C', value: 'FIV - C' },
            { label: 'Online EC', value: 'Online EC' },
            { label: 'Lead Detail', value: 'Lead Detail' },
            { label: 'In Principle Sanction', value: 'In Principle Sanction' },
            { label: 'Process Credit', value: 'Process Credit' },
            { label: 'Approval Credit', value: 'Approval Credit' },
            { label: 'Final Sanction', value: 'Final Sanction' },
            { label: 'Post Approval', value: 'Post Approval' },
            { label: 'MOD Registration', value: 'MOD Registration' },
            { label: 'Agreement Execution', value: 'Agreement Execution' },
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'FIV - C') {
        var option = [
            { label: 'Online EC', value: 'Online EC' },
            { label: 'Lead Detail', value: 'Lead Detail' },
            { label: 'In Principle Sanction', value: 'In Principle Sanction' },
            { label: 'Process Credit', value: 'Process Credit' },
            { label: 'Approval Credit', value: 'Approval Credit' },
            { label: 'Final Sanction', value: 'Final Sanction' },
            { label: 'Post Approval', value: 'Post Approval' },
            { label: 'MOD Registration', value: 'MOD Registration' },
            { label: 'Agreement Execution', value: 'Agreement Execution' },
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'Online EC') {
        var option = [
            { label: 'Lead Detail', value: 'Lead Detail' },
            { label: 'In Principle Sanction', value: 'In Principle Sanction' },
            { label: 'Process Credit', value: 'Process Credit' },
            { label: 'Approval Credit', value: 'Approval Credit' },
            { label: 'Final Sanction', value: 'Final Sanction' },
            { label: 'Post Approval', value: 'Post Approval' },
            { label: 'MOD Registration', value: 'MOD Registration' },
            { label: 'Agreement Execution', value: 'Agreement Execution' },
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'In Principle Sanction') {
        var option = [
            { label: 'Lead Detail', value: 'Lead Detail' },
            { label: 'Process Credit', value: 'Process Credit' },
            { label: 'Approval Credit', value: 'Approval Credit' },
            { label: 'Final Sanction', value: 'Final Sanction' },
            { label: 'Post Approval', value: 'Post Approval' },
            { label: 'MOD Registration', value: 'MOD Registration' },
            { label: 'Agreement Execution', value: 'Agreement Execution' },
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'Lead Detail') {
        var option = [
            { label: 'Process Credit', value: 'Process Credit' },
            { label: 'Approval Credit', value: 'Approval Credit' },
            { label: 'Final Sanction', value: 'Final Sanction' },
            { label: 'Post Approval', value: 'Post Approval' },
            { label: 'MOD Registration', value: 'MOD Registration' },
            { label: 'Agreement Execution', value: 'Agreement Execution' },
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }

    if (stageName === 'Legal Opinion') {
        var option = [
            { label: 'Legal Approval', value: 'Legal Approval' },
            { label: 'Process Credit', value: 'Process Credit' },
            { label: 'Approval Credit', value: 'Approval Credit' },
            { label: 'Final Sanction', value: 'Final Sanction' },
            { label: 'Post Approval', value: 'Post Approval' },
            { label: 'MOD Registration', value: 'MOD Registration' },
            { label: 'Agreement Execution', value: 'Agreement Execution' },
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'Legal Approval') {
        var option = [
            { label: 'Process Credit', value: 'Process Credit' },
            { label: 'Approval Credit', value: 'Approval Credit' },
            { label: 'Final Sanction', value: 'Final Sanction' },
            { label: 'Post Approval', value: 'Post Approval' },
            { label: 'MOD Registration', value: 'MOD Registration' },
            { label: 'Agreement Execution', value: 'Agreement Execution' },
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'Process Credit') {
        var option = [
            { label: 'Approval Credit', value: 'Approval Credit' },
            { label: 'Final Sanction', value: 'Final Sanction' },
            { label: 'Post Approval', value: 'Post Approval' },
            { label: 'MOD Registration', value: 'MOD Registration' },
            { label: 'Agreement Execution', value: 'Agreement Execution' },
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'Approval Credit') {
        var option = [
            { label: 'Final Sanction', value: 'Final Sanction' },
            { label: 'Post Approval', value: 'Post Approval' },
            { label: 'MOD Registration', value: 'MOD Registration' },
            { label: 'Agreement Execution', value: 'Agreement Execution' },
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'Final Sanction') {
        var option = [
            { label: 'Post Approval', value: 'Post Approval' },
            { label: 'MOD Registration', value: 'MOD Registration' },
            { label: 'Agreement Execution', value: 'Agreement Execution' },
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'Post Approval') {
        var option = [
            { label: 'MOD Registration', value: 'MOD Registration' },
            { label: 'Agreement Execution', value: 'Agreement Execution' },
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'MOD Registration') {
        var option = [
            { label: 'Agreement Execution', value: 'Agreement Execution' },
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'Agreement Execution') {
        var option = [
            { label: 'Dispatch Pending', value: 'Dispatch Pending' },
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'Dispatch Pending') {
        var option = [
            { label: 'Document Receipt', value: 'Document Receipt' },
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'Document Receipt') {
        var option = [
            { label: 'Disbursal Maker', value: 'Disbursal Maker' },
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'Disbursal Maker') {
        var option = [
            { label: 'Disbursal Author', value: 'Disbursal Author' },
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    if (stageName === 'Disbursal Author') {
        var option = [
            { label: 'Document Deferral', value: 'Document Deferral' },
        ]
        deferalPicklistOption = option;
    }
    return deferalPicklistOption;
}