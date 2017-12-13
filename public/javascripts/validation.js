$(document).ready(function() {
    var dtToday = new Date();

    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
        month = '0' + month.toString();
    if (day < 10)
        day = '0' + day.toString();

    var maxDate = year + '-' + month + '-' + day;
    // alert(maxDate);
    $('#eventDate').attr('min', maxDate);
    
});

function registerEvent(id){
    console.log(id);
    var eventId = id;
    $.ajax({
        type: "POST",
        url: '/event/registerEvent/'+eventId,
        beforeSend: function() {
            $('#registerEvent').html("<img src='/images/loading.gif' />");
        },
        success: function(data){
            $('#registerEvent').val("Registered");
            $('#registerEvent').attr("disabled", "disabled");
        }
    });
}
