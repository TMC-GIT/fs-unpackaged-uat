trigger ApplicationTrigger on Application__c (before insert, before update, before delete, after insert, after update, after delete, after undelete) {
	System.debug('Trigger run');
    TriggerDispatcher.enterFromTrigger();
}