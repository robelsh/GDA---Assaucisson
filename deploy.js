// Quand on lance un npm install sur heroku, un npm postinstall va aussi se lancer
//Deploy.js doit se lancer essentiellement dans le cas d'une production
if (process.env.NODE_ENV === 'production') {

  // Nous mettons en place un package Child Process qui permet de lancer un processus en parallèle
  // Nous créons alors le bundle de notre application avec ce processus
  var child_process = require('child_process');
  child_process.exec("webpack -p --config ./webpack.production.config.js", function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}
