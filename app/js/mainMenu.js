$(function() {
  $.ajax({
    method: 'GET',
    url: 'https://itunes.apple.com/us/rss/topsongs/genre=1152/json'
  }).then((data) => {
    console.log(data);
  });
});
