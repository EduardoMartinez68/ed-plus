//we will watch if the user is login
module.exports={
    isLoggedIn(req,res,next){
        if(req.isAuthenticated()){
            return next();
        }
        return res.redirect('/links/login');
    },

    isNotLoggedIn(req,res,next){
        if(!req.isAuthenticated()){
            return next();
        }
        return res.redirect('/links/home');
    }
};