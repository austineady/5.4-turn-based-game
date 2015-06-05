(function(){
  'use strict';

  $(document).ready(function(){
    $.ajax({
      url: '../pokemon.json'
    }).then(function(pokemonlist) {
      pokemonlist.forEach(function(pokemon) {
        displayPlayerPokemon(pokemon);
        displayEnemyPokemon(pokemon);
      });
    });
  });

  function displayBattleMenu(pokemon) {
    var moveSet = pokemon.moves;
    $('.battlemenu').html(JST['battlemenu'](moveSet));
  }

  function displayPlayerPokemon(pokemon) {
    if(pokemon.name === "Charizard") {
      $('.pokemondisplay').append(JST['player'](pokemon));
      displayBattleMenu(pokemon);
    }
  }

  function displayEnemyPokemon(pokemon) {
    if(pokemon.name === "Moltres") {
      $('.pokemondisplay').append(JST['enemy'](pokemon));
    }
}






})();
