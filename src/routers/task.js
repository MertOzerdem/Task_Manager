const express = require('express');
const {Task} = require('../models/task');
const {ObjectID} = require('mongodb');
const auth = require('../middleware/auth');
const bcyrpt = require('bcryptjs');

const router = new express.Router();

// /tasks?completed=true or false
// /tasks?limit=10&skip=10
// /tasks?sortBy=createdAt_asc or desc
router.get('/tasks', auth, async (req,res) =>{
    const match = {};
    const sort = {};

    if(req.query.completed){
        match.completed = req.query.completed === 'true';
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split('_');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options:{
                limit: parseInt(req.query.limit), // if undefined mongoose ignore this
                skip: parseInt(req.query.skip),
                sort
            }
            // match: {
            //         completed: true
            // }
        }).execPopulate();
        res.send(req.user.tasks);
        // const task = await Task.find({owner: req.user._id});
        // res.status(200).send(task);
    }
    catch(err){
        res.status(500).send(err);
    }
});

router.get('/tasks/:id', auth, async (req,res)=>{
    const id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(400).send({
            error: "bad request non valid Id"
        });
    }

    try{
        const task = await Task.findOne({_id: id, owner: req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.status(200).send(task);
    }
    catch(err){
        res.status(500).send(err);
    }
})

router.post('/tasks', auth, async (req, res) =>{
    try{
        // const task = Task(req.body);
        const task = new Task({
            ...req.body, // fill task with body fields
            owner: req.user._id
        })
        await task.save();
        res.status(201).send(task);
    }
    catch(err){
        res.status(400).send(err);
    }
});

router.patch('/tasks/:id', auth, async (req,res) =>{
    const id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(400).send({
            error: "bad request non valid Id"
        });
    }
    
    const updates = Object.keys(req.body);
    const allowedUpdates = ['completed', 'description'];
    const isValidOperation = updates.every((update) => {
        return allowedUpdates.includes(update);
    });

    if(!isValidOperation){
        return res.status(400).send({error: 'operation is not allowed'});
    }
    try{
        // const task = await Task.findByIdAndUpdate(id, req.body,
        //             {new: true, runValidators: true});
        const task = await Task.findOneAndUpdate({_id: id, owner: req.user._id}, req.body,
                                                {new: true, runValidators: true});
                                                console.log('task', task)
        if(!task){
            return res.status(404).send();
        }
        res.status(200).send(task);
    }
    catch(err){
        res.status(400).send(err);
    }
});

router.delete('/tasks/:id', auth, async (req, res) => {
    const id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(400).send({
            error: "bad request non valid Id"
        });
    }

    try{
        // const task = await Task.findByIdAndDelete(id);
        const task = await Task.findOneAndDelete({_id: id, owner: req.user._id});

        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }
    catch(err){
        res.status(500).send(err);
    }
})

module.exports = router;