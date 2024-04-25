import passport from "passport";
import local from "passport-local";
import GitHubStrategy from 'passport-github2';
import userModel from "../dao/models/usersModel.js";
import { createHash, isValidPassword } from "../utils/functionsUtil.js";
import dotenv from 'dotenv';
import process from 'process';

dotenv.config();

const localStrategy = local.Strategy;
const initializatePassport = () => {

    const CLIENT_ID = process.env.CLIENT_ID;
    const SECRET_ID = process.env.CLIENT_SECRET;
    
    passport.use('register', new localStrategy(
        {
            passReqToCallback: true,
            usernameField: 'email'
        },
        async (req, username, password, done) => {
            const { first_name, last_name, email, age} = req.body;

            try {
                let user = await userModel.findOne({ email: username});
                if (user) {
                    console.log("User already exist!");
                    return done(null, false);
                }

                const newUser = { first_name, last_name, email, age, password: createHash(password)}
                const result = await userModel.create(newUser);

                return done(null, result);
            } catch (error) {
                return done(error.message);
            }
        }
    ))

    passport.use('login', new localStrategy(
        {
            usernameField: 'email'
        },
        async (username, password, done) => {
            try {
                const user = await userModel.findOne({ email: username });
                if (!user) {
                    const errorMessage = "User does not exist";
                    console.log(errorMessage);
                    return done(null, false);
                }
                
                if (!isValidPassword(user, password)) {
                    return done(null, false);
                }

                return done(null, user);
            } catch(error) {
                console.log(error.message);
                return done(error.message);
            }
        }
    ));

    passport.use('github', new GitHubStrategy({
                clientID: CLIENT_ID,
                clientSecret: SECRET_ID,
                callbackURL: 'http://localhost:8080/api/sessions/githubcallback'
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    console.log(profile); 
                    let user = await userModel.findOne({username: profile._json.email})
                    if(!user) {
                        let newUser = {
                            first_name: profile._json.name,
                            last_name: '',
                            age: 18,
                            email: profile._json.email,
                            password: ''
                        }
                        let result = await userModel.create(newUser);
                        done(null, result);
                    } else {
                        done(null, user);
                    }
                } catch(error) {
                    return done(error);
                }
            }
        )
    );

    passport.serializeUser((user, done) => done(null, user._id));

    passport.deserializeUser(async (id, done) => {
        const user = await userModel.findById(id);
        done(null, user);
    })
}

export default initializatePassport;