console.log('sanity check');

$('#signIn').on('submit', (e) => {
  e.preventDefault();
  let payload = {
    username: $('#username').val(),
    password: $('#password').val()
  }
});
