import {Router} from 'express';
import passport from 'passport';

const usersRouter = Router();

// API Register
usersRouter.post("/register", passport.authenticate("register", { failureRedirect: "/api/sessions/failRegister" }), async (req, res) => {
    req.session.failRegister = false;
    res.redirect("/login");
});

// API Failed Register
usersRouter.get("/failRegister", async (req, res) => {
    req.session.failRegister = true;
    res.redirect("/register");
});

// API Login
usersRouter.post("/login", passport.authenticate("login", { failureRedirect: "/api/sessions/failLogin" }), async (req, res) => {
    req.session.failLogin = false;

    if (!req.user) {
        req.session.failLogin = true;
        return res.redirect("/login");
    }

    req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        role: "Usuario"
    }

    return res.redirect("/allproducts");
});

// API Failed Login
usersRouter.get("/failLogin", async (req, res) => {
    req.session.failLogin = true;
    res.redirect("/login");
});

// API Login with Github
usersRouter.get("/github", passport.authenticate('github', {scope: ['user:email']}), (req, res) => {
    res.send({
        status: 'success',
        message: 'Success'
    });
});

// API Login Callback with Github
usersRouter.get("/githubcallback", passport.authenticate('github', {failureRedirect: "/api/sessions/failLogin"}), (req, res) => {
    req.session.user = req.user;
    res.redirect('/allproducts');
});

// API Logout
usersRouter.post("/logout", (req, res) => {
    req.session.destroy(error => {
        if (!error) return res.redirect("/login");
        res.send({
            status: "Logout ERROR",
            body: error
        });
    })
});

export default usersRouter;