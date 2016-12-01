$(function() {
  var errorsPresent = {
    username: true,
    password: true
  };

  $('#signIn').on('submit', (e) => {
    e.preventDefault();
    let username = $('#username').val();
    let pass = $('#password').val();
    if (!errorsPresent.username && !errorsPresent.password) {
      let payload = {
        username: username,
        password: pass
      };
    }
  });

  $('#username').on("change keyup paste", () => {
    let username = $('#username').val();
    let checkedInput = checkUsername(username);
    $('div').remove('#error');
    $('#username').removeClass('hasError');
    $('#usernameLabel').removeClass('hasError');
    if (checkedInput) {
      $('#username').addClass('hasError');
      $('#usernameLabel').addClass('hasError');
      $('#signInContainer').prepend('<div id="error" class="hasError"></div>');
      $('#error').append('<div>Username must be at least 8 characters long.</div>');
    } else {
      errorsPresent.username = false;
    }
  });

  $('#password').on("change keyup paste", () => {
    let password = $('#password').val();
    let checkedInput = checkPassword(password);
    console.log(checkedInput.length);
    $('div').remove('#error');
    $('#password').removeClass('hasError');
    $('#passwordLabel').removeClass('hasError');
    if (checkedInput.length) {
      checkedInput.forEach((error) => {
        if (error === 'password') {
          $('#password').addClass('hasError');
          $('#passwordLabel').addClass('hasError');
          $('#signInContainer').prepend('<div id="error" class="hasError"></div>');
          $('#error').append('<div>Username must be at least 8 characters long.</div>');
        }
        if (error === 'mismatch') {
          $('#password').addClass('hasError');
          $('#passwordLabel').addClass('hasError');
          $('#signInContainer').prepend('<div id="error" class="hasError"></div>');
          $('#error').append('<div>Password must contain at least:<ul><li>1 Uppercase Letter</li><li>1 Lowercase Letter</li><li>1 Number</li></ul></div>');
        }
      });
    } else {
      errorsPresent.password = false;
    }
  });

  function checkUsername(username) {return username.length < 8 ? true : false;}

  function checkPassword(password) {
    let result = [];
    if (password.length < 8) result.unshift('password');
    if (!password.match("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])")) result.unshift('mismatch');
    return result;
  }
});
