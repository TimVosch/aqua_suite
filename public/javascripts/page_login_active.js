$('#logoutBtn').on('click', function() {
    Cookies.remove('jwtoken');
    location.reload();
});