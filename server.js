const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// Express Basic Configuration
const port = 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.use(express.urlencoded({extended: true}));


// MongoDB Basic Configuration
mongoose.connect(process.env['MONGO_URI'], { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = mongoose.Schema({
	url: {type: String, required: true}
});

let Url = mongoose.model("Url", urlSchema);


// Routes
app.get('/', (req, res) => {
	res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function(req, res) {
	res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', async (req, res) => {
	const urlOriginal = req.body['url'];
	const isValidUrl = (str) => {
  		const regex = /^https?:\/\/(www.)?[\w-\.]+.\w{2,}/ // https://www.example.com 
  		return regex.test(str)
	}

	if (isValidUrl(urlOriginal)) {
		const register = new Url({url: urlOriginal});
		const query = await Url.findOne({url: urlOriginal})

		if ( !query ) {
			register.save((err, document) => {
				if (err) console.log(err)
				const response = {
					original_url: document.url,
					short_url: document._id
				}
				res.json(response)
			})
		} else {
			res.json({
				original_url: urlOriginal,
				short_url: query._id
			})
		}
	} else {
		res.json({
			error: "invalid url"
		});
	}
});

app.get("/api/shorturl/:url", async (req, res) => {
	const url = req.params['url'];
	const queryObject = {_id: url}
	await Url.findOne(queryObject, (err, document) => {
		if (err) console.log(err);
		res.redirect(document.url)
	})
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
