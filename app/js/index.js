const storage = require('electron-json-storage');

$(function() {

  var errorsPresent = {
    username: true,
    password: true
  };

  $('#signIn').on('click', (e) => {
    $('#userAuth').html('<div class="signInContainer" id="signInContainer"><form id="signInForm"><label id="usernameLabel" for="username">Username</label><input type="text" name="username" id="username"><label id="passwordLabel" for="password">Password</label><input type="password" name="password" id="password"><button type="submit" id="submit">Submit</button></form></div>');
  });

  $('#signUp').on('click', (e) => {
    $('#userAuth').html('<div class="signUpContainer" id="signUpContainer"><form id="signUpForm"><label id="usernameLabel" for="username">Username</label><input type="text" name="username" id="username"><label id="passwordLabel" for="password">Password</label><input type="password" name="password" id="password"><button type="submit" id="submit">Submit</button></form></div>');
  });

  $('#userAuth').on('submit', '#signUpForm', (e) => {
    e.preventDefault();
    let username = $('#username').val();
    let pass = $('#password').val();
    $('div').remove('#passwordLength');
    $('div').remove('#passwordFormat');
    $('#password').removeClass('hasError');
    $('#passwordLabel').removeClass('hasError');
    $('div').remove('#usernameError');
    $('#username').removeClass('hasError');
    $('#usernameLabel').removeClass('hasError');
    checkUsername(username);
    checkPassword(pass);
    if (!errorsPresent.username && !errorsPresent.password) {
      let payload = {
        username: username,
        password: pass
      };
      // var url = 'http://localhost:3000';
      var url = 'https://music-match-server.herokuapp.com';
      $.ajax({
        method: 'POST',
        url: `${url}/users/signUp`,
        data: payload
      }).then((data) => {
        if (data.message.code === '23505') {
          $('#userAuth').prepend('<div id="usernameError" class="hasError"></div>');
          $('#usernameError').append(`<div>Username already taken!</div>`);
        } else if (data.message.length > 1){
          $('#userAuth').prepend('<div id="usernameError" class="hasError"></div>');
          $('#usernameError').append('<div>Something went wrong!</div>');
        } else {
          storage.set('user', {username: data.message[0].username, experience: data.message[0].experience, level: data.message[0].level}, (err) => {
            if (err) console.log(err);
          });
          window.location.href = './game.html';
        }
      });
    }
  });

  $('#userAuth').on('submit', '#signInForm', (e) => {
    e.preventDefault();
    let username = $('#username').val();
    let pass = $('#password').val();
    $('div').remove('#passwordLength');
    $('div').remove('#passwordFormat');
    $('#password').removeClass('hasError');
    $('#passwordLabel').removeClass('hasError');
    $('div').remove('#usernameError');
    $('#username').removeClass('hasError');
    $('#usernameLabel').removeClass('hasError');
    checkUsername(username);
    checkPassword(pass);
    if (!errorsPresent.username && !errorsPresent.password) {
      let payload = {
        username: username,
        password: pass
      };
      // var url = 'http://localhost:3000';
      var url = 'https://music-match-server.herokuapp.com';
      $.ajax({
        method: 'POST',
        url: `${url}/users/signIn`,
        data: payload
      }).then((data) => {
        if (data.message === 'No user found') {
          $('#signInContainer').prepend('<div id="usernameError" class="hasError"></div>');
          $('#usernameError').append(`<div>${data.message}</div>`);
        } else if (data.message.length > 1){
          $('#signInContainer').prepend('<div id="usernameError" class="hasError"></div>');
          $('#usernameError').append('<div>Something went wrong!</div>');
        } else {
          storage.set('user', {username: data.message[0].username, experience: data.message[0].experience, level: data.message[0].level}, (err) => {
            if (err) console.log(err);
          });
          window.location.href = './game.html';
        }
      });
    }
  });

  $('#userAuth').on('blur', '#username', (event) => {
    let username = $('#username').val();
    $('div').remove('#usernameError');
    $('#username').removeClass('hasError');
    $('#usernameLabel').removeClass('hasError');
    checkUsername(username, event);
  });

  $('#userAuth').on('blur', '#password', (event) => {
    let password = $('#password').val();
    $('div').remove('#passwordLength');
    $('div').remove('#passwordFormat');
    $('#password').removeClass('hasError');
    $('#passwordLabel').removeClass('hasError');
    checkPassword(password, event);
  });

  function checkUsername(username, e) {
    var message;
    if (username.length < 8) {
      $('#username').addClass('hasError');
      $('#usernameLabel').addClass('hasError');
      showTooltip('username');
    } else errorsPresent.username = false;
  }

  function checkPassword(password) {
    var message;
    if (!password.match('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])') || password.length < 8) {
      $('#password').addClass('hasError');
      $('#passwordLabel').addClass('hasError');
      showTooltip('password');
    } else errorsPresent.password = false;
  }

  var showTooltip = function(userOrPass) {
    $('div.tooltip').remove();
    var offsetTop, offsetLeft;
    console.log(event.target.offsetLeft);
    if (userOrPass === 'password') {
      $('<div id="passwordError" class="hasError tooltip"><div><hx>Password must contain at least:</hx><ul><li>1 Uppercase Letter</li><li>1 Lowercase Letter</li><li>1 Number</li><li>8 characters total</li></ul></div></div>').appendTo('#userAuth');
      offsetTop = event.target.offsetTop - 225;
    } else {
      $('<div id="usernameError" class="hasError tooltip"><div>Username must be at least 8 characters long.</div></div>').appendTo('#userAuth');
      offsetTop = event.target.offsetTop - 150;
    }
    $('div.tooltip').css({top: offsetTop});
  };
});
