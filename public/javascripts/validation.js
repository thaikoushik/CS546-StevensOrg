$(document).ready(function () {
    var dtToday = new Date();

    var month = dtToday.getMonth() + 1;
    var day = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
        month = '0' + month.toString();
    if (day < 10)
        day = '0' + day.toString();

    var maxDate = year + '-' + month + '-' + day;

    $('#eventDate').attr('min', maxDate);

    $('#list').click(function (event) {
        event.preventDefault();
        $('#products .item').addClass('list-group-item');
    });
    $('#grid').click(function (event) {
        event.preventDefault();
        $('#products .item').removeClass('list-group-item');
        $('#products .item').addClass('grid-group-item');
    });
});


function registerEvent(id) {
    var eventId = id;
    $.ajax({
        type: "POST",
        url: '/event/registerEvent/' + eventId,
        beforeSend: function () {
            $('#registerForEvent').html("<img src='/images/loading.gif' />");
        },
        success: function (data) {
            $('#registerForEvent').val("Registered");
            $('#registerForEvent').attr("disabled", "disabled");
        }
    });
}

function displayDeptWiseEvent(dept) {
    var eventDept = dept;
    $.get('/user/private/' + eventDept, (response) => {
        $("body").html(response);
    });
}

function registerEventAfterPay(id) {
    Stripe.setPublishableKey('pk_test_hHcSvZ8t13NmFM6u3KcTgptk');
    var $form = $('#payment-form');
    $('#charge-error').addClass('hidden');
    $form.find('button').prop('disabled', true);
    Stripe.card.createToken({
        number: $('#card-number').val(),
        cvc: $('#card-cvc').val(),
        exp_month: $('#card-expiry-month').val(),
        exp_year: $('#card-expiry-year').val(),
        name: $('#card-name').val()
    }, stripeResponseHandler);
    return false;

    function stripeResponseHandler(status, response) {
        if (response.error) {

            $('#charge-error').text(response.error.message);
            $('#charge-error').removeClass('hidden');
            $form.find('button').prop('disabled', false);

        } else {
            var token = response.id;
            var data = {
                stripeToken: token
            };
            var eventId = id;
            $.post('/event/registerPayableEvent/' + eventId, data, (response) => {
                window.location.reload(true);
            });
        }
    }
}

function getRegisteredUsers(id) {
    window.open('/event/getRegisteredUsers/' + id);
}