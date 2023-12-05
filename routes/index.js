var express = require('express');
var router = express.Router();
// const nodemailer = require("nodemailer");
const User = require("../models/expensesmodel");

const passport = require("passport");
const LocalStrategy = require("passport-local");
passport.use(new LocalStrategy(User.authenticate()));
const Expense = require("../models/expenseModel");

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { admin: req.user });
});

router.get('/signup', function(req, res, next) {
  res.render('signup', { admin: req.user });
});
router.get('/signin', function(req, res, next) {
  res.render('signin', { admin: req.user });
});



router.post("/signup", async function(req, res, next) {
  try {
    await User.register(
      { username: req.body.username, email: req.body.email},
  req.body.password);
res.redirect("/signin");

  } catch (error) {
    console.log(error);
    res.send(error)
  }
});

router.post("/signin",
    passport.authenticate("local", {
        successRedirect: "/profile",
        failureRedirect: "/signin",
    }),
    function (req, res, next) {}
);



function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      next();
  } else {
      res.redirect("/signin");
  }
}

router.get('/logout', (req, res, next) => {
  if (req.isAuthenticated())
    req.logout((err) => {
      if (err) res.send(err);
      else res.redirect('/');
    });
  else {
    res.redirect('/');
  }
});


router.get('/reset', isLoggedIn, function (req, res, next) {
  res.render('reset', { admin: req.user });
});

router.post('/reset', isLoggedIn, async function (req, res, next) {
  try {
      await req.user.changePassword(
          req.body.oldpassword,
          req.body.newpassword,
      )
      await req.user.save();
      res.redirect('/profile')
  } catch (error) {
      res.send(error)
  }
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
      next();
  } else {
      res.redirect("/signin");
  }
}


router.get("/forget", function (req, res, next) {
  res.render("forget", { admin: req.user });
});

router.post("/send-mail", async function (req, res, next) {
  try {
      const user = await User.findOne({ email: req.body.email });
      if (!user) return res.send("User not found");

      sendmailhandler(req, res, user);
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});

// function sendmailhandler(req, res, user) {
//   const otp = Math.floor(1000 + Math.random() * 9000);
//   // admin mail address, which is going to be the sender
//   const transport = nodemailer.createTransport({
//       service: "gmail",
//       host: "smtp.gmail.com",
//       port: 465,
//       auth: {
//           user: "anjalisaxena1301@gmail.com",
//           pass: "tqwp jqms ekpk fphi",
//       },
//   });
//   // receiver mailing info
//   const mailOptions = {
//       from: "Dhanesh Pvt. Ltd.<dhanesh1296@gmail.com>",
//       to: user.email,
//       subject: "Testing Mail Service",
//       // text: req.body.message,
//       html: `<h1>${otp}</h1>`,
//   };
//   // actual object which intregrate all info and send mail
//   transport.sendMail(mailOptions, (err, info) => {
//       if (err) return res.send(err);
//       console.log(info);
//       user.resetPasswordOtp = otp;
//       user.save();
//       res.render("otp", { admin: req.user, email: user.email });
//   });
// }

// router.post("/match-otp/:email", async function (req, res, next) {
//   try {
//       const user = await User.findOne({ email: req.params.email });
//       if (user.resetPasswordOtp == req.body.otp) {
//           user.resetPasswordOtp = -1;
//           await user.save();
//           res.render("resetpassword", { admin: req.user, id: user._id });
//       } else {
//           res.send(
//               "Invalid OTP, Try Again <a href='/forget'>Forget Password</a>"
//           );
//       }
//   } catch (error) {
//       res.send(error);
//   }
// });

router.post("/forget/:id", async function (req, res, next) {
  try {
      const user = await User.findById(req.params.id);
      if (!user)
          return res.send("User not found! <a href='/forget'>Try Again</a>.");

      if (user.token == req.body.token) {
          user.token = -1;
          await user.setPassword(req.body.newpassword);
          await user.save();
          res.redirect("/signin");
      } else {
          user.token = -1;
          await user.save();
          res.send("Invalid Token! <a href='/forget'>Try Again<a/>");
      }
  } catch (error) {
      res.send(error);
  }
});


router.get("/profile", isLoggedIn, async function (req, res, next) {
  try {
      const { expenses } = await req.user.populate("expenses");
      console.log(req.user, expenses);
      res.render("profile", { admin: req.user, expenses });
  } catch (error) {
      res.send(error);
  }
});


router.get("/expenses", isLoggedIn, function (req, res, next) {
  res.render("expenses", { admin: req.user });
});

router.post("/expenses", isLoggedIn, async function (req, res, next) {
  try {
      const expense = new Expense(req.body);
      req.user.expenses.push(expense._id);
      expense.user = req.user._id;
      await expense.save();
      await req.user.save();
      res.redirect("/profile");
  } catch (error) {
      res.send(error);
  }
});

// router.get("/filter", async function (req, res, next) {
//   try {
//       let { expenses } = await req.user.populate("expenses");
//       expenses = expenses.filter((e) => e[req.query.key] == req.query.value);
//       res.render("profile", { admin: req.user, expenses });
//   } catch (error) {
//       console.log(error);
//       res.send(error);
//   }
// });


router.get("/filter", async function (req, res, next) {
  try {
      let { expenses } = await req.user.populate("expenses");
      expenses = expenses.filter((e) => e[req.query.key] == req.query.value);
      res.render("profile", { admin: req.user, expenses });
  } catch (error) {
      console.log(error);
      res.send(error);
  }
});

router.get("/history",function(req,res,next){
  res.render("history",{admin: req.user})
})

router.get('/delete/:id',async function (req,res,next){
  try {
    await Expense.findByIdAndDelete(req.params.id)
    res.redirect('/profile')
  } catch (error) {
    res.send(error)
  }
});

router.get('/update/:id', isLoggedIn, async function (req, res, next) {
    try {
        const data = await Expense.findById(req.params.id)
        res.render('update', { admin:req.user, data })
    } catch (error) {
        res.send(error)
    }
});

router.post('/update/:id', isLoggedIn, async function (req, res, next) {
    try {
        const data = await Expense.findByIdAndUpdate(req.params.id, req.body)
        await data.save()
        res.redirect('/profile')
    } catch (error) {
      res.send(error)
    }
})


module.exports = router;
