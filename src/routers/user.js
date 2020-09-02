const express = require('express');
const { User } = require('../models/user');
const { ObjectID } = require('mongodb');
const auth = require('../middleware/auth');
const multer = require('multer');
const sharp = require('sharp');

const router = new express.Router();
const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('non accepted file type'))
        }

        cb(null, true);
    }
});

router.get('/users/me', auth, async (req,res)=>{

    res.status(200).send(req.user);
    // try{
    //     const users = await User.find({});
    //     res.status(200).send(users);
    // }catch(err){
    //     res.status(500).send(err)
    // }
});

router.get('/users/:id/avatar', async (req,res) =>{
    try{
        console.log("ésda", req.params.id)
        const user = await User.findById(req.params.id);
        
        if(!user || !user.avatar){
            throw new Error();
        }
        
        res.set('Content-Type','image/png');
        res.send(user.avatar);
    }
    catch(err){
        res.status(400).send();
    }
});

// sing-up
router.post('/users', async (req, res) =>{
    const user = User(req.body);
    // signal creation to save. token to signal user creation
    user.tokens = [{token : 'creation'}];

    try{
        // save method is called inside generateAuthToken method
        
        await user.save();
        console.log(user.tokens)
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    }
    catch(err){
        res.status(400).send(err);
    }
});

// sign-in
router.post('/users/login', async (req, res)=>{
    try{
        let user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        //await user.getPublicProfile().then(usr => user = usr);
        res.send({ user, token });
    }
    catch(err){
        res.status(400).send();
    }
});

// logout
router.post('/users/logout', auth, async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token
        });

        await req.user.save();
        
        res.send({message : 'logout successful'});
    }
    catch(err){
        res.status(500).send(err);
    }
})

// logout all 
router.post('/users/logoutAll', auth, async (req,res)=>{
    try{
        req.user.tokens = [];
        console.log("req.user", req.user)
        await req.user.save();

        res.status(200).send({message: 'loggedout from all devices'});
    }
    catch(err){
        res.status(500).send(err);
    }

});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{

    const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250})
                                                .png().toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) =>{
    res.status(400).send({ error : error.message });
});

router.patch('/users/:id', auth, async (req,res)=>{

    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update);
    })

    if(!isValidOperation){
        return res.status(400).send({error: 'Invalid update field'});
    }

    try{
        const user = await User.findByIdAndUpdate(req.user._id, req.body, 
                    {new: true, runValidators: true});
        
        res.status(200).send(user);
    }
    catch(err){
        res.status(400).send(err);
    }
});

router.delete('/users/me', auth, async (req, res) => {
    try{
        await req.user.remove();
        res.send(req.user);
    }
    catch(err){
        res.status(500).send(err);
    }
})

router.delete('/users/me/avatar', auth, async (req, res) =>{
    try{
        req.user.avatar = undefined;
        await req.user.save();
        res.status(200).send({message: 'avatar deleted'});
    }catch(err){
        res.status(500).send({error: err});
    }
    
})

module.exports = router;
// router.patch('/users/:id', async (req,res)=>{
//     const id = req.params.id;
//     if(!ObjectID.isValid(id)){
//         return res.status(400).send({
//             error: "bad request non valid Id"
//         });
//     }

//     const updates = Object.keys(req.body);
//     const allowedUpdates = ['name', 'email', 'password', 'age'];
//     const isValidOperation = updates.every((update)=>{
//         return allowedUpdates.includes(update);
//     })

//     if(!isValidOperation){
//         return res.status(400).send({error: 'Invalid update field'});
//     }

//     try{
//         // const user = await User.findById(id);
//         // updates.forEach((update)=> user[update] = req.body[update]);
//         // await user.save();

//         const user = await User.findByIdAndUpdate(id, req.body, 
//                     {new: true, runValidators: true});
                    
//         if(!user){
//             res.status(404).send();
//         }
//         res.status(200).send(user);
//     }
//     catch(err){
//         res.status(400).send(err);
//     }
// });

// router.delete('/users/:id', auth, async (req, res) => {
//     const id = req.params.id;
//     if(!ObjectID.isValid(id)){
//         return res.status(400).send({
//             error: "bad request non valid Id"
//         });
//     }

//     try{
//         const user = await User.findByIdAndDelete(id);
//         console.log(user);

//         if(!user){
//             return res.status(404).send();
//         }
//         res.send(user);
//     }
//     catch(err){
//         res.status(500).send(err);
//     }
// })

// router.get('/users/:id', async (req,res)=>{
//     const id = req.params.id;
//     if(!ObjectID.isValid(id)){
//         return res.status(400).send({
//             error: "bad request non valid Id"
//         });
//     }

//     try {
//         const user = await User.findById(id);
//         if(!user){
//             return res.status(404).send();
//         }
//         res.status(200).send(user);
//     }
//     catch(err){
//         res.status(500).send(err);
//     }
// });
