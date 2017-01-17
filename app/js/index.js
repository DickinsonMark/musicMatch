const storage = require('electron-json-storage');

$(function() {

// create a variable for the login validation
  var errorsPresent = {
    username: true,
    password: true
  };

// when a user clicks the signIn button, they will be shown a form for entering their credentials
  $('#signIn').on('click', (e) => {
    $('#userAuth').html('<div class="signInContainer" id="signInContainer"><form id="signInForm"><label id="usernameLabel" for="username">Username</label><input type="text" name="username" id="username"><label id="passwordLabel" for="password">Password</label><input type="password" name="password" id="password"><button type="submit" id="submit">Submit</button></form></div>');
    $('header').append('<button class="goBack">Go Back</button>');
  });

// when a user clicks the signUp button, they will be shown a form for creating a new account
  $('#signUp').on('click', (e) => {
    $('#userAuth').html('<div class="signUpContainer" id="signUpContainer"><form id="signUpForm"><label id="usernameLabel" for="username">Username</label><input type="text" name="username" id="username"><label id="passwordLabel" for="password">Password</label><input type="password" name="password" id="password"><button type="submit" id="submit">Submit</button></form></div>');
    $('header').append('<button class="goBack">Go Back</button>');
  });

// allows a user to go back to the main menu if they accidently click the wrong option
  $('header').on('click', '.goBack', (e) => {
    window.location.href = '../pages/index.html';
  });

// when a user submits the signUp Form...
  $('#userAuth').on('submit', '#signUpForm', (e) => {
    e.preventDefault();

//  store the users entered information in variables
    let username = $('#username').val();
    let pass = $('#password').val();

//  remove any present error messages and styling
    $('div').remove('#passwordLength');
    $('div').remove('#passwordFormat');
    $('#password').removeClass('hasError');
    $('#passwordLabel').removeClass('hasError');
    $('div').remove('#usernameError');
    $('#username').removeClass('hasError');
    $('#usernameLabel').removeClass('hasError');

//  check the user entered username and password for errors
    checkUsername(username);
    checkPassword(pass);

//  if there are no errors found in either...
    if (!errorsPresent.username && !errorsPresent.password) {
      let payload = {
        username: username,
        password: pass
      };
      var url = 'https://music-match-server.herokuapp.com';

//  make an AJAX call to the server that contains a PostgreSQL database with user information
      $.ajax({
        method: 'POST',
        url: `${url}/users/signUp`,
        data: payload
      }).then((data) => {

//  check the response from the AJAX call...
//  if the response contains code 23505, that means that the username is already taken, alert the user
        if (data.message.code === '23505') {
          $('#userAuth').prepend('<div id="usernameError" class="hasError"></div>');
          $('#usernameError').append(`<div>Username already taken!</div>`);

//  if the response doesn't contain any message, alert the user
        } else if (data.message.length > 1){
          $('#userAuth').prepend('<div id="usernameError" class="hasError"></div>');
          $('#usernameError').append('<div>Something went wrong, try again later!</div>');

//  if there are no issues, save the users stats to local storage and load the game.
        } else {
          $('#userAuth').empty();
          $('#userAuth').append('<div class="loading"><div class="bullet"></div><div class="bullet"></div><div class="bullet"></div><div class="bullet"></div></div>');
          storage.set('user', {username: data.message[0].username, experience: data.message[0].experience, level: data.message[0].level}, (err) => {
            if (err) console.log(err);
          });
          window.location.href = './game.html';
        }
      });
    }
  });

// when a user submits the signIn Form...
  $('#userAuth').on('submit', '#signInForm', (e) => {
    e.preventDefault();

//  save the users entered information to variables
    let username = $('#username').val();
    let pass = $('#password').val();

//  remove any present error messages and styling
    $('div').remove('#passwordLength');
    $('div').remove('#passwordFormat');
    $('#password').removeClass('hasError');
    $('#passwordLabel').removeClass('hasError');
    $('div').remove('#usernameError');
    $('#username').removeClass('hasError');
    $('#usernameLabel').removeClass('hasError');

//  check the username and password for errors
    checkUsername(username);
    checkPassword(pass);

//  if there are no errors found in either...
    if (!errorsPresent.username && !errorsPresent.password) {
      let payload = {
        username: username,
        password: pass
      };
      var url = 'https://music-match-server.herokuapp.com';

//  make an AJAX call to the server that contains a PostgreSQL database with user information
      $.ajax({
        method: 'POST',
        url: `${url}/users/signIn`,
        data: payload
      }).then((data) => {

//  check the response from the AJAX call...
//  if the response contains a message of 'No user found', alert the user
        if (data.message === 'No user found') {
          $('#signInContainer').prepend('<div id="usernameError" class="hasError"></div>');
          $('#usernameError').append(`<div>${data.message}</div>`);

//  if the response didn't contain a message, alert the user
        } else if (data.message.length > 1){
          $('#signInContainer').prepend('<div id="usernameError" class="hasError"></div>');
          $('#usernameError').append('<div>Something went wrong, try again later!</div>');

//  if there were no issues, save the user stats to local storage and load the game
        } else {
          $('#userAuth').empty();
          $('#userAuth').append('<div class="loading"><div class="bullet"></div><div class="bullet"></div><div class="bullet"></div><div class="bullet"></div></div>');
          storage.set('user', {username: data.message[0].username, experience: data.message[0].experience, level: data.message[0].level}, (err) => {
            if (err) console.log(err);
          });
          window.location.href = './game.html';
        }
      });
    }
  });

//  when the user is no longer focused on the username input field...
  $('#userAuth').on('blur', '#username', (event) => {
    let username = $('#username').val();

//  remove error messages and styling relating to the username
    $('div').remove('#usernameError');
    $('#username').removeClass('hasError');
    $('#usernameLabel').removeClass('hasError');

//  check the username for errors
    checkUsername(username, event);
  });

//  when the user is no longer focused on the password input field...
  $('#userAuth').on('blur', '#password', (event) => {
    let password = $('#password').val();

//  remove error messages and styling relating to the password
    $('div').remove('#passwordLength');
    $('div').remove('#passwordFormat');
    $('#password').removeClass('hasError');
    $('#passwordLabel').removeClass('hasError');

//  check the password for errors
    checkPassword(password, event);
  });

//  function that checks the username for errors
  function checkUsername(username, e) {
    var message;

//  if the username is less than eight characters long throw an error
    if (username.length < 8) {
      $('#username').addClass('hasError');
      $('#usernameLabel').addClass('hasError');

//  display the error pertaining to usernames
      showTooltip('username');

//  otherwise, change the variable that controls the errors for usernames to false
    } else errorsPresent.username = false;
  }

//  function that checks the password for errors
  function checkPassword(password) {
    var message;

//  using regex, check the password to make sure it contains at least one of each:
//  1. a lowercase Letter
//  2. an uppercase Letter
//  3. a number
//  also verify that the password is at least 8 characters long
    if (!password.match('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])') || password.length < 8) {
      $('#password').addClass('hasError');
      $('#passwordLabel').addClass('hasError');

//  display the error pertaining to passwords
      showTooltip('password');

// otherwise, change the variable that controls the errors for passwords to false
    } else errorsPresent.password = false;
  }

// function that displays the errors needed depending on the issue
  var showTooltip = function(userOrPass) {
    $('div.tooltip').remove();
    var offsetTop, offsetLeft;
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
