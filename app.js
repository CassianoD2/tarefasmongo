var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();

// Cria Conexão com o Banco 
// Conexão na base de dados tarefas da máquina local (localhost)
mongoose.connect("mongodb://localhost/tarefas", { useMongoClient: true });

// Verifica conexão com MongoDB
var dbMongo = mongoose.connection;
dbMongo.on('error', console.error.bind(console, 'Não foi possível se conectar no MongoDB!'));
dbMongo.once('open', function () {
	console.log('Aplicação conectada no MongoDB');
});

// Vamos criar um modelo baseado em um schema (http://mongoosejs.com/docs/guide.html) do Mongoose
// Tipos podem ser definidos http://mongoosejs.com/docs/schematypes.html
var Tarefa = mongoose.model('tarefas',
	new mongoose.Schema({
		descricao: { type: String, required: [true, 'Descrição é obrigatória!'] }
	}));

// Configuração do Renderizador de Páginas (EJS)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Captura o caminho '/' na URL
app.get('/', function (req, res) {
	var titulo = 'Lista de Tarefas';

	Tarefa.find({}, function (err, tarefas) {
		if (err) {
			console.error(err);
			res.status(500).send('Erro na aplicação: ' + err.message);
		} else {
			res.render('tarefas', {
				titulo: titulo,
				tarefas: tarefas
			})
		}
	});
});

app.post('/tarefa/adicionar', function (req, res) {
	var tarefa = req.body.tarefa;

	new Tarefa({ 'descricao': tarefa }).save((err, objTarefaLocal) => {
		if (err) {
			console.error(err);
			res.status(500).send('Erro na aplicação: ' + err.message);
		} else {
			console.log('Tarefa Adicionada ...');
			res.redirect('/');
		}
	});
});

app.post('/tarefa/remover', function (req, res) {
	var tarefasParaRemover = req.body.tarefas;

	if (typeof tarefasParaRemover != 'object') {
		tarefasParaRemover = [tarefasParaRemover];
	}

	for (var posicao = 0; posicao < tarefasParaRemover.length; posicao++) {
		console.log(tarefasParaRemover[posicao]);
		Tarefa.remove({ '_id': mongoose.Types.ObjectId(tarefasParaRemover[posicao]) }, function (err) {
			if (err) {
				console.error(err);
				res.status(500).send('Erro na aplicação: ' + err.message);
			}
		});
	}

	res.redirect('/');
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function () {
	console.log('Servidor Inicializado na Porta', app.get('port'));
});

module.exports = app;