'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var app = angular.module('myApp.services', []).
    value('version', '0.1');

app.service('htmlOutService', function () {

    this.backToCampaign = function () {
      $("#dialog-confirm p").html("<center>Ok to cancel?</center>");
      $("#dialog-confirm").dialog({
		  resizable: false,
          height: 140,
          modal: true,
		  buttons : {
			"OK" : function() {
			  window.location.href = "/#/listCampaigns";
			  $(this).dialog("close");
			},
			"Cancel" : function() {
					$(this).dialog("close");
			}
		  }
    });
	};

    this.deleteCampaign = function (scope, campaign, http) {

        $('#footer').css('display', 'none');
        $(".container-fluid").attr("style", "height:" + $("body").height() + "px").addClass("parentDisable");
        $("#dialog-confirm p").html("Deleting " + campaign.name + ".<br/>Are you sure?");
        $("#dialog-confirm").dialog({
            resizable: false,
            height: 170,
            modal: true,
            buttons: {
                "Delete Campaign": function () {
                    http.get('/api/deleteCampaign/' + campaign._id).
                        success(function (data) {
                            scope.getAllCampaigns();
                        }).
                        error(function () {
                            alert("Unable to delete Campaign");
                        });
                    $(".container-fluid").removeAttr("style").removeClass("parentDisable");
                    $(this).dialog("close");
                    $('#footer').css('display', 'block');
                },
                Cancel: function () {
                    $(".container-fluid").removeAttr("style").removeClass("parentDisable");
                    $(this).dialog("close");
                    $('#footer').css('display', 'block');

                }
            }
        });
        $(".ui-dialog-titlebar-close").click(function () {
            $(".container-fluid").removeAttr("style").removeClass("parentDisable");
        });
    };

    this.addOrEditHoldService = function (scope) {

        if (scope.selectedWorkItems.length === 1) {

            var user = scope.user.userName;

            //Intialize the hold bucket field to work items collection if it doesn't have.
            if (scope.selectedWorkItems[0].holdBucket === undefined) {
                scope.selectedWorkItems[0].holdBucket = [];
            }

            scope.getHoldBucket(user);

            $('#footer').css('display', 'none');
            $(".container-fluid").attr("style", "height:" + $("body").height() + "px").addClass("parentDisable");
            scope.errRemDateMsg = "";
            if (scope.bucketNum >= 0) {
                $("#dialog-confirm").dialog({
                    resizable: false,
                    height: 315,
                    width: 380,
                    modal: true,
                    buttons: {
                        "Edit Hold": function () {
                            //Firefox fix for moment (feeding proper date for firefox & IE)
                            var validReminderDate = moment(validYear(formatDate($("#reminderDateText").val())));
                            var reminderDateText = validReminderDate.format("MM/DD/YYYY");
                            var holdComments = $("#holdComments").val();
                            var todayDate = moment(new Date());
                            if (dateValidateFn(scope,'#reminderDate', 'reminderDate', 0, '#reminderDateText')) {
                                var flag = true;
                            }

                            if(!flag) {
                                alert("Please enter valid Reminder Date");
                            } else if($("#reminderDateText").val()!=""){

                                if (validReminderDate.isBefore(todayDate, 'days')) {
                                    $("#reminderDateText").val("")
                                    var now = new Date();
                                    $('#reminderDate').datepicker('setValue', moment(now).format("MM DD YYYY"));
                                    alert("Reminder date must be a future date");
                                } else {
                                    scope.addOrEditWorkItemsToHold(user, reminderDateText, holdComments, scope.HoldReasonType);
                                    $(".container-fluid").removeAttr("style").removeClass("parentDisable");
                                    $(this).dialog("close");
                                    $(".ui-dialog").remove();
                                    $('#footer').css('display', 'block');
                            }
                            }else{
                                alert("Please enter reminder date!");
                            }
                        },
                        Cancel: function () {
                            //TODO - tried with  "$scope.selectedWorkItems = []" to deselect the selected check box. But didn't work.
                            //TODO - do we have any other way like "$scope.selectedWorkItems.selected = flase"? (to Mikey) -Raja
                            $('.ngSelectionCheckbox').removeAttr('checked', 'checked');
                            scope.selectedWorkItems.length = 0;
                            $(".container-fluid").removeAttr("style").removeClass("parentDisable");
                            $(this).dialog("close");
                            $(".ui-dialog").remove();
                            $('#footer').css('display', 'block');
                        }

                    }
                });
            } else {
                $("#dialog-confirm").dialog({
                    resizable: false,
                    height: 315,
                    width: 400,
                    modal: true,
                    buttons: {
                        "Add Hold": function () {

                            //Firefox fix for moment (feeding proper date for firefox & IE)
                            var validReminderDate = moment(validYear(formatDate($("#reminderDateText").val())));
                            var reminderDateText = validReminderDate.format("MM/DD/YYYY");
                            var holdComments = $("#holdComments").val();
                            var flag = false;
                            var todayDate = moment(new Date());
                            if (dateValidateFn(scope,'#reminderDate', 'reminderDate', 0, '#reminderDateText')) {
                             flag = true;
                            }

                            if(!flag) {
                                alert("Please enter valid Reminder Date");

                            }else if($("#reminderDateText").val()!=""){

                                if (validReminderDate.isBefore(todayDate, 'days')) {
                                    $("#reminderDateText").val("")
                                    var now = new Date();
                                    $('#reminderDate').datepicker('setValue', moment(now).format("MM DD YYYY"));
                                    alert("Reminder date must be a future date");

                                } else if(flag) {
                                     scope.addOrEditWorkItemsToHold(user, reminderDateText, holdComments, scope.HoldReasonType);
                                     $(".container-fluid").removeAttr("style").removeClass("parentDisable");
                                     $(this).dialog("close");
                                     $(".ui-dialog").remove();
                                     $('#footer').css('display', 'block');
                                }

                         }else{
                             alert("Please enter reminder date!");
                         }
                        },
                        Cancel: function () {

                            scope.selectedWorkItems.length = 0;
                            $('.ngSelectionCheckbox').removeAttr('checked', 'checked');
                            $(".container-fluid").removeAttr("style").removeClass("parentDisable");
                            $(this).dialog("close");
                            $(".ui-dialog").remove();
                            $('#footer').css('display', 'block');
                        }
                    }
                });
            }
            $(".ui-dialog-titlebar-close").click(function () {
                $('.ngSelectionCheckbox').removeAttr('checked', 'checked');
                $(".container-fluid").removeAttr("style").removeClass("parentDisable");
                $(".ui-dialog").remove();
            });
        } else {
            alert("Please select one work item");
            scope.selectedWorkItems.length = 0;
        }
        $('.ui-dialog-buttonset button').addClass("btn").addClass("btn-primary");

    }

    this.removeHoldService = function (scope) {

        if (scope.selectedWorkItems.length === 1) {

            var user = scope.user.userName;

            //Intialize the hold bucket field to work items collection if it doesn't have.
            if (scope.selectedWorkItems[0].holdBucket === undefined) {
                scope.selectedWorkItems[0].holdBucket = [
                    { agent: "", comments: "", reminderDate: []}
                ];
            }
            scope.getHoldBucket(user);
            if (scope.bucketNum == -1) {
                $("#dialog-confirm-check").dialog({
                    resizable: false,
                    height: 135,
                    width: 250,
                    modal: true,
                    buttons: {
                        "OK": function () {
                            scope.selectedWorkItems.length = 0;
                            $('.ngSelectionCheckbox').removeAttr('checked', 'checked');
                            $(".container-fluid").removeAttr("style").removeClass("parentDisable");
                            $(this).dialog("close");
                            $('#footer').css('display', 'block');
                        }
                    }
                });
            } else {
                $("#dialog-confirm-remove").dialog({
                    resizable: false,
                    height: 160,
                    width: 300,
                    modal: true,
                    buttons: {
                        "Remove Hold": function () {
                            scope.removeWorkItemHold(user);
                            $('.ngSelectionCheckbox').removeAttr('checked', 'checked');
                            $(".container-fluid").removeAttr("style").removeClass("parentDisable");
                            $(this).dialog("close");
                            $('#footer').css('display', 'block');
                        },
                        Cancel: function () {
                            scope.selectedWorkItems.length = 0;

                            //TODO- if we select an item and cancel it. then "Selected Items: 1" doesn't go away.
                            //TODO - but if we call " $scope.getWorkItemsFromDb();" then it goes away. (to Mikey) -Raja
                            // $scope.getWorkItemsFromDb();
                            $('.ngSelectionCheckbox').removeAttr('checked', 'checked');
                            $(".container-fluid").removeAttr("style").removeClass("parentDisable");
                            $(this).dialog("close");
                            $('#footer').css('display', 'block');
                        }
                    }
                });
            }
            $(".ui-dialog-titlebar-close").click(function () {
                scope.selectedWorkItems.length = 0;
                $('.ngSelectionCheckbox').removeAttr('checked', 'checked');
                $(".container-fluid").removeAttr("style").removeClass("parentDisable");
            });
        } else {
            alert("Please select one work item");
            scope.selectedWorkItems.length = 0;
        }
        $('.ui-dialog-buttonset button').addClass("btn").addClass("btn-primary");
    }

});

app.service('informerService', function () {

    var informs = [];
    this.get = function () {
        return informs;
    };
    this.inform = function (message) {
        alert(message);
    }
    this.close = function (index) {
        informs.splice(index, 1);
    }

})
