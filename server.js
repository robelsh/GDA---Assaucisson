/**
**  Implémentation de la partie serveur avec Node JS
**  Cette partie effectue les fonctionnalités que firebase
**  n'est pas capable de réaliser (Upload d'images, envois de mails)
*/
//On regroupe ci-dessous les packages NPM indispensables à notre partie serveur
require( 'dotenv' ).load();
const path = require('path');
const AWS = require('aws-sdk');
const express = require('express');
const webpack = require('webpack');
const bodyParser = require('body-parser');
const sendgrid = require('sendgrid')('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');
const webpackMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const config = require('./webpack.config.js');
const multer = require('multer');
const s3 = require('multer-storage-s3');

//En fonction du mode (production ou développement), on intégre différentes fonctionnalités
const isDeveloping = process.env.NODE_ENV !== 'production';
const port = isDeveloping ? 8080 : process.env.PORT;

//On appelle express permettant à Node JS de gérer l'application
//comme par exemple l'écoute sur un port
const app = express();
//On a mis en place un système d'upload d'image depuis Amazon S3
//Il est possible de rejoindre le store de Amazon S3 avec les identifiants
//présents sur le README de github
var storage =   s3({
  destination: function(req, file, cb){
    cb(null, '');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname.toLowerCase());
  },
  bucket: 'assaucisson',
  region: 'us-west-2'
});
var upload = multer({ storage : storage});

if (isDeveloping) {
  const compiler = webpack(config);
  const middleware = webpackMiddleware(compiler, {
    publicPath: config.output.publicPath,
    contentBase: 'src',
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
  });

  app.use(middleware);
  app.use(webpackHotMiddleware(compiler));
  app.get('*', function response(req, res) {
    res.write(middleware.fileSystem.readFileSync(path.join(__dirname, 'dist/index.html')));
    res.end();
  });
} else {
  app.use(express.static(__dirname + '/dist'));
  app.get('*', function response(req, res) {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
  });
}
app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json());

//On gère ici la mise en place de l'envoi des mails
// soit à une liste de diffusion soit à un seul adhérent
const email = new sendgrid.Email();

app.post('/dashboard', function(req, res){
  email.setTos(req.body.to.split(","));
  email.setFrom(req.body.from);
  email.setSubject(req.body.subject);
  email.setHtml(req.body.text);

  sendgrid.send(email, function(err, json){
    if(err) { return console.error(err);}
    console.log(json);

  });
  res.redirect('#/dashboard/members');
});
//Envoi d'un mail lors de l'inscription de l'association à chaque membre de cette dernière
function sendInscription(req,res,link){
  email.setTos(req.body.emails.split(","));
  email.setFrom('contact@assaussison.com');
  email.setSubject(`Bienvenue cher assaucissié(e) dans l'association ${req.body.association}`);
  email.setHtml(`Bonjour Assaucissié(e), <br/><br/>Le gérant de l'association <b>${req.body.association}</b> vous invite à le rejoindre sur l'application <b>Assaucissons-nous !</b> Pour vous connecter, cliquez <a href="https://assaucisson.herokuapp.com">ici</a> !<br/><br/>Si vous n'avez pas déjà de compte, vous allez recevoir un email contenant vos identifiants.<br />Nous vous prions de bien vouloir modifier le mot de passe dès votre première connexion.<br/><br/>Merci et assaucissez-vous !`);
  sendgrid.send(email, function(err, json){
    if(err) { return console.error(err);}
    console.log(json);
  });
  res.redirect(link);
}

app.post('/login', (req,res)=>sendInscription(req,res,'#/login'));
app.post("/sendIns", (req,res)=>sendInscription(req,res,'#/dashboard/members'));

app.post('/upload', upload.single('photo'), function(req, res, next){
  console.log(req.file);
  res.redirect('#/dashboard/members')
  res.end("File uploaded");

});
//On écoute sur le port 8080 par défaut
app.listen(port, function onStat(err){
  if (err) {
    console.log(err);
  }
  console.info('==> Listening on port %s. Open up in your browser.',port);
});
