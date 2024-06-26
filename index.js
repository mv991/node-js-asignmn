require('dotenv').config();

const mongoose = require("mongoose");
const  createServer  = require('./createServer');

const app = createServer();

const PORT = 3000
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server Port: ${PORT}`));
  })
  .catch((error) => console.log(`${error} did not connect`));