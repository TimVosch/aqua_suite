$('#loginButton').on('click', function() {
    $.post('/login', {
        username: $('input[name=\'username\']').val(),
        password: $('input[name=\'password\']').val()
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