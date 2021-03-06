window.GameApp = window.GameApp || {};


(function(){
  'use strict';
  var playerOneCharacter;
  var enemyCharacter;
  var playerHealth = 100;
  var enemyHealth = 100;
  var playerOneTurn = true;
  var moveSetOne;
  var enemyMoveSet;


  // Create an event hub
  GameApp.vent = _.extend({}, Backbone.Events);

  GameApp.vent.on('list:display', function(event) {
    $('.application').append(JST['character-select']());
    //animate scrolldown effect
    $("html, body").animate({ scrollTop: $(document).height() }, 1000);
  });

  GameApp.vent.on('playerMoveSelect', function(move) {
    var variedDamage; //damage value that will be slightly different each time
    if(move.damage !== 0) {
    variedDamage = move.damage + getDamageVariance(); //add variety to damage values
    variedDamage = Math.floor(variedDamage * 0.7); // smaller damage values to prolong game
    //ensure variedDamage is not a negative number, will set equal to at least 0
    if (variedDamage < 0) {
      variedDamage = 1; //changed from zero so that if damage is randomly 0, I can tell them apart
    }
  } else {
    variedDamage = 0;
  }
    if (playerOneTurn) {
      //if playerOneTurn is true AND damage is above zero, do this.
      if(variedDamage > 0) {
      changeEnemyHealth(variedDamage); //updates health bar
      $('.actiontext').css('color', 'black'); //Change text color to black for player
      displayGameText(playerOneCharacter, enemyCharacter, move, variedDamage);

      playerOneTurn = false;
      if(enemyHealth > 0) {
        enemyTurn();
      } else {
        GameApp.router.navigate('win', {trigger: true});
        }
      } else {
        //if playerOneTurn is true AND damage is not above zero, do this
      $('.actiontext').css('color', 'black');
      determineEffectMove(move);
    }
  } //end of if(playerturn)
}); //end of click event

  GameApp.vent.on('enemyMoveSelect', function(move) {
    setTimeout(function() {
      var variedDamage; //damage value that will be slightly different each time
      variedDamage= move.damage + getDamageVariance(); //add variety to damage values

      //ensure variedDamage is not a negative number, will set equal to at least 0
      if (variedDamage < 0) {
        variedDamage = 0;
      }

      changePlayerHealth(variedDamage); //updates health bar
      $('.actiontext').css('color', 'red'); //Change text color to red for enemy
      displayGameText(enemyCharacter, playerOneCharacter, move, variedDamage);

      if (playerHealth > 0) {
        playerOneTurn = true;
      } else {
        GameApp.router.navigate('lose', {trigger: true});
      }
    }, 3000);
  });

  $(document).ready(function(){
    GameApp.router = new GameApp.GameRouter();
    Backbone.history.start();
    GameApp.router.navigate('', {trigger: true});
  });

  // Set Event listener on character-selected-event: for whatever event is fired after both characters are selected on the 'CHARACTER SELECT GRID', a "BEGIN GAME BUTTON" or similar is pressed,  and we want to route to the game screen
  $(document).on('click', '.start-button', function(event){
    event.preventDefault();
    GameApp.vent.trigger('list:display');
    $.ajax({
      url: '../pokemon.json'
    }).then(function(pokemonlist) {
      pokemonlist.forEach(function(pokemon) {
        $('.character-grid-container').append(JST['rendercharacter'](pokemon));
      });

      $('.character-portrait').on('click', function(event){
        playerOneCharacter = $(this).data('name');
        console.log(playerOneCharacter);
        // $('.player-one').replaceWith($(this).html());
        $('.selection-stage').prepend(JST['stagedplayer']({
          name : $(this).data('name'),
          imgURL : $('.character-portrait-image', this).attr('src')
        }));
        $('.selection-stage-divider').css('display', 'inline-block');

        console.log("Player One has chosen" + " " + playerOneCharacter);

        $('.character-portrait').off('click');

        $('.character-portrait').on('click', function(){
          if (playerOneCharacter !== undefined){
            enemyCharacter = $(this).data('name');
            // $('.player-two').replaceWith($(this).html());
            $('.selection-stage').append(JST['stagedplayer']({
              name : $(this).data('name'),
              imgURL : $('.character-portrait-image', this).attr('src')
            }));
            $('.start-game-button').css('display', 'block');

            console.log("Player Two has chosen" + " " + enemyCharacter);
          }
        });
      });
    });
  });

  $(document).on('click', '.start-game-button', function(event){
    event.preventDefault();
    GameApp.router.navigate('game', {trigger: true});
    $.ajax({
      url: '../pokemon.json'
    }).then(function(pokemonlist) {
      var selectedPokemonOne = _.filter(pokemonlist, function(pokemon){
                return pokemon.name === playerOneCharacter;
      });

      var selectedPokemonTwo = _.filter(pokemonlist, function(pokemon){
        return pokemon.name === enemyCharacter;
      });
      console.log(selectedPokemonOne);
      moveSetOne = selectedPokemonOne[0].moves;
      enemyMoveSet = selectedPokemonTwo[0].moves;
      displayPlayerPokemon(selectedPokemonOne[0], moveSetOne);
      displayEnemyPokemon(selectedPokemonTwo[0]);
    });
  });

  $(document).on('click', '.playagain', function(event) {
    GameApp.router.navigate('', {trigger: true});
  });

  function displayBattleMenu(moveset) {
    $('.battlemenu').html(JST['battlemenu'](moveset));
    $('.firstmove').on('click', function(event) {
      GameApp.vent.trigger('playerMoveSelect', moveset[0]);
    });
    $('.secondmove').on('click', function(event) {
      GameApp.vent.trigger('playerMoveSelect', moveset[1]);
    });
    $('.thirdmove').on('click', function(event) {
      GameApp.vent.trigger('playerMoveSelect', moveset[2]);
    });
    $('.fourthmove').on('click', function(event) {
      GameApp.vent.trigger('playerMoveSelect', moveset[3]);
    });
  }

  function displayPlayerPokemon(pokemon, moveset) {
      $('.pokemondisplay').append(JST['player'](pokemon));
      displayBattleMenu(moveset);
  }

  function displayEnemyPokemon(pokemon) {
      $('.pokemondisplay').append(JST['enemy'](pokemon));
  }

  function changeEnemyHealth(damage) {
    var newHealth = enemyHealth - damage;
    displayEnemyHealth(newHealth);
    enemyHealth = newHealth;
  }

  function displayEnemyHealth(health) {
    var percentHealth = health + "%";
    $('.enemyhealthbar').css({"width": percentHealth});
  }

  function playerHeal(move) {
    var healedAmount = (move.damage * 0.7);
    var newHealth = playerHealth + healedAmount;
    displayPlayerHealth(newHealth);
    playerHealth = newHealth;
  }

  function changePlayerHealth(damage) {
    var newHealth = playerHealth - damage;
    displayPlayerHealth(newHealth);
    playerHealth = newHealth;
  }

  function displayPlayerHealth(health) {
    var percentHealth = health + "%";
    $('.playerhealthbar').css({"width": percentHealth});
  }

  function enemyTurn() {
    var enemyMove =  getEnemyMoveChoice(enemyMoveSet);
    GameApp.vent.trigger('enemyMoveSelect', enemyMove);
  }

  function determineEffectMove(move) {
    var sleepEffects = ["Sleep Powder", "Hypnosis", "Sing", "Hypnotize"];
    var paralyzeEffects = ["Thunder Wave", "ThunderShock", "Scare", "Howl"];
    var healEffects = ["Photosynthesis", "Fade", "Rest"];
    if(sleepEffects.indexOf(move.name) !== -1) {
      displaySleepText(playerOneCharacter, enemyCharacter, move);
    }
    if(paralyzeEffects.indexOf(move.name) !== -1) {
      displayParalyzeText(playerOneCharacter, enemyCharacter, move);
    }
    if(healEffects.indexOf(move.name) !== -1) {
      displayHealText(playerOneCharacter, enemyCharacter, move);
      playerHeal(move);
    }
  }

  function getEnemyMoveChoice(moveset) {
    var movesetIndex = _.random(0, 3);
    return moveset[movesetIndex];
  }

  function displayGameText(pokemon, opponent, move, damage) {
      $('.actiontext').html("");
      $('.actiontext').html("<p class='gameTextString' + >" + pokemon + " uses " + move.name + " on " + opponent + " for " + damage + " damage!" + "</p>");
  }

  function displaySleepText(pokemon, opponent, move) {
    $('.actiontext').html("");
    $('.actiontext').html("<p class='gameTextString' + >" + pokemon + " uses " + move.name + " to make " + opponent + " fall asleep for one turn!" + "</p>");
  }

  function displayParalyzeText(pokemon, opponent, move) {
    $('.actiontext').html("");
    $('.actiontext').html("<p class='gameTextString' + >" + pokemon + " uses " + move.name + " to paralyze " + opponent + " making " + opponent + "unable to move for one turn!" + "</p>");
  }

  function displayHealText(pokemon, opponent, move) {
    $('.actiontext').html("");
    $('.actiontext').html("<p class='gameTextString' + >" + pokemon + " uses " + move.name + " to heal themselves!" + "</p>");
  }

  //returns random number between 0(exclusive) and 20(inclusive)
  function getDamageVariance() {
    var plusOrMinus = Math.random() < 0.5 ? -1 : 1; //randomly sets -1 or 1
    var randomNumber = Math.floor(Math.random() * (21 - 1)) + 1; //random integer in range of 1 to 20
    console.log(Math.floor(randomNumber * plusOrMinus));
    return Math.floor(randomNumber * plusOrMinus);
  }

})();
