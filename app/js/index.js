const storage = require('electron-json-storage');

$(function() {

  var errorsPresent = {
    username: true,
    passwordLength: true,
    passwordFormat: true
  };

  $('#signIn').on('click', (e) => {
    $('#userAuth').html('<div id="signInContainer"><form id="signInForm"><label id="usernameLabel" for="username">Username</label><input type="text" name="username" id="username"><label id="passwordLabel" for="password">Password</label><input type="password" name="password" id="password"><button type="submit" id="submit">Submit</button></form></div>');
  });

  $('#signUp').on('click', (e) => {
    $('#userAuth').html('<div id="signUpContainer"><form id="signUpForm"><label id="usernameLabel" for="username">Username</label><input type="text" name="username" id="username"><label id="passwordLabel" for="password">Password</label><input type="password" name="password" id="password"><button type="submit" id="submit">Submit</button></form></div>');
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
    if (!errorsPresent.username && !errorsPresent.passwordLength && !errorsPresent.passwordFormat) {
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
    if (!errorsPresent.username && !errorsPresent.passwordLength && !errorsPresent.passwordFormat) {
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

  $('#userAuth').on('change keyup paste', '#username', () => {
    let username = $('#username').val();
    $('div').remove('#usernameError');
    $('#username').removeClass('hasError');
    $('#usernameLabel').removeClass('hasError');
    checkUsername(username);
  });

  $('#userAuth').on('change keyup paste', '#password', () => {
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
      $('#userAuth').prepend('<div id="usernameError" class="hasError"></div>');
      $('#usernameError').append('<div>Username must be at least 8 characters long.</div>');
    } else errorsPresent.username = false;
  }

  function checkPassword(password) {
    if (password.length < 8) {
      $('#password').addClass('hasError');
      $('#passwordLabel').addClass('hasError');
      $('#userAuth').prepend('<div id="passwordLength" class="hasError"></div>');
      $('#passwordLength').append('<div>Password must be at least 8 characters long.</div>');
    } else errorsPresent.passwordLength = false;
    if (!password.match('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])')) {
      $('#password').addClass('hasError');
      $('#passwordLabel').addClass('hasError');
      $('#userAuth').prepend('<div id="passwordFormat" class="hasError"></div>');
      $('#passwordFormat').append('<div><hx>Password must contain at least:</hx><ul><li>1 Uppercase Letter</li><li>1 Lowercase Letter</li><li>1 Number</li></ul></div>');
    } else errorsPresent.passwordFormat = false;
  }
});
