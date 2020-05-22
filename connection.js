const elasticsearch = require('elasticsearch')
const index = 'actual_data'
const port = 9200
const host = 'localhost'
const client = new elasticsearch.Client({host:{host,port}})
// console.log(client)
var selectedFilter = 'content';

const webPort = 8080;
var express = require('express'),
app = express();
var bodyParser = require('body-parser');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
   extended: false
}));
app.use(bodyParser.json());

app.get('/', function(req, res){
	res.render('form')	
   	res.sendFile("index.html")
});
  
app.post('/', function(req,res){
	var searchValue = req.body.myinput;
	var filter = req.body.filter;
	console.log(filter)
	var htmlData = ''

	if (filter.includes('titleSearch'))
		selectedFilter = 'title'
	else if (filter.includes('contentSearch'))
		selectedFilter = 'content'
	else if (filter.includes('authSearch'))
		selectedFilter = 'author'

	queryTerm(searchValue, selectedFilter).then(results => {
		htmlData = htmlData + 'Search by : ' + selectedFilter + '<br>'
		htmlData = htmlData + 'Query Term : ' + searchValue + '<br>'
		htmlData = htmlData + 'Total Results = ' + results.hits.hits.length + '<br><hr>'
		results.hits.hits.forEach(element => {
			// res.send(results.hits.hits);
			htmlData = htmlData + '<b>Title</b> : ' + element._source.title + '<br>'
			htmlData = htmlData + '<b>Language</b> : ' + element._source.language + '<br>';
			htmlData = htmlData + '<b>Author</b> : ' + element._source.author + '<br>';
			// console.log(typeof(element._source.content))
			var strContent = element._source.content
			strContent = strContent.slice(3,13)
			htmlData = htmlData + '<b>Content</b> : ' + strContent + '<br><hr>';

		});
		res.send(results)
		// res.send(results.hits.hits)
	})
});
  
app.listen(webPort);

async function checkConnection(){
	var isConnected = false;
	while(!isConnected){
		console.log('trying to connect to elasticsearch client')
		try{
			const health = await client.cluster.health({})
			// console.log(health)
			console.log('connection successful')
			isConnected = true;
		}catch(error){
			console.log('connection failed', error)
		}
	}
}

checkConnection()

// const type = '100Books'
function queryTerm(term,filter,offset=0){
	var body = new Object();
	var matchWork = new Object();
	var queryObject = new Object();
	var outerQueryObject = new Object();
	queryObject['query'] = term;
	queryObject['operator'] = 'and';
	queryObject['fuzziness'] = 'auto';
	matchWork[filter] = queryObject;
	outerQueryObject['match'] = matchWork;
	body['size'] = '100';
	body['query'] = outerQueryObject;
	// const body = {
	// 	size: '100',
	// 	query: {
	// 		match: {
	// 			content: {
	// 				query: term,
	// 				operator: 'and',
	// 				fuzziness: 'auto'	
	// 			}
	// 		}
	// 	}
	// }
	console.log(body)
	return client.search({index,body})
}


var body
async function mySearch(term){
	try{
		// console.log("Inside try block")	
		 body = await queryTerm(term,0)
		 return body
	}catch(error){
		console.log(error)
	}
}

// console.log(body)

