const express = require('express');
require('./db/mongoose');
const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

const app = express();
const port = process.env.PORT;

app.use(express.json());
app.use(userRouter);
app.use(taskRouter);

app.listen(port, ()=>{
    console.log('express listening port ', port);
});

// const {Task} = require('./models/task');
// const poppop = async ()=>{
//     const task = await Task.findById('5f4bc20f8dcb5c45b0ab17be');
//     await task.populate('owner').execPopulate();
//     console.log('task', task);
// }
// poppop();

// const {User} = require('./models/user');
// const poppop2 = async () => {
//     const user = await User.findById('5f4bbf87e89ca43398bfbd4c');
//     await user.populate('tasks').execPopulate();
//     console.log('user', user.tasks);
// }
// poppop2();


// app.use((req, res, next)=>{
//     console.log(req.method, req.path)
//     if(req.method === 'GET'){
//         res.send('get req are disabled')
//     }

//     next();
// });

// app.use((req,res,next)=>{
    
//     res.status(503).send('under maintanence');

// })


// app.get('/users', (req,res)=>{
//     User.find({})
//     .then((users)=>{
//         res.status(200).send(users);
//     }).catch((err)=>{
//         res.status(500).send(err)
//     });
// });

// app.get('/users/:id', (req,res)=>{
//     console.log(req.params)
//     const id = req.params.id;

//     if(!ObjectID.isValid(id)){
//         return res.status(400).send({
//             error: "bad request non valid Id"
//         });
//     }

//     User.findById(id)
//     .then((user)=>{
//         if(!user){
//             return res.status(404).send();
//         }
//         res.status(200).send(user);
//     })
//     .catch((err)=>{
//         console.log(err);
//         res.status(500).send(err);
//     });
// });

// app.post('/users',(req, res) =>{
//     // console.log(req.body);
//     const user = User(req.body)
    
//     user.save().then(()=>{
//         res.status(201).send(user);
//     }).catch((rej)=>{
//         res.status(400).send(rej);
//     });
// });

// app.get('/tasks', (req,res) =>{
    
//     Task.find({})
//     .then((task) =>{
//         res.status(200).send(task);
//     }).catch((err) =>{
//         res.status(500).send(err);
//     });
// })

// app.get('/tasks/:id',(req,res)=>{
//     const id = req.params.id;

//     if(!ObjectID.isValid(id)){
//         return res.status(400).send({
//             error: "bad request non valid Id"
//         });
//     }

//     Task.findById(id)
//     .then((task)=>{
//         if(!task){
//             return res.status(404).send();
//         }
//         res.status(200).send(task);
//     })
//     .catch((err) =>{
//         res.status(500).send(err);
//     })
// })

// app.post('/tasks',(req, res) =>{
//     const task = Task(req.body);

//     task.save().then(()=>{
//         res.status(201).send(task);
//     }).catch((err)=>{
//         res.status(400).send(err);
//     });
// });

// app.get('/sil/:id', (req,res)=>{
//     let id = req.params.id;
//     // id = ObjectID(id);

//     const func = async (id)=>{
//         id = ObjectID(id);
//         await Task.remove({_id: id});
        
//         return await Task.find({});
//     }

//     func(id).then((len) =>{
//         res.status(201).send({len});
//     }).catch((e)=>{
//         res.status(400).send(e);
//     })

//     // const removeId = Task.remove({_id: id}).then((task)=>{
//     //     console.log(task);
//     //     return Task.find({});
//     // }).then((number)=>{
//     //     console.log(number.length);
//     // }).catch((err)=>{
//     //     console.log(err);
//     // })

//     // task.save().then(()=>{
//     //     res.status(201).send(task);
//     // }).catch((err)=>{
//     //     res.status(400).send(err);
//     // });
// })

// app.listen(port, ()=>{
//     console.log('express listening port ', port);
// });