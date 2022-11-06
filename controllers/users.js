const User = require("../models/user")

module.exports.renderRegister = (req,res)=>{
    res.render("auth/register")
}
module.exports.register  = async(req,res,next)=>{
    try{
        const {username,password, email} = req.body
        const u = new User({username, email})
        const newU = await User.register(u, password)
        req.login(newU, e =>{
            if(e) next(e);
            req.flash("success", `Hi, ${newU.username}`)
            res.redirect("/campgrounds")
        })
        
    }catch(e){
        req.flash("error", e.message)
        res.redirect("/register")
    }
    
}
module.exports.renderLogin = (req,res)=>{
    if(req.query.returnTo){
        req.session.returnTo = req.query.returnTo
    }
    res.render("auth/login")
}
module.exports.login = async(req,res)=>{
    
    req.flash("success", `Welcome back, ${req.body.username}`)
    const redirectUrl = req.session.returnTo || "/campgrounds"
    delete req.session.returnTo
    res.redirect(redirectUrl)
}
module.exports.logout = (req,res, next)=>{
    req.logout(function(e){
        if(e) {next(e)}
        req.flash("success", "Goodbye!")
        res.redirect("/campgrounds")
    })
}