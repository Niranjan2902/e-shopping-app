const path = require('path');
const fs=require('fs');

//FOR SECURITY
const express = require("express");
const helmet=require('helmet');
const compression=require('compression');
const morgan=require('morgan');
const app = express();
const port = process.env.PORT || 8004;
require('dotenv').config();
const https=require('https');
//ROUTES
const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoute = require("./routes/auth")

const Product = require('./models/product')
const User = require('./models/user')
const Cart = require('./models/cart')
const CartItem = require('./models/cart-items')
const Order = require('./models/order')
const OrderItem = require('./models/order-items')
const csrf=require('csurf')
const csrfProtection=csrf();
const flash=require('connect-flash')
const multer=require('multer')

//VIEWS
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));
//app.use(session({secret:'AdminSecret#123',resave:false,saveUninitialized:false}))

// initalize sequelize with session store
const session=require('express-session');
const sequelize = require('./utils/database');
const SequelizeStore = require("connect-session-sequelize")(session.Store);

//MIDDLEWARES
const imgStorage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'images')
  },
  filename:(req,file,cb)=>{
    cb(null,`${Date.now()}-${file.originalname}`)
  }
});

const fileFilter=(req,file,cb)=>{
  if(
    file.mimetype==='image/png' || file.mimetype==='image/jpeg' || file.mimetype==='image/jpg'
  ){
    cb(null,true)
  } else{
    console.log("INCORRECT FILE TYPE")
    cb(null,false)
  }
};

app.use(express.urlencoded({ extended: false }));
app.use(multer({storage:imgStorage, fileFilter:fileFilter}).single('imageUrl'))
app.use(express.static(path.join(__dirname, 'Public')));
app.use('/images',express.static(path.join(__dirname, 'images')));
//FOR SECUIRTY AND PERFORMANCE OPTIMIZATION

const accessLogStream=fs.createWriteStream(path.join(__dirname,'access.log'),
{flags:'a'})

// app.use(helmet());
app.use(compression());
app.use(morgan('combined',{stream:accessLogStream}));

const privateKey=fs.readFileSync('server.key')
const certificate=fs.readFileSync('server.cert')

// configure express
app.use(
  session({
    secret: "Eshop#123",
    store: new SequelizeStore({
      db: sequelize,
    }),
    resave: false, // we support the touch method so per the express-session docs this should be set to false
    saveUninitialized: false,
    proxy: true, // if you do SSL outside of node.

     cookie: {
      secure: false, // set this to true if using HTTPS
      httpOnly: true, // Important for security
      maxAge: 1000 * 60 * 60 * 24, // Optional: 1 day session expiration
    },
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
    console.log('res.locals.isAuthenticated',req.session.isLoggedIn ,)
  res.locals.isAuthenticated = req.session.isLoggedIn || false;
  next();
});

//WHILE WORKING WITH NORMAL MYSQL2
//const db=require('./utils/database')
//const rootDir=require('./utils/path')

// db.execute('select * from products')
// .then((result)=>{console.log(result[0])}).catch(err=>console.log(err));


//USING USER AVAILBLE
app.use((req, res, next) => {
    if (!req.session.user) {
    return next();
  }
  User.findByPk(req.session.user.id)    //OR req.user
    //User.findByPk(11)
    
    .then(user => {
      //throw new Error("DUMMY ERR")
         req.user = user;
         next();
    })
    .catch(err =>{
      console.log(err);
      next(new Error(err))
      //throw new Error(err) THIS STILL ISNT WORK AS CODE IS IN ASYNC BLOCK
    })
});

app.use((req,res,next)=>{
    res.locals.isAuthenticated=req.session.isLoggedIn;
    res.locals.csrfToken=req.csrfToken();
    next()
})

//ROUTES
app.use("/admin", adminRoutes);
app.use(authRoute);
app.use(shopRoutes);

app.get('/500',(req, res, next) => {
    res.status(500).render('500_err');
});

app.use((req, res, next) => {
    res.status(404).render('notFound');
});

app.get((error,req,res,next)=>{
  // res.status(error.httpStatusCode).render(...); THIS CODE CAN BE USED WHILE DEALING WITH JSON
   res.status(500).render('500_err');
})

//ASSOCIATIONS
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
//Order.belongsToMany(Product,{through:CartItem})
Order.belongsToMany(Product, { through: OrderItem });


//sequelize.sync({force:true})
// sequelize.sync()
//     .then(result => {
//         return User.findByPk(2);
//     })
//     .then(user => {
//         if (!user) {
//             return User.create({ username: 'Robert', email: 'rober@test.com' })
//                 .then(user => user.createCart()); // Create a cart for the user
//         }
//         return user.createCart();  // Ensure cart is created for existing user
//     })
//     .catch(err => console.log("Error syncing database:", err));

//sequelize.sync({force:true})
sequelize.sync()
    // .then(result => {
    //     return User.findByPk(1); // Find user with ID 1
    // })
    // .then(user => {
    //     if (!user) {
    //         return User.create({ name: 'Max', email: 'test@test.com' }); // Create user if not exists
    //     }
    //     return user;
    // })
    // .then(user => {
    //     // Check if the cart exists, if not, create it
    //     return user.getCart().then(cart => {
    //         if (!cart) {
    //             return user.createCart(); // Create a new cart if not exists
    //         }
    //         return cart; // Return existing cart
    //     });
    // })
    .then(cart => {
        // Now the cart is either existing or newly created
        app.listen(3000);
    })
    .catch(err => console.log(err));
https.createServer({key:privateKey,cert:certificate},app).listen(port, () => console.log(`server started at port ${port}`))