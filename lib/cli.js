/*
 * CLI-Related Tasks
 *
 */

 // Dependencies
 var readline = require('readline');
 var util = require('util');
 var debug = util.debuglog('cli');
 var events = require('events');
 class _events extends events{};
 var e = new _events();
 var os = require('os');
 var v8 = require('v8');
 var _data = require('./data');

 // Instantiate the CLI module object
 var cli = {};


 // Input handlers
 e.on('man',function(str){
   cli.responders.help();
 });

 e.on('help',function(str){
   cli.responders.help();
 });

 e.on('exit',function(str){
   cli.responders.exit();
 });

 e.on('stats',function(str){
   cli.responders.stats();
 });

 e.on('list users',function(str){
   cli.responders.listUsers();
 });

 e.on('more user info',function(str){
   cli.responders.moreUserInfo(str);
 });

 e.on('list menu items',function(str){
   cli.responders.listMenuItems(str);
 });

 e.on('list orders',function(){
   cli.responders.listOrders();
 });

 e.on('more order info',function(str){
   cli.responders.moreOrderInfo(str);
 });

 // Responders object
 cli.responders = {};

 // Help / Man
 cli.responders.help = function(){
   var commands = {
     'man' : 'Kill the CLI (and the rest of the application)',
     'help' : 'Show this help page',
     'exit' : 'Alias of the "man" command',
     'stats' : 'Get statistics on the underlying operating system and resource utilization',
     'list users' : 'Show a list of all registered (undeleted) users in the system',
     'more user info --{userId}' : 'Show details of a specific user',
     'list menu items' : 'Show a list of all menu items',
     'list orders' : 'Show a list of all orders placed in the last 24 hours',
     'more order info --{orderId}' : 'Show details of a specific order'
   };

 // Show a header for the help page that is as wide as the screen
 cli.horizontalLine();
 cli.centered('CLI MANUAL');
 cli.horizontalLine();
 cli.verticalSpace(2);

 // Show each command, followed by its explanation, in white and yellow respectively
 for(var key in commands){
   if(commands.hasOwnProperty(key)){
     var value = commands[key];
     var line = '\x1b[33m'+key+'\x1b[0m';
     var padding = 60 - line.length;
     for(i = 0; i < padding; i++){
       line+=' ';
     }
     line+=value;
     console.log(line);
     cli.verticalSpace();
   }
 }

  cli.verticalSpace();

  // End with another horizontalLine
  cli.horizontalLine();
 };

 // Create a vertical space
 cli.verticalSpace = function(lines){
   lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
   for(i = 0; i < lines; i++){
     console.log('');
   }
 };

 // Create a vertical line across the screen
 cli.horizontalLine = function(){
   // Get the available screen size
   var width = process.stdout.columns;

   var line = '';
   for(i=0; i < width; i++){
     line+='-';
   }
   console.log(line);
 };

 // Create centered text on the screen
 cli.centered = function(str){
   str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';

   // Get the available screen size
   var width = process.stdout.columns;

   // Calculate the left padding there should be
   var leftPadding = Math.floor((width - str.length) / 2);

   // Put in left padding spaces before the string itself
   var line = '';
   for(i=0; i < leftPadding; i++){
     line+=' ';
   }
   line+= str;
   console.log(line);
 };

 // Exit
 cli.responders.exit = function(){
   process.exit(0);
 };

// Stats
cli.responders.stats = function(){
  // Compile and object of stats
  var stats = {
    'Load Average' : os.loadavg().join(' '),
    'CPU Count' : os.cpus().length,
    'Free Memory' : os.freemem(),
    'Current Malloced Memory' : v8.getHeapStatistics().malloced_memory,
    'Peak Malloced Memory' : v8.getHeapStatistics().peak_malloced_memory,
    'Allocated Heap Used (%)' : Math.round((v8.getHeapStatistics().used_heap_size / v8.getHeapStatistics().total_heap_size) * 100),
    'Available Heap Allocated (%)' : Math.round((v8.getHeapStatistics().total_heap_size / v8.getHeapStatistics().heap_size_limit) * 100),
    'Uptime' : Math.round(os.uptime())+' Seconds'
  };

  // Create a header for the stats page
  cli.horizontalLine();
  cli.centered('SYSTEM STATISTICS');
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Show each command, followed by its explanation, in white and yellow respectively
  for(var key in stats){
    if(stats.hasOwnProperty(key)){
      var value = stats[key];
      var line = '\x1b[33m'+key+'\x1b[0m';
      var padding = 60 - line.length;
      for(i = 0; i < padding; i++){
        line+=' ';
      }
      line+=value;
      console.log(line);
      cli.verticalSpace();
    }
  }

  cli.verticalSpace();

  // End with another horizontalLine
  cli.horizontalLine();
};

// List Users
cli.responders.listUsers = function(){
  _data.list('users',function(err, userIds){
    if(!err && userIds && userIds.length > 0){
      cli.verticalSpace();
      userIds.forEach(function(userId){
        if(userId.charAt(0) !== '.'){
          _data.read('users',userId,function(err,userData){
            if(!err && userData){
              var line = 'Name: '+userData.firstName+' '+userData.lastName+' Phone: '+userData.phone+' Orders: ';
              var numberOfOrders = typeof(userData.orders) == 'object' && userData.orders instanceof Array && userData.orders.length > 0 ? userData.orders.length : 0;
              line+=numberOfOrders;
              console.log(line);
              cli.verticalSpace();
            } else {
              console.log("Unable to find any registered users at this time");
              cli.verticalSpace();
            }
          })
        }
      })
    }
  });
};

// More User Info
cli.responders.moreUserInfo = function(str){
  // Get the id from the string that's provided
  var arr = str.split('--');
  var userId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
  if(userId){
    // Lookup the user
    _data.read('users',userId,function(err,userData){
      if(!err && userData){
        // Remove the hashed password
        delete userData.hashedPassword;

        // Print the JSON with text highlighting
        cli.verticalSpace();
        console.dir(userData,{'colors' : true});
        cli.verticalSpace();
      }
    });
  }

};

// List Menu Items
cli.responders.listMenuItems = function(){
  console.log("You asked for menu items");
};

// List Orders
cli.responders.listOrders = function(){
  console.log("You asked for orders");
};

// More Order Info
cli.responders.moreOrderInfo = function(str){
  console.log("You asked for more order info",str);
};


// Input processor
cli.processInput = function(str){
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;
  // Only process the input if the user actually wrote something.
  if(str){
    // Codify the unique strings that indentify the unique questions allowed to be asked
    var uniqueInputs = [
      'man',
      'help',
      'exit',
      'stats',
      'list users',
      'more user info',
      'list menu items',
      'list orders',
      'more order info'
    ];

    // Go through the possible inputs, emit event when a match is found
    var matchFound = uniqueInputs.some(function(input){
      if(str.toLowerCase().indexOf(input) > -1){
        // Emit an event matching the unique input, and include the full string given
        e.emit(input,str);
        return true;
      }
    });

    // if no match is found, tell the user to try again
    if(!matchFound){
      console.log("Sorry, try again");
    }
  }
};



// Init script
cli.init = function(){
  // Send the start message to the console in dark blue
  console.log('\x1b[34m%s\x1b[0m',"The CLI is running");

  // Start the interface
  var _interface = readline.createInterface({
    input: process.stdin,
    output : process.stdout,
    prompt : ''
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle each line of input separately
  _interface.on('line',function(str){
    // Send to the input processor
    cli.processInput(str);

    // Re-initialize the prompt afterwards
    _interface.prompt();
  });

  // If the user stops the CLI, kill the assoicated process
  _interface.on('close',function(){
    process.exit(0);
  });

};










 // Export the module
 module.exports = cli;
