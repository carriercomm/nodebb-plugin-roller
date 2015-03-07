var posts = require('../../src/posts');

(function(module) {
  // Dice roller formats
  // /roll #d# (+|-) #
  // 1: Number of dice, 2, dice value, 3, +/- something
  var diceRegex = /\/roll (\d*)d(\d*)((\+|\-)\d*)?/;

  // Eventually the export object
  var Roller = {};

  // A function to scrape the roll for the keys
  // Returns the randomized value
  var generateRoll = function(str) {
    var total   = 0
      , matched = diceRegex.exec(str)
      , numDice = matched[1]
      , diceVal = matched[2]
      , diceMod = matched[3]
      ;

    // If there is a diceMod, add it. Parsing the statement will remove the + or
    // convert the - into a negative integer.
    if (diceMod)
      total += parseInt(diceMod);

    // Loop through numDice times and constantly add the values of the dice
    // each time, between 1 and diceVal
    for(var i = 0; i < numDice; i++ )
      total += Math.floor((Math.random() * diceVal) + 1);

    // Give it a special class, so that it can be styled to show it's a roll
    return "<span title='"+matched[0]+"' class='diceRoll'>"+total+"</span>";
  }

  Roller.parse = function(data, callback) {
    if (!data || !data.postData || !data.postData.content) {
      return callback(null, data);
    }

    if (data.postData.content.match(diceRegex)) {
      if (!data.postData.roll) {
        var roll = generateRoll(data.postData.content);
        posts.setPostField(data.postData.pid, "roll", roll, function() {});
        data.postData.content = data.postData.content.replace(diceRegex, roll);
      }
      else {
        data.postData.content = data.postData.content.replace(diceRegex, data.postData.roll);
      }
    }
      callback(null, data);
    };

    module.exports = Roller;
}(module));
