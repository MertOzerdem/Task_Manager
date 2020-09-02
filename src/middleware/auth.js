const jwt = require('jsonwebtoken');
const { User } = require('../models/user');

const auth = async (req, res, next)=>{
    try{
        const token = req.header('Authorization').replace('Bearer ', '');
        // console.log(token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token });

        if(!user){
            throw new Error();
        }

        //console.log(req.user)
        req.token = token;
        req.user = user;
        next();
    }
    catch(err){
        res.status(401).send({error:'authentication failed'});
    }
}


module.exports = auth;

