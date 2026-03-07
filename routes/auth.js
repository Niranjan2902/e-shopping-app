const express=require('express');
const { getLogin, setLogin, getSignup, setSignup,setLogout,getResetPass,setResetPass, getNewPass, setNewPass } = require('../controllers/auth');
const router=express.Router();
const expValidator=require('express-validator')
const {check,body}=require('express-validator')
router.get('/login',getLogin)
router.post('/login',setLogin)

router.get('/signup',getSignup)
router.post('/signup',[check('email')
.isEmail().withMessage("Please enter a valid email")
.normalizeEmail().custom((value,{req})=>{
    if(["test@test.com"||'dummy@test.com' ||'bot@gmail.com'].includes(value)){
        throw new Error('This account is suspended!!!')
    }
    return true;
    ////ADDING ASYNC VALIDATION
    // return User.findOne({ where: { email: value } })
    //     .then(user => {
    //         if (user) {
    //             return Promise.reject('Email already exist please pick up new one!');
    //         }
    //     })
}),
// body('password')
//   .isLength({ min: 8 }) // Ensure password is at least 8 characters long
//   .matches(/[A-Za-z]/) // At least one letter (upper or lowercase)
//   .matches(/[A-Z]/) // At least one uppercase letter
//   .matches(/[a-z]/) // At least one lowercase letter
//   .matches(/\d/) // At least one number
//   .matches(/[!@#$%^&*(),.?":{}|<>]
//   .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
body('password')
.isLength({min:8})
.custom((value,{req}) => {
    if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value) || !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      throw new Error('Password must have at least one uppercase letter, one lowercase letter, one number, and one special character.');
    }
    return true;
  })
  .trim(),
  body('confirmpassword').custom((value,{req})=>{
    if(value!==req.body.password){
        throw new Error('passwords have to match!');
    }
    return true;
  })
]
,setSignup)

router.get('/reset-password',getResetPass)
router.post('/reset-password',setResetPass)

router.get('/reset-password/:token',getNewPass)
router.post('/new-password',setNewPass)

router.post('/logout',setLogout)
module.exports=router;