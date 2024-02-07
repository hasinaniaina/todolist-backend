
import session from "express-session";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import 'dotenv/config'

const Settings = class {
    constructor(app) {
        const dbOptions = { useNewUrlParser: true, useUnifiedTopology: true };
        const port      = 3000;

        mongoose.connect("mongodb+srv://hasinaniaina:hmsinmniminm1994@cluster0.if2rbyf.mongodb.net/?retryWrites=true&w=majority", dbOptions)
            .then(() => console.log('Db Connected'))
            .catch((error) => console.log('Db not connected: ' + error));


        app.use(cookieParser());

        if (process.env.SITEMODE == "Prod") {
            app.use(session({
                key: "userInfo",
                secret: 'secret',
                resave: false,
                saveUninitialized: true,
                cookie: {
                    maxAge: 1000 * 60 * 60* 24,
                    secure: true,
                    httpOnly:true,
                    sameSite: "none"

                }
            }));
        } else {
            app.use(session({
                key: "userInfo",
                secret: 'secret',
                resave: false,
                saveUninitialized: true,
                cookie: {
                    expires: 60 * 60* 24
                }
            }));
        }

        app.use(bodyParser.urlencoded({extended:true}));


        app.listen(port, () => {
            console.log("Connected to the server");
        });
    }
}

export default Settings