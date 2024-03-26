const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
require('dotenv/config')
const authJwt = require('./helper/jwt')
const errorHandler = require('./helper/errorHandler')


const productRouter = require('./router/products')
const categoriesRoutes = require('./router/categories');
const usersRoutes = require('./router/users');
const ordersRoutes = require('./router/orders');
// const swagger = require('./swagger');
const myport = 'https://melodious-sawine-f11227.netlify.app'

app.use(cors)
app.options('*',cors())



const api = process.env.API_URL
const connection = process.env.CONNECTION_STRING

app.use(bodyParser.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use(errorHandler)
app.use('/public/uploads',express.static(__dirname + '/public/uploads'))

app.use(`${api}/products`, productRouter)
app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);

// swagger(app)

mongoose.connect(connection).then(()=>{
    console.log('successfully connected')
    }).catch((error)=>{console.log(error)})



app.listen(myport,()=>{
    
    console.log('app is listening on port 3000')
})
