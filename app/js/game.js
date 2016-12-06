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
        roundInfo.songs.push({track: song.trackName, artist: song.artistName, artwork: song.artworkUrl60});
      });
      $('#content').append('<div class="item html"><h2>0</h2><svg width="160" height="160" xmlns="http://www.w3.org/2000/svg"><g><title>Layer 1</title><circle id="circle" class="circle_animation" r="69.85699" cy="81" cx="81" stroke-width="8" stroke="#6fdb6f" fill="none"/></g></svg></div>');
      var time = 3; /* how long the timer runs for */
      var initialOffset = '440';
      var i = 1
      var interval = setInterval(function() {
          $('.circle_animation').css('stroke-dashoffset', initialOffset-(i*(initialOffset/time)));
          $('h2').text(i);
          if (i === time) {
              clearInterval(interval);
          }
          i++;
      }, 1000);
      var timeout = setTimeout(function () {
        $('#content').html('');
        showRound(roundInfo, genre);
      }, 4000);
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
var interval;

  function showRound(roundInfo, genre) {
    $('#content').append(`<audio class="sound" src="${roundInfo.answer.previewUrl}" autoplay></audio><div id="round"><h1>Round ${roundNum}</h1></div>`);
    $('#content').append('<progress id="progress" max="15000" value="15000"></progress>');
    let timer = 15000;
    clearInterval(interval);
    interval = setInterval(function() {
      let value = $('#progress').val() - 15;
        $('#progress').val(value);
        if (timer <= 1) {
            clearInterval(interval);
        }
        timer-= 15;
    }, 10);
    roundInfo.songs.forEach((song, i) => {
      $('#round').append(`<div><image src="${song.artwork}"><span class="songs" id="song${i}">${song.track}</span> by ${song.artist}</div>`);
    });

    $('#round').one('click', 'div', function (e) {
      $('.songs').each((i, song) => {
        if ($(song).text() === roundInfo.answer.trackName) {
          $(song).parent().addClass('correct');
        }
      });

      if ($(e.currentTarget.outerHTML).children('.songs').text() === roundInfo.answer.trackName){
        let scoredPoints = playerScore < 0 ? 0 : (Math.ceil(timer / 10));
        playerScore += scoredPoints
        console.log('correct', playerScore, timer);
      } else {
        $(e.currentTarget).first().addClass('incorrect');
        console.log('wrong', playerScore);
      }
      setTimeout(function () {
        $('#content').empty();
        if (roundNum < 4) {
          getRound(genre);
        } else {
          gameComplete();
        }
      }, 3000);
    });
  }

  function gameComplete() {
    console.log('congrats you scored', playerScore);
    const payload = {username: user.username, expGain: playerScore};
    var url = 'https://music-match-server.herokuapp.com';
    $.ajax({
      method: 'POST',
      url: `${url}/game/gameOver`,
      data: payload
    }).then((data) => {
      console.log(data);
      storage.set('user', {username: data.message[0].username, experience: data.message[0].experience, level: data.message[0].level}, (err) => {
        if (err) console.log(err);
      });
      window.location.href = './game.html';
    });
  }
});
