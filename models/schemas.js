import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: { type: String },
    email: { type: String },
    password: { type: String },
    photo: { type: String },
});




const User = mongoose.model('User', userSchema, 'user');

const projectSchema = new Schema({
    name: { type: String },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
});


const Project = mongoose.model('Project', projectSchema, 'project');

const userProjectSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project"
    }
});

const UserProjet = mongoose.model('UserProject', userProjectSchema, 'userProject');
 
const taskSchema = new Schema ({
    name: {type: String},
    priority: {type:String, default: 'Low'},
    status: {type: String, default: 'In progress'},
    member: {
        type:mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Project"
    }
});

const Task = mongoose.model("Task", taskSchema, 'task');


const Schemas = { 'User': User, 'Project': Project, 'UserProject': UserProjet, 'Task': Task};

export default Schemas; 