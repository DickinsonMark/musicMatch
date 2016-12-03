$(function() {
  const {remote} = require('electron');

  var errorsPresent = {
    username: true,
    passwordLength: true,
    passwordFormat: true
  };

  $('#signIn').on('submit', (e) => {
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
    if (!errorsPresent.username && !errorsPresent.passwordLength && !errorsPresent.passwordFormat) {
      let payload = {
        username: username,
        password: pass
      };
      $.ajax({
        method: 'POST',
        url: 'http://localhost:3000/users/login',
        data: payload
      }).then((data) => {
        if (data.message === 'No user found') {
          $('#signInContainer').prepend('<div id="usernameError" class="hasError"></div>');
          $('#usernameError').append(`<div>${data.message}</div>`);
        } else if (data.message.length > 1){
          $('#signInContainer').prepend('<div id="usernameError" class="hasError"></div>');
          $('#usernameError').append('<div>Something went wrong!</div>');
        } else {
          window.location.href = './game.html';
        }
      });
    }
  });

  $('#username').on('change keyup paste', () => {
    let username = $('#username').val();
    $('div').remove('#usernameError');
    $('#username').removeClass('hasError');
    $('#usernameLabel').removeClass('hasError');
    checkUsername(username);
  });

  $('#password').on('change keyup paste', () => {
    let password = $('#password').val();
    $('div').remove('#passwordLength');
    $('div').remove('#passwordFormat');
    $('#password').removeClass('hasError');
    $('#passwordLabel').removeClass('hasError');
    checkPassword(password);
  });

  function checkUsername(username) {
    if (username.length < 8) {
      $('#username').addClass('hasError');
      $('#usernameLabel').addClass('hasError');
      $('#signInContainer').prepend('<div id="usernameError" class="hasError"></div>');
      $('#usernameError').append('<div>Username must be at least 8 characters long.</div>');
    } else errorsPresent.username = false;
  }

  function checkPassword(password) {
    if (password.length < 8) {
      $('#password').addClass('hasError');
      $('#passwordLabel').addClass('hasError');
      $('#signInContainer').prepend('<div id="passwordLength" class="hasError"></div>');
      $('#passwordLength').append('<div>Password must be at least 8 characters long.</div>');
    } else errorsPresent.passwordLength = false;
    if (!password.match('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])')) {
      $('#password').addClass('hasError');
      $('#passwordLabel').addClass('hasError');
      $('#signInContainer').prepend('<div id="passwordFormat" class="hasError"></div>');
      $('#passwordFormat').append('<div><hx>Password must contain at least:</hx><ul><li>1 Uppercase Letter</li><li>1 Lowercase Letter</li><li>1 Number</li></ul></div>');
    } else errorsPresent.passwordFormat = false;
  }
});
