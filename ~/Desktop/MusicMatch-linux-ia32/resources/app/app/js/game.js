const music = require('../resources/music.json');
const storage = require('electron-json-storage');

$(function() {
  var user, chosenGenre;
  var roundAnswers = [];
  storage.get('user', (err, data) => {
    if (err) console.log(err);
    user = data;
    $('header').append(`<div id="userInfo"><h3>${user.username} level ${user.level}</h3><div class="experience" id="experience">${user.experience}<progress max="${user.level * 10000}" value="${user.experience}"></progress>${user.level * 10000}</div></div>`);
  });
  var roundNum = 0;
  var playerScore = 0;
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
      $('#content').append('<div class="pie degree"><span class="block"></span><span id="time">0</span></div>');
      var totaltime = 30;
      function update(percent){
        var deg;
        if (percent < (totaltime / 2)){
          deg = 90 + (360 * percent / totaltime);
          $('.pie').css('background-image', `linear-gradient(${deg}deg, transparent 50%, white 50%),linear-gradient(90deg, white 50%, transparent 50%)`);
        } else if (percent >= (totaltime / 2)){
          deg = -90 + (360 * percent / totaltime);
          $('.pie').css('background-image', `linear-gradient(${deg}deg, transparent 50%, rgb(3,23,65) 50%),linear-gradient(90deg, white 50%, transparent 50%)`);
        }
      }
      var count = parseInt($('#time').text());
      myCounter = setInterval(function () {
        count += 1;
        $('#time').html(count / 10);
        update(count);
        if(count === totaltime) {
          clearInterval(myCounter);
          $('#content').html('');
          showRound(roundInfo, genre);
        }
      }, 100);
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
        timer -= 15;
    }, 10);
    roundInfo.songs.forEach((song, i) => {
      $('#round').append(`<div data-index="${i}"><image src="${song.artwork}"><span class="songs" id="song${i}">${song.track}</span> by ${song.artist}</div>`);
    });

    $('#round').one('click', 'div', function (e) {
      $('.songs').each((i, song) => {
        if ($(song).text() === roundInfo.answer.trackName) {
          $(song).parent().addClass('correct');
        }
      });
      roundAnswers.push({correct: roundInfo.answer, answer: roundInfo.songs[$(this).data('index')]});
      if ($(e.currentTarget.outerHTML).children('.songs').text() === roundInfo.answer.trackName){
        let scoredPoints = timer < 0 ? 0 : (Math.ceil(timer / 10));
        playerScore += scoredPoints
      } else {
        $(e.currentTarget).first().addClass('incorrect');
      }
      setTimeout(function () {
        $('#content').empty();
        if (roundNum < 4) {
          getRound(genre);
        } else {
          gameComplete();
        }
      }, 1000);
    });
  }

  function gameComplete() {
    const payload = {username: user.username, expGain: playerScore};
    var url = 'https://music-match-server.herokuapp.com';
    $.ajax({
      method: 'POST',
      url: `${url}/game/gameOver`,
      data: payload
    }).then((data) => {
      storage.set('user', {username: data.message[0].username, experience: data.message[0].experience, level: data.message[0].level}, (err) => {
        if (err) console.log(err);
      });
    });
    $('#content').append(`<div id="results"><div>Congratulations you scored ${playerScore} points!</div><table><tr><th>Your Answer</th><th>Correct Answer</th></tr></table></div>`);
    roundAnswers.forEach((answer, i) => {
      $('table').append(`<tr id="answers${i}"><td class="yourAnswer"><image src="${answer.answer.artwork}"> ${answer.answer.track} by ${answer.answer.artist}</td><td class="correctAnswer"><image src="${answer.correct.artworkUrl60}"> ${answer.correct.trackName} by ${answer.correct.artistName}</td></tr>`);
      if (answer.answer.track === answer.correct.trackName) $(`#answers${i}`).addClass('correct');
      else $(`#answers${i}`).addClass('incorrect');
    });
    $('#content').append('<button id="restart">Back To Menu</button>');
    $('#restart').on('click', (e) => {
      window.location.href = '../pages/game.html';
    });
  }
});
