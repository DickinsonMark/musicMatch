const music = require('../resources/music.json');
const storage = require('electron-json-storage');

$(function() {
  var user;
  storage.get('user', (err, data) => {
    if (err) console.log(err);
    user = data;
    $('main').prepend(`<div id="userInfo">${user.username} level ${user.level}</div>`);
  });
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
      showRound(roundInfo, genre);
    });
  }

  function getSongs(genre) {
    var songs = [];
    var ids = [];
    for (let i = 0; i < 4; i++) {
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

  function showRound(roundInfo, genre) {
    $('#content').append(`<audio class="sound" src="${roundInfo.answer.previewUrl}" autoplay></audio><div id="round"><h1>Round ${roundNum}</h1></div>`);
    roundInfo.songs.forEach((song, i) => {
      $('#round').append(`<div id="song${i}">${song}</div>`);
      $(`#song${i}`).on('click', function (e) {
        if ($(this).text() === roundInfo.answer.trackName){
          playerScore += 1000;
          console.log('correct', playerScore);
        } else {
          console.log('wrong', playerScore);
        }
        $('#content').empty();
        if (roundNum < 4) {
          getRound(genre);
        } else {
          gameComplete();
        }
      });
    });
  }

  function gameComplete() {
    console.log('congrats you scored', playerScore);
    const payload = {username: user.username, expGain: playerScore};
    $.ajax({
      method: 'POST',
      url: 'http://localhost:3000/game/gameOver',
      data: payload
    }).then((data) => {
      storage.set('user', {username: data.message[0].username, experience: data.message[0].experience, level: data.message[0].level}, (err) => {
        if (err) console.log(err);
      });
      window.location.href = './game.html';
    });
  }
});
