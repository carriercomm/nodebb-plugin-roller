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
    return { "query" : matched[0], "total" : total};
  }

  // Returns the span element given the original roll and the total value
  var rollSpan = function(query, total) {
    return "<span title='"+query+"' class='dice-roll'><img src='/plugins/nodebb-plugin-roller/static/dice.svg' class='dice-icon'></img>"+total+"</span>";
  }

  Roller.parse = function(data, callback) {
    if (!data || !data.postData || !data.postData.content) {
      return callback(null, data);
    }

    if (data.postData.content.match(diceRegex)) {
      posts.getPostField(data.postData.pid, "rollTotal", function(err, total) {
        // No roll is presently set in the database
        if (!total) {
          var roll = generateRoll(data.postData.content);
          posts.setPostField(data.postData.pid, "rollTotal", roll.total, function() {});
          posts.setPostField(data.postData.pid, "rollQuery", roll.query, function() {});

          data.postData.content = data.postData.content.replace(diceRegex, rollSpan(roll.query, roll.total));
        }
        else {
          posts.getPostField(data.postData.pid, "rollQuery", function(err, query) {
            data.postData.content = data.postData.content.replace(diceRegex, rollSpan(query, total));
          });
        }
      });
    }
    callback(null, data);
  };

    module.exports = Roller;
}(module));
