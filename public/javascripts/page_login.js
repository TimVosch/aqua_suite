$('#loginButton').on('click', function() {
    $.post({
        url: '/login',
        data: {
            username: $('input[name=\'username\']').val(),
            password: $('input[name=\'password\']').val()
        },
        // dataType: 'json' // Not necessary, only in GET routes
    })
    .done(function (data) {
        if (!data.error && data.token) {
            Cookies.set('jwtoken', data.token);
            window.location = '/';
            return;
        }
        $('#loginMessage').addClass('text-danger').text('Login failed');
    })
});