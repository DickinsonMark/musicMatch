const music = require('../resources/music.json');

$(function() {
  var roundNum = 0;
  var playerScore = 0;
  var chosenGenre;
  let genres = Object.keys(music);
  genres.forEach((genre) => {
    $('#genreChoice').append(`<div class="genre" id="${genre}">${genre}</div>`);
    $(`#${genre}`).on('click', (e) => {
      chosenGenre = genre;
      $('#content').html('')
      getRound(genre);
    });
  });

  function getRound(genre) {
    roundNum++;
    const songPromises = getSongs(genre);
    const songsProm = Promise.all(songPromises);
    var songs;
    songsProm.then((data) => {
      songs = data.map((song) => {
        return song.results[0];
      });
      const answer = songs[Math.floor(Math.random() * songs.length)];
      const roundInfo = {answer: answer, songs: []};
      songs.forEach((song) => {
        roundInfo.songs.push(song.trackName);
      });
      showRound(roundInfo);
    });
  }

  function getSongs(genre) {
    var songs = [];
    var ids = [];
    for (let i = 0; i < 4; i++) {
      console.log('hit');
      var id = music[chosenGenre][Math.floor(Math.random() * music[chosenGenre].length)];
      if (ids.indexOf(id) === -1) {
        ids.push(id);
      } else {
        i--;
      }
    }
    var ajaxPromises = [];
    ids.forEach((songID) => {
      ajaxPromises.push($.ajax({
        url: 'https://itunes.apple.com/lookup?id=' + songID,
        jsonp: 'callback',
        dataType: 'jsonp'
      }));
    });
    return ajaxPromises;
  }

  function showRound(roundInfo) {
    $('#content').append(`<audio class="sound" src="${roundInfo.answer.previewUrl}" autoplay></audio><div id="round"><h1>Round ${roundNum}</h1></div>`);
    roundInfo.songs.forEach((song, i) => {
      console.log(song);
      $('#round').append(`<div id="song${i}">${song}</div>`);
      $(`#song${i}`).on('click', function (e) {
        if ($(this).text() === roundInfo.answer.trackName){
          playerScore += 1000;
        } 
      });
    });
  }

});
