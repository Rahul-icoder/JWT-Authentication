const express = require("express");
const User = require("../models/userSchema");
const router = express.Router();
const createError = require("http-errors");
const authSchema = require("../helpers/authSchema");
const JWT = require('jsonwebtoken')
const bcrypt = require('bcrypt')

router.post("/register", async (req, res, next) => {
	try {
		const result = await authSchema.validateAsync(req.body);
		const doesExits = await User.findOne({ username: result.username });
		if (doesExits) throw createError.Conflict(`${result.username} already exits`);
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(result.password, salt);
		const user =  new User({
			username:req.body.username,
			password:hashedPassword
		});
		const savedUser = await user.save();
		res.send(savedUser);
	} catch (error) {
		next(error)
	}
});

router.post("/login", async (req, res, next) => {
	try{
		const result = await authSchema.validateAsync(req.body);
		const user = await User.findOne({username:result.username});
		if(!user){
			throw createError(400, 'invalid crentials')
		}
		const verifyPassword = await bcrypt.compare(result.password,user.password);

		if(!verifyPassword){
			throw createError(400, 'invalid crentials')
		}

		const token = JWT.sign({_id:user._id},process.env.TOKEN_SECRET);
		res.cookie('jwt',token,{
			httpOnly:true,
			maxAge: 24*60*60*1000 // 1 day
		})

		res.send({
			message: 'success'
		})
	}catch(error){
		next(error)
	}
});

router.get("/user", async(req, res, next) => {
	try{
		const token = req.cookies['jwt'];
		const claims = JWT.verify(token,process.env.TOKEN_SECRET);
		if(!claims){
			throw createError(401, 'unauthorized')
		}

		const user = await User.findOne({_id:claims._id});
		const {password,...data} = await user.toJSON();
		res.send(data);
	}catch(error){
		next(error)
	}
});

router.post("/logout", (req, res, next) => {
	try{
		res.cookie('jwt',{maxAge:0});
		res.send({
			message:'success'
		})
	}catch(error){
		next(error);
	}
});

module.exports = router;
