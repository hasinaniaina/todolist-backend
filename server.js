import express from "express";
import Controller from "./controller/controller.js";
import Settings from "./utils/setting.js";
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors({
    credentials: true, 
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST']
}));



const settings = new Settings(app);
const controller = new Controller(app);
controller.router();



