/** @type {import('sequelize').ModelStatic<any>} */
// 👆 This comment is ONLY for editor auto-suggestions (IntelliSense).
// 👆 It is NOT required by Sequelize and has ZERO effect at runtime.
const User = require('../models/user')
const bcryptjs = require('bcryptjs')
const nodemailer = require('nodemailer')
const crypto = require('crypto')

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.BREVO_USER_ID,
        pass: process.env.BREVO_API,
    }
});
// const transporter=nodemailer.createTransport(sendgridTransport({
//   auth:{
//     api_key:process.env
//   }
// }))
// function getLogin(req, res, next) {
//     //const isLoggedIn=req.get('Cookie').split(';')[0].trim().split('=')[1]=='true';
//     console.log(req.session.isLoggedIn)
//     res.render('auth/login', {
//         path: '/login', 
//         title: 'login',
//         activeTab: 'login',
//         isAuthenticated: req.session.isLoggedIn || false
//     });
// };

// function setLogin(req, res, next) {
//     console.log('req received at signup')
//     //res.setHeader('Set-Cookie','loggedIn=true; Max-Age=10')
//     req.session.isLoggedIn = true;
//     res.redirect('/');
// };

function getLogin(req, res, next) {
    console.log('isLoggedIn:', req.session.isLoggedIn);  // Debugging
    res.render('auth/login', {
        path: '/login',
        title: 'login',
        activeTab: 'login',
        isAuthenticated: req.session.isLoggedIn || false,
        errMessege: req.flash('error'),
        oldInput: { email: '', password: '' },
        ValidationErrors: []
    });
};

function setLogin(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req)
    //KEEPING USER INPUT
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render('auth/login', {
            path: '/login',
            title: 'Login',
            activeTab: 'login',
            errMessege: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            },
            ValidationErrors: errors.array()
        })
    };
    //User.findByPk(1)  // Find the dummy user with ID 1
    User.findOne({ where: { email: email } })
        .then(user => {
            if (!user) {
                //OLDER APPROACH

                // req.flash('error', 'Invalid email')
                // //console.log('User not found!');
                // return res.status(422).redirect('/login');


                return res.status(422).render('auth/login', {
                    path: '/login',
                    title: 'Login',
                    activeTab: 'login',
                    errMessege: 'Invalid Email',
                    oldInput: {
                        email: email,
                        password: password
                    },
                    ValidationErrors: [{ path: 'email', path: 'password' }]

                    //console.log('User not found!');

                })
            }
            bcryptjs.compare(password, user.password)
                .then(domatch => {
                    if (domatch) {
                        // Set session variables
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        // Ensure session is saved before redirect
                        return req.session.save((err) => {
                            // if (err) {
                            console.log('Error saving session:', err);
                            //     return res.redirect('/login');
                            // };
                            res.redirect('/');  // Redirect to homepage after successful login
                        });
                    }
                     //OLDER APPROACH
                    // req.flash('error', 'Invalid password, Try again!')
                    // res.redirect('/login')
                    
                    return res.status(422).render('auth/login', {
                        path: '/login',
                        title: 'Login',
                        activeTab: 'login',
                        errMessege: 'Invalid password, please try again!',
                        oldInput: {
                            email: email,
                            password: password
                        },
                        ValidationErrors: [{ path: 'email', path: 'password' }]
                    })
                })
                .catch(err => console.log(err))
        })
        .catch(err => {
            console.log('Error finding user:', err);
            res.redirect('/login');
        });
};

function setLogout(req, res, next) {
    req.session.destroy((err) => {
        console.log(err)
        res.redirect('/');
    })
};

function getSignup(req, res, next) {
    res.render('auth/login', {
        path: '/signup',
        title: 'Sign In',
        activeTab: 'signup',// Pass the active tab value
        isAuthenticated: req.isLoggedIn,
        errMessege: req.flash('error'),
        oldInput: { username: '', email: '', password: '' },
        ValidationErrors: []
    });
};

function setSignup(req, res, next) {
    console.log('req received at signup');
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(errors.array())
        return res.status(422).render('auth/login', {
            path: '/signup',
            title: 'Sign In',
            activeTab: 'signup',
            errMessege: errors.array()[0].msg,
            oldInput: { username: username, email: email, password: password, confirmpassword: req.body.password },
            ValidationErrors: errors.array()
        })
    }
    User.findOne({ where: { email: email } })
        .then(user => {
            if (user) {
                req.flash('error', 'email aleady exist!')
                console.log('Email already exists! please try with another one.');
                return res.redirect('/signup');
            }
            return bcryptjs.hash(password, 12)
                .then(hashedPassword => {
                    // If user doesn't exist, create a new user
                    const newUser = new User({
                        username: username,
                        email: email,
                        password: hashedPassword
                    });
                    return newUser.save(); // Save the new user
                })
                .then(newUser => {
                    console.log('New user created:', newUser);

                    // Check if the cart exists, if not, create it
                    return newUser.getCart().then(cart => {
                        if (!cart) {
                            return newUser.createCart(); // Create a new cart if not exists
                        }
                        return cart; // Return existing cart
                    });
                })
                .then(() => {
                    // Redirect to the products page after successful signup and cart creation
                    res.redirect('/login');
                    return transporter.sendMail({
                        to: email,
                        from: 'niranjankhavale29@gmail.com',
                        subject: 'Signup succeeded!',
                        html: '<h1>You successfully signed up!</h1>'
                    });
                })

        })
        .catch(err => {
            console.log(err);
            // You may want to send an error response in case of failure
            res.status(500).send('Internal Server Error');
        });
};
const { Op, ValidationError } = require('sequelize');
const { validationResult } = require('express-validator');
function getResetPass(req, res, next) {
    res.render('auth/reset-pass', {
        path: '/login',
        title: 'Reset Password',
        // Pass the active tab value
        isAuthenticated: req.isLoggedIn,
        errMessege: req.flash('error'),
        postdata: true
    });
};
function setResetPass(req, res, next) {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log("err", err);
            return res.redirect('/reset-password')
        };
        const token = buffer.toString('hex');
        User.findOne({ where: { email: req.body.email } })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found!,create a account.')
                    return res.redirect('/reset-password');
                }
                user.resetToken = token;
                user.resetTokenExpiration = new Date(Date.now() + 900000);
                //console.log("After assigning:", user.resetTokenExpiration); // 15 minutes from now
                return user.save()
            })
            .then(result => {
                res.redirect('/');
                return transporter.sendMail({
                    to: req.body.email,
                    from: process.env.SOURCEMAIL,
                    subject: 'Password reset For your ezyshop account',
                    html: `<h1>You have been requested for a password reset.</h1>
                        <p>To proceed please click on the link below to set a new password.</p>
                        <a href="http://localhost:8004/reset-password/${token}">Click This link to reset</a>`
                });
            })
            .catch(err => {
                console.log(err)
            })
    })
};

function getNewPass(req, res, next) {
    const token = req.params.token;
    User.findOne({ where: { resetToken: token, resetTokenExpiration: { [Op.gt]: Date.now(), } } })
        .then(user => {
            console.log('User', user.id)
            res.render('auth/reset-pass', {
                path: '/new-password',
                title: 'New Password',
                isAuthenticated: req.isLoggedIn,
                errMessege: req.flash('error'),
                userId: user.id,
                passwordToken: token,
                postdata: false
            });
        })
        .catch(err => console.log(err))
};

function setNewPass(req, res, next) {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({
        resetToken: passwordToken,
        resetTokenExpiration: { [Op.gt]: Date.now(), },
        id: userId
    })
        .then(user => {
            resetUser = user;
            return bcryptjs.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = null;
            resetUser.resetTokenExpiration = null; //IF ERR SET undefined instead of null
            return resetUser.save();
        })
        .then(result => {
            req.flash('error', 'Password Changes successfully!🎉')
            res.redirect('/login')
        })
        .catch(err => console.log(err));
};

module.exports = {
    getLogin,
    setLogin,
    setLogout,
    getSignup,
    setSignup,
    getResetPass,
    setResetPass,
    getNewPass,
    setNewPass
}