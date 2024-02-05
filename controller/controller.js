import Schemas from "../models/schemas.js";
import bcrypt from "bcryptjs";


const Controller = class {
    constructor(app) {
        this.app = app;
        this.userSchema = Schemas.User;
        this.projectSchema = Schemas.Project;
        this.userProjectSchema = Schemas.UserProject;
        this.task = Schemas.Task;
    }

    router() {
        const email_already_registered = false;

        this.app.get('/', (req, res) => {
            res.send('EveryThing is Ok :)');
        });



        this.app.post('/signin', (req, res) => {
            const passwordHashed = bcrypt.hashSync(req.body.user.password, 10);

            const userParam = {
                username: req.body.user.username.toLowerCase(),
                email: req.body.user.email,
                password: passwordHashed,
                photo: "./src/assets/images/avatar.png"
            }

            const userDataAlreadySaved = this.getUserInfo(req);

            userDataAlreadySaved.then((result) => {
                if (result.length > 0) {
                    for (let data of result) {
                        if (data.email == userParam.email) {
                            res.json('Email registered');
                            email_already_registered = true;
                        }
                    }
                }

                if (!email_already_registered) {
                    const newUser = new Schemas.User(userParam);
                    const saveUser = newUser.save();

                    if (saveUser) {
                        res.json("Success");
                    } else {
                        res.json("Failed");
                    }
                }
            })
        });


        this.app.post('/login', (req, res) => {
            const userDataAlreadySaved = this.getUserInfo(req, false);

            userDataAlreadySaved.then((result) => {
                if (result) {
                    req.session.user = result;
                    res.json({ user: result, rememberMe: req.session.rememberUser });
                } else {
                    res.json({ user: [] });
                }
            }).catch((error) => console.log(error));
        });

        this.app.get('/logout', (req, res) => {
            req.session.destroy((error) => {
                res.json({ result: "success" })
            }); 
        });


        this.app.post('/getCurrentUser', (req, res) => {
            const rememberedUserId = req.body.rememberedUserId;

            if (req.session.user) {  
                return res.json({ valid: true, user: req.session.user });
            } else if (rememberedUserId) {
                const user = this.getUserInfoById(rememberedUserId);

                user.then((result) => {
                    if (result) {
                        return res.json({ valid: true, user: result });
                    }
                }).catch((error) => console.log("Remembered me error" + error));
            } else {
                return res.json({ valid: false });
            }
        });

        this.app.post('/seachUser', (req, res) => {
            const username = req.body.username;

            const search = this.searchUser(username);
            search.then(result => {
                if (result.length > 0) {
                    res.json({ valid: true, searcResult: result });
                } else {
                    res.json({ valid: false })
                }
            }).catch(error => console.log("Search user error: " + error));
        });

        this.app.post('/getParticipant', (req, res) => {
            const participant_id = req.body.participant_id
            const user = this.getUserInfoById(participant_id);

            user.then((result) => {
                if (result) {
                    return res.json({ valid: true, user: result });
                } else {
                    return res.json({ valid: false });
                }
            }).catch((error) => console.log("Remembered me error" + error));
        });

        this.app.post('/getUserProject', (req, res) => {
            const project_id = req.body.project_id;
            const userProject = this.getUserProject(project_id);
            userProject.then((user) => {
                if (user) {
                    return res.json({valid: true, value: user});
                }
            }).catch(error => console.log("get User project controller error: " + error));
        });

        this.app.post('/updateUser', (req, res) => {
            const userData = req.body.userValues;
            const updateUser = this.updateUser(userData);

            updateUser.then((response) => {
                if (response) {
                    return res.json({ result: true, value: response });
                }
            }).catch((error) => {
                console.log("Update user error" + error);
                return res.json({ result: false, value: error })
            })
        }); 

        this.app.post('/insertProject', (req, res) => {
            const owner = req.body.owner;
            const participant = req.body.participant;
            const name = req.body.name;
            const userProject = this.insertProject(name, owner, participant);
            userProject.then((result) => {
                return res.json({ valid: true, result: result });
            }).catch(error => {
                return res.json({ valid: false })
            })
        });

        this.app.get('/getProject', (req, res) => {
            const result = this.getProject();
            result.then((project) => {
                if (project) {
                    return res.json({ valid: true, result: project });
                }
            }).catch((error) => {
                return res.json({ valid: false, result: error });
            });
        });

        this.app.post('/updateProject', (req, res) => {
            const project_id = req.body.project_id;
            const project_name = req.body.name;
            const participant = req.body.participant;

            const update = this.updateProject(project_id, project_name);
            update.then((updated) => {
                if (updated) {
                    const deleteUserProject = this.deleteUserProject(project_id);
                    deleteUserProject.then((deleted) => {
                        if (deleted) {
                            const insertUserProject = this.insertUserProject(participant, project_id);
                            insertUserProject.then((inserted) => {
                                if (inserted) {
                                    return res.json({valid: true});
                                }
                            }).catch(error => console.log("Insert user project error: " + error));
                        }
                    }).catch(error => console.log("Delete user project error: " + error));
                }
            }).catch(error => console.log("Update project error: " + error));
        });

        this.app.post('/deleteProject', (req, res) => {
            const projectId = req.body.project_id;
            const deleteProject = this.deleteProject(projectId);
            deleteProject.then(deleted => {
                if (deleted) {
                    const deleteUserProject = this.deleteUserProject(projectId);
                    deleteUserProject.then(deletedUserProject => {
                        if (deleteUserProject) {
                            return res.json({valid: true});
                        }
                    }).catch(error => console.log("Delete User project error: " + error))
                }
            }).catch(error => console.log("Delete project error: " + error))
        });

        this.app.get('/getTasks', (req, res) => {
            const tasks = this.getTasks();
            tasks.then(results => {
                if (results.length > 0) {
                    return res.json({valid: true, result: results});
                } else {
                    return res.json({valid: false});
                }
            }).catch(error => console.log("Get All tasks error: " + error));
        });


        this.app.post('/getTask', (req, res) => {
            const projectId = req.body.project_id;
            const task      = this.getTask(projectId);

            task.then((task) => {
                if (task) {
                    return res.json({valid: true, result: task});
                }
            }).catch(error => console.log("Get Task error: " + error))

        });

        this.app.post('/insertTask', (req, res) => {
            const task = req.body.task;
            const inserted = this.insertTask(task);

            inserted.then(result => {
                if (result) {
                    return res.json({valid: true, result: result});
                }
            }).catch(error => console.log("Insert task error: " + error));
        });

        this.app.post('/updateTask', (req, res) => {
            const task = req.body.task;
            const task_id = task._id;

            const data = {
                name: task.name,
                priority: task.priority,
                status: task.status,
                member: (task.member['_id']) ? task.member['_id'] : task.member,
                project: task.project
            }

            const updated = this.updateTask(task_id, data);

            updated.then(result => {
                if (result) {
                    return res.json({valid: true, result: result});
                }
            }).catch(error => console.log("Task update error: " + error));
        });

        this.app.post('/deleteTask', (req, res) => {
            const task_id = req.body.id;
            const deleted = this.deleteTask(task_id);

            deleted.then(result => {
                if (result) {
                    return res.json({valid: true})
                }
            }).catch(error => console.log("Delete task error: " + error));
        });
    }

    async searchUser(username) {
        let result = await this.userSchema.find({ username: { $regex: '.*' + username + '.*' } }).limit(5);

        if (result) {
            return result;
        }

        return [];
    }

    async updateUser(userData) {
        const passwordHashed = (userData.password) ? bcrypt.hashSync(userData.password, 10) : userData.password;

        let update = await this.userSchema.findOneAndUpdate({ _id: userData._id }, {
            username: userData.username.toLowerCase(),
            password: passwordHashed,
            photo: userData.photo
        });

        if (update) {
            return update;
        }

        return [];
    }



    async getUserInfo(req, notSpecific = true) {
        let userData = ""
        const email = req.body.user.email;
        const password = req.body.user.password;
        const rememberUser = req.body.remember;

        if (notSpecific) {
            userData = await this.userSchema.find({}).exec();
        } else {
            const user = await this.userSchema.findOne({ email: email})
            const passwordMatch = bcrypt.compareSync(password, user.password);
            if (passwordMatch) {
                userData = user;
            }
        }

        if (userData) {
            req.session.rememberUser = rememberUser;
            return userData;
        }

        return []
    }

    async getUserInfoById(id) {
        const userData = await this.userSchema.findById(id);

        return userData;
    }

    async insertProject(name, owner, participant) {
        await this.projectSchema.create({ name: name, owner: owner })
            .then((project) => {
                return this.insertUserProject(participant, project._id);
            }).catch(error => console.log('Project Insertion error: ' + error));
    }

    async deleteProject(project_id) {
        const deleteProject = this.projectSchema.findByIdAndDelete(project_id);
        return deleteProject;
    }

    async insertUserProject(participant, project_id) {
        const userProjectTmp = [];

        for (let user_id of participant) {
            userProjectTmp.push({ user: user_id, project: project_id });
        }

        return this.userProjectSchema.insertMany(userProjectTmp);
    }

    async deleteUserProject(project_id) {
        const deleteUserProject = this.userProjectSchema.deleteMany({project: project_id});
        return deleteUserProject;
    }

    async getProject() {
        const project = await this.projectSchema.find({}).populate('owner');
        return project;
    }

    async updateProject(project_id, project_name) {
        let update = await this.projectSchema.findOneAndUpdate({ _id: project_id }, {
            name: project_name,
        });

        if (update) {
            return update;
        }

        return [];
    }

    async getUserProject(project_id) {
        const  userProject = await this.userProjectSchema.find({project: project_id}).populate("user").populate("project");
        return userProject;
    }

    async getTask(project_id) {
        const task = await this.task.find({project: project_id}).populate("member");
        return task;
    }

    async getTasks() {
        const tasks = await this.task.find({});
        return tasks
    }

    async insertTask(task) {
        const insert = await this.task.create(task);
        return insert;
    }

    async updateTask(id, data) {
        const update = await this.task.findOneAndUpdate({_id: id}, data);
        return update;
    }

    async deleteTask(id) {
        const deleted = await this.task.findOneAndDelete({_id: id});
        return deleted;
    }
}


export default Controller
