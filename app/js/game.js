const music = require('../resources/music.json');
const storage = require('electron-json-storage');

$(function() {
  var user, chosenGenre;
  var roundAnswers = [];
  var alreadyChosen = [];

//  pull in user information from local storage and display on screen
  storage.get('user', (err, data) => {
    if (err) console.log(err);
    user = data;
    $('header').append(`<div id="userInfo"><h3>${user.username} level ${user.level}</h3><div class="experience" id="experience">${user.experience}<progress max="${user.level * 10000}" value="${user.experience}"></progress>${user.level * 10000}</div></div>`);
  });
  var roundNum = 0;
  var playerScore = 0;
  let genres = Object.keys(music);
//  display the available genres and create an event handler for each
  genres.forEach((genre) => {
    $('#genreChoice').append(`<div class="genre" id="${genre}">${genre}</div>`);
    $(`#${genre}`).on('click', (e) => {
      chosenGenre = genre;
      $('#content').html('');
//  when a genre is clicked, start the round with the chosen genre
      getRound(genre);
    });
  });

//  function that begins the gameplay
  function getRound(genre) {
    roundNum++;

//  get the songs that will be used for this round, then resolve the promises and create an array with their iTunes information
    const songPromises = getSongs(genre);
    const songsProm = Promise.all(songPromises);
    var songs;
    songsProm.then((data) => {
      songs = data.map((song) => {
        return song.results[0];
      });

//  randomly select one of the four songs to be the correct answer
      const answer = songs[Math.floor(Math.random() * songs.length)];

//  push that songs ID into an array of songs that have already been chosen, so that the same song will never be played more than once in a round
      alreadyChosen.push(answer.trackId);
      const roundInfo = {answer: answer, songs: []};
      songs.forEach((song) => {
        song.trackName = song.trackName.replace(/ \((.*)/g, '');
        roundInfo.songs.push({track: song.trackName, artist: song.artistName, artwork: song.artworkUrl60});
      });

//  Display a three second countdown animation before the song begins playing and the round is begun
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

//  function that selects the four songs for the round
  function getSongs(genre) {
    var songs = [];
    var ids = [];

//  loop through four times to get four different songs
    for (let i = 0; i < 4; i++) {

//  randomly chose a song in the chosen genre
      var id = music[chosenGenre][Math.floor(Math.random() * music[chosenGenre].length)];

//  if that song has not already been chosen for this round, or if it was not a previous song that played, add it to the list of songs for this round
      if (ids.indexOf(id) === -1 && alreadyChosen.indexOf(id) === -1) {
        ids.push(id);

//  if it was already chosen, reduce the loop and try again
      } else {
        i--;
      }
    }

//  create AJAX call promises to iTunes for each song
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

//  function that displays the round to the player
  function showRound(roundInfo, genre) {

//  add the sound and a progress bar that reflects how many points they will recieve
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

//  for each song, create a button with the song info for the player to click to show their answer
    roundInfo.songs.forEach((song, i) => {
      $('#round').append(`<div class="choice" data-index="${i}"><image src="${song.artwork}"><p><span class="songs" id="song${i}">${song.track}</span> by ${song.artist}</p></div>`);
    });

//  create a one time click event for the choices
    $('#round').one('click', 'div', function (e) {

//  loop through the choices and if the choice matches the correct answer, color it green
      $('.songs').each((i, song) => {
        if ($(song).text() === roundInfo.answer.trackName) {
          $(song).parent().parent().css('background-color', 'rgba(17, 221, 19, 0.75)');
        }
      });

//  store the correct answer and what the player chose in an array of objects to be used at the end of the game
      roundAnswers.push({correct: roundInfo.answer, answer: roundInfo.songs[$(this).data('index')]});

//  compare the users selected choice against the correct answer...
//  if correct, add the score to the players total points for this game
      if ($(e.currentTarget.outerHTML).children('p').children('.songs').text() === roundInfo.answer.trackName){
        let scoredPoints = timer < 0 ? 0 : (Math.ceil(timer / 10));
        playerScore += scoredPoints

//  otherwise, mark their selection in red
      } else {
        $(e.currentTarget).first().css('background-color', 'rgba(255, 0, 0, 0.75)');
      }

//  wait one second before moving on to the next round or game completion
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

//  function that controls the end of the game, after four rounds have been completed
  function gameComplete() {
    const payload = {username: user.username, expGain: playerScore};
    var url = 'https://music-match-server.herokuapp.com';

//  make an AJAX call with the players score from this game to add it to the players experience
    $.ajax({
      method: 'POST',
      url: `${url}/game/gameOver`,
      data: payload
    }).then((data) => {

//  take the response and save the new stats to local storage
      storage.set('user', {username: data.message[0].username, experience: data.message[0].experience, level: data.message[0].level}, (err) => {
        if (err) console.log(err);
      });
    });

//  display how many points they score and show each rounds chosen answer and correct answer, styled correctly depending on whether the answer was correct or not
    $('#content').append(`<div id="results"><div>Congratulations you scored ${playerScore} points!</div><table><tr><th>Your Answer</th><th>Correct Answer</th></tr></table></div>`);
    roundAnswers.forEach((answer, i) => {
      $('table').append(`<tr id="answers${i}"><td class="yourAnswer"><image src="${answer.answer.artwork}"> ${answer.answer.track} by ${answer.answer.artist}</td><td class="correctAnswer"><image src="${answer.correct.artworkUrl60}"> ${answer.correct.trackName} by ${answer.correct.artistName}</td></tr>`);
      if (answer.answer.track === answer.correct.trackName) $(`#answers${i}`).addClass('correct');
      else $(`#answers${i}`).addClass('incorrect');
    });

//  display a button that will return the player to the genre selection screen
    $('#content').append('<button class="reset" id="restart">Back To Menu</button>');
    $('#restart').on('click', (e) => {
      window.location.href = '../pages/game.html';
    });
  }
});
