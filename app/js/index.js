$(function() {
  var errorsPresent = {
    username: true,
    passwordLength: true,
    passwordFormat: true
  };

  $('#signIn').on('submit', (e) => {
    e.preventDefault();
    let username = $('#username').val();
    let pass = $('#password').val();
    checkUsername(username);
    checkPassword(pass);
    if (!errorsPresent.username && !errorsPresent.passwordLength && !errorsPresent.passwordFormat) {
      let payload = {
        username: username,
        password: pass
      };
      main.openMainMenu();
    }
  });

  $('#username').on("change keyup paste", () => {
    let username = $('#username').val();
    $('div').remove('#usernameError');
    $('#username').removeClass('hasError');
    $('#usernameLabel').removeClass('hasError');
    checkUsername(username);
  });

  $('#password').on("change keyup paste", () => {
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
    if (password.length < 8 || !password.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])")) {
      $('#password').addClass('hasError');
      $('#passwordLabel').addClass('hasError');

      if (password.length < 8) {
        $('#signInContainer').prepend('<div id="passwordLength" class="hasError"></div>');
        $('#passwordLength').append('<div>Password must be at least 8 characters long.</div>');
      } else errorsPresent.passwordLength = false;
      
      if (!password.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])")) {
        $('#signInContainer').prepend('<div id="passwordFormat" class="hasError"></div>');
        $('#passwordFormat').append('<div><hx>Password must contain at least:</hx><ul><li>1 Uppercase Letter</li><li>1 Lowercase Letter</li><li>1 Number</li></ul></div>');
      } else errorsPresent.passwordFormat = false;
    }
  }
});
