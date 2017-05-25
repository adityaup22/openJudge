$( document ).ready(function() {
    function deltoken(){
        document.cookie = "usertoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    }
    function gettoken(){
        var cookies = document.cookie.split('; ');
        for(cook of cookies){
            if(cook.includes('usertoken=')){
                return cook.replace('usertoken=', '');
            }
        }
        return null;
    }
    function addtoken(token){
        console.log('Adding user login token' + token);
        document.cookie = "usertoken="+token;
    }
    function postit(url, data, success) {
        console.log(url);
        $.ajax({type: 'POST',
                url: url,
                data: data,
                success: success,
                contentType: "application/json",
                dataType: 'json'
        });
    }
    function logged_in_details(){
        if(gettoken() != null){
            var newdata = JSON.stringify({"token": gettoken()});
            postit('/user/details', newdata, function (data){
                if(data.user != null){
                    $("#user_name_display").text(data.user);
                    $("#score_display").text(data.score);
                }
            });//user details postit
        } else {
                    $("#user_name_display").text('User');
                    $("#score_display").text('0');
        }
    }
    function check_attempt_status(){
        $("#attempt_status").addClass('checking_attempt');
        console.log('Checking attempt status');
        var data = JSON.stringify({'attempt': $("#attempt_status").text()});
        postit('/attempt/status', data, function (data){
            console.log(data);
            if(data.status == true){
                $("#attempt_status").removeClass('checking_attempt');
                $("#attempt_status").removeClass('wrong_attempt');
                $("#attempt_status").addClass('correct_attempt');
                return;
            }
            if(data.status == false){
                $("#attempt_status").removeClass('checking_attempt');
                $("#attempt_status").removeClass('correct_attempt');
                $("#attempt_status").addClass('wrong_attempt');
                return;
            }
            if(data.status == null){
                $("#attempt_status").removeClass('wrong_attempt');
                $("#attempt_status").removeClass('correct_attempt');
                $("#attempt_status").addClass('checking_attempt');
                return;
            }
        });
    }
    // --------------------------------------------------------- Actual stuff
    $("#login").click(function (){
        var username = $("#username").val();
        var password = $("#password").val();
        if(username == ''){
            $("#username").addClass('missingform');
        }else{
            $("#username").removeClass('missingform');
        }
        if(password == ''){
            $("#password").addClass('missingform');
        }else{
            $("#password").removeClass('missingform');
        }
        if(password != '' && username != ''){
            // All data available
            var data = JSON.stringify({'username': username, 'password': password});
            postit('/login', data, function(data){
                if(data.status == true){
                    console.log('Login successful');
                    addtoken(data.token);
                    logged_in_details();
                } else{
                    console.log('Login failed');
                }
            });  // end of postit handler
        }
    });  // login action

    $("#logout").click(function (){
        var token = gettoken();
        var data = JSON.stringify({'token': token});
        postit('/logout', data, function (data){
            if(data.status == true){
                console.log('Logout successful');
                deltoken();
            } else {
                console.log('Logout failed');
            }
        });
    });  // logout action
    $("#signup").click(function (){
        var username = $("#username").val();
        var password = $("#password").val();
        if(username == ''){
            $("#username").addClass('missingform');
        }else{
            $("#username").removeClass('missingform');
        }
        if(password == ''){
            $("#password").addClass('missingform');
        }else{
            $("#password").removeClass('missingform');
        }
        if(password != '' && username != ''){
            // All data available
            var data = JSON.stringify({'username': username, 'password': password});
            postit('/register', data, function(data){
                if(data.status == true){
                    console.log('Signup successful');
                    $("#login").click();  // Login now that they have signed up
                } else{
                    console.log('Signup failed');
                }
            });  // end of postit handler
        }
    });  // signup action
    $("#submit_attempt").click(function (){
        var url = '/attempt';
        var qpk = $("#question_number").text();
        var lang = $("#language").val();
        var code = $("#code").val();
        var token = gettoken();
        var data = JSON.stringify({'question': qpk,
                                   'language': lang,
                                   'code': code,
                                   'token': token});
        postit(url, data, function (data){
            console.log(data);
            if(data.attempt != null){
                $("#attempt_status").text(data.attempt);
                check_attempt_status();
                $("#attempt_status").removeClass('wrong_attempt');
                $("#attempt_status").removeClass('correct_attempt');
                $("#attempt_status").addClass('checking_attempt');
            }
        });
    });  // submit action
    $(".question_button").click(function (){
        $(".question_button").removeClass('button-primary');
        $(this).addClass('button-primary');
        // ----- get relevant question data
        var qpk = $(this).attr('id').substring(2);
        var data = JSON.stringify({'question_pk': qpk});
        $("#question_number").text(qpk);
        postit('/question', data, function(data){
            console.log(data.statement);
            $("#question_pre").text(data.statement);
        });
    });
    $("#attempt_status").click(check_attempt_status);
    // --------------------------------Execute on page load
    logged_in_details();
});   // Document ready
