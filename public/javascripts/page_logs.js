var projects = [];
var name = '';
var selectedProject = {};
var week = 0;

$(document).ready(function () {
    name = $('input[name="githubname"]').val();
    $.getJSON('/users/self/projects')
    .done(function(data) {
        projects = data;
        $('select[name="githubrepo"]').html('');
        for (var i=0; i < projects.length; i++) {
            $('select[name="githubrepo"]').append('<option value="' + i + '">' + projects[i].name + '</option>');
        }
    });
});

// When settings repo
$('#setGithubRepo').on('click', function () {
    var repoId = $('select[name="githubrepo"]').val();
    selectedProject = projects[repoId];

    // Set weeks input
    var weeks = projects[repoId].weeks;
    $('select[name="week"]').html('');
    for (var i=weeks; i > 0; i--) {
        $('select[name="week"]').append('<option value="' + i + '">' + i + '</option>');
    }
});

// Retrieve and apply commits
$('#setWeek').on('click', function () {
    week = $('select[name="week"]').val();
    var startDate = new Date(selectedProject.createdAt);
    // Get start of week (sunday)
    startDate.setDate(startDate.getDate() - startDate.getDay());
    // Calculate since and until values
    var _since = new Date(startDate);
    _since.setDate(_since.getDate() + 7*(week-1));
    var _until = new Date(_since);
    _until.setDate(_until.getDate() + 7);
    
    // Get user commits
    $.getJSON('/users/self/projects/' + selectedProject.fullname + '/commits', { since: _since.toISOString(), until: _until.toISOString() })
    .done(function (data) {
        selectedProject.commits = data;
        // data[?].commit.message
        $('#commitsList').html('');
        // Go through commits and add them to the list
        for (var i=0; i < data.length; i++) {
            // format correctly
            var _message = data[i].message;
            var _date = (new Date(data[i].author.date)).toLocaleString();
            var _url = data[i].html_url;

            $('#commitsList').append("\
                <div href=\"#\" class=\"list-group-item\">\
                    <h4 class=\"list-group-item-heading\">" + _message + "</h4>\
                    <span class=\"list-group-item-text\">" + _date + "<a target=\"_blank\" href=\"" + _url + "\" class=\"pull-right\">View changes</a></span>\
                </div>\
            ");
        }
    })
    .fail(function (err) {
        console.error(err);
    });
});

$('#submitLog').on('click', function () {
    // Pre-Assignment
    var _commits = selectedProject.commits;
    var _repo = selectedProject.fullname;
    var _week = week;
    var _subtitle = $('input[name="subtitle"]').val();
    var _comments = $('textarea[name="comments"]').val();
    // Validation

    // Bundling (make one object)
    var data = {
        project: _repo,
        week: _week,
        title: _subtitle,
        comments: _comments
    };
    // POST to api
    $.post('/logs/create', data)
    .done(function (_data) {
        console.log('success', _data);
    });
    // Redirect to view log
});