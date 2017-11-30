$(document).ready(function() {
    $('#contactForm').formValidation({
        framework: 'bootstrap',
        err: {
            container: function($field, validator) {
                // Look at the markup
                //  <div class="col-xs-4">
                //      <field>
                //  </div>
                //  <div class="col-xs-5 messageContainer"></div>
                return $field.parent().next('.messageContainer');
            }
        },
        icon: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            email: {
                validators: {
                    notEmpty: {
                        message: 'The Email address is required and cannot be empty'
                    },
                    emailAddress: {
                        message: 'The email address is not valid'
                    }
                }
            },
            password: {
                validators: {
                    notEmpty: {
                        message: 'The Password is required and cannot be empty'
                    }
                }
            },
            firstName: {
                validators: {
                    notEmpty: {
                        message: 'The First name is required and cannot be empty'
                    }
                }
            },
            lastName: {
                validators: {
                    notEmpty: {
                        message: 'The Last name is required and cannot be empty'
                    }
                }
            },
            title: {
                validators: {
                    notEmpty: {
                        message: 'The title is required and cannot be empty'
                    },
                    stringLength: {
                        max: 100,
                        message: 'The title must be less than 100 characters long'
                    }
                }
            },
            content: {
                validators: {
                    notEmpty: {
                        message: 'The content is required and cannot be empty'
                    },
                    stringLength: {
                        max: 500,
                        message: 'The content must be less than 500 characters long'
                    }
                }
            }
        }
    });
});