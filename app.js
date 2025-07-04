const express = require('express');
const tasksRoute = require("./routes/admin")
const authRoute = require("./routes/auth")
const app = express()
const bodyParser = require("body-parser")
const DBConcction = require('./util/database').DBConcction
const multer = require('multer')
const path = require("path")
const cors = require('cors')
const swaggerUi = require('swagger-ui-express');
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerDocument = require('./swagger.json');
require("dotenv").config();
const port = process.env.PORT;
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>
// const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyParser.json()); // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
);
app.use('/images', express.static(path.join(__dirname, 'images')));

const corsOptions = {
  origin: ['http://localhost:4200', 'https://your-angular-app.vercel.app'], // add both dev & prod frontends
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET , POST , PUT , PATCH , DELETE")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type , Authorization")
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next()
})
app.use('/tasks', tasksRoute)
app.use('/auth', authRoute)

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ message: message });
});
DBConcction(() => {
  app.listen(port)
})
