if(process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}
const express = require("express")
const app = express()
const path = require("path")
const session = require("express-session")
const flash = require("connect-flash")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const mongoose = require("mongoose")
const ExpressError = require("./utils/ExpressError")
const passport = require("passport")
const passportLocal = require("passport-local")
const User = require("./models/user")
const helmet = require("helmet")

const userRoutes = require("./routes/users")
const campgroundRoutes = require("./routes/campground")
const reviewRoutes = require("./routes/reviews")
const mongoSanitize = require('express-mongo-sanitize')


mongoose.connect("mongodb://localhost:27017/yelp-camp")

const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", ()=>{
    console.log("DB CONNECTED")
})

app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))


app.use(express.urlencoded({extended: true}))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, "public")))
app.use(mongoSanitize({
    replaceWith: '_'
}))
/* app.use(helmet())

const scriptSrcUrls = [
    "https://media.timeout.com/",
    "https://cdn.jsdelivr.net/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://media.timeout.com",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://media.timeout.com/"
];
const connectSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
    "https://media.timeout.com/"
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                `https://res.cloudinary.com/da9pmrlsx/`, //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
); */

const sessionConfig = {
    secret: "tajna",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())

passport.use(new passportLocal(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())


app.use((req,res,next)=>{
    if(!["/login","/logout"].includes(req.originalUrl)){
        req.session.returnTo = req.originalUrl
    }
    res.locals.user = req.user
    res.locals.success = req.flash("success")
    res.locals.deleted = req.flash("deleted")
    res.locals.edited = req.flash("edited")
    res.locals.error = req.flash("error")
    next()
})


app.use("/campgrounds", campgroundRoutes)
app.use("/campgrounds/:id/reviews", reviewRoutes)
app.use("/", userRoutes)


app.get("/", (req,res)=>{
    res.render("home")
})

app.all("*", (req,res,next)=>{
    next(new ExpressError(404, "Page Not Found"))
})

app.use((err,req,res,next)=>{
    const {status = 500} = err

    if(!err.message) err.message="Something Went Wrong"

    res.status(status).render("error", {err})
})


app.listen(3000, ()=>{
    console.log("LISTENING 3000!")
})