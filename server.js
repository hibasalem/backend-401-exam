'use strict';
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');
const express = require('express');
require('dotenv').config();

const server = express();

server.use(cors());
server.use(express.json());
const PORT = process.env.PORT;

mongoose.connect('mongodb://localhost:27017/hibaSalemExam', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const digimonSchema = new mongoose.Schema({
  name: String,
  img: String,
  level: String,
});

const digimonModel = mongoose.model('digimon', digimonSchema);

server.listen(PORT, () => {
  console.log(`listinng on port ${PORT}`);
});

server.get('/', testHandler);
server.get('/allData', allDataHandler);
server.post('/addToFav', addToFavHandler);
server.get('/favData', favDataHandler);
server.delete('/deleteFav/:id', deleteFavHandler);
server.put('/updateData/:id', updateDataHandler);

function testHandler(req, res) {
  res.send(`I am alive`);
}

function allDataHandler(req, res) {
  const url = `https://digimon-api.vercel.app/api/digimon`;
  axios.get(url).then((result) => {
    let dataArr = result.data.map((item) => {
      let newItem = new Digimon(item);
      return newItem;
    });
    res.send(dataArr);
  });
}

function addToFavHandler(req, res) {
  const { name, img, level } = req.body;
  const digimon = new digimonModel({
    name: name,
    img: img,
    level: level,
  });
  digimon.save();
}

class Digimon {
  constructor(data) {
    this.name = data.name;
    this.img = data.img;
    this.level = data.level;
  }
}

function favDataHandler(req, res) {
  digimonModel.find({}, (error, data) => {
    res.send(data);
  });
}

function deleteFavHandler(req, res) {
  const id = req.params.id;
  console.log(id);
  digimonModel.remove({ _id: id }, (error, data) => {
    digimonModel.find({}, (error, data) => {
      res.send(data);
    });
  });
}

function updateDataHandler(req, res) {
  const id = req.params.id;
  const { name, img, level } = req.body;

  console.log(id);
  digimonModel.find({ _id: id }, (error, data) => {
    data[0].name = name;
    data[0].img = img;
    data[0].level = level;
    data[0].save().then(() => {
      digimonModel.find({}, (error, data) => {
        res.send(data);
      });
    });
  });
}
