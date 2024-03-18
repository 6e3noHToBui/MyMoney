const User = require("../models/User");
const bcrypt = require("bcrypt");
const Router = require("express")
const config = require("config")
const jwebt = require("jsonwebtoken")
const { check, validationResult } = require("express-validator")
const express = require('express');
const uuid = require('uuid');
const nodemailer = require('nodemailer')
const { promisify } = require('util');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({
    accessKeyId: config.get("awsId"),
    secretAccessKey: config.get("awsKey"),
    region: config.get("region"),
});

const s3 = new AWS.S3();
const s3Upload = promisify(s3.upload).bind(s3);

function generateVerificationToken() {
    return uuid.v4();
}
const YOUR_DOMAIN = 'http://localhost:3000';

function generateVerificationLink(token) {
    return `${YOUR_DOMAIN}/verify/${token}`;
}
exports.registration = [
  check('email', "Uncorrect E-mail").isEmail(),
  check('password', "Password must be 5-15 symbols").isLength({ min: 5, max: 15 }),
  check('login', "Login must be 4-15 symbols").isLength({ min: 4, max: 15 }),
  check('name', "Name must be 3-20 symbols").isLength({ min: 3, max: 20 }),
  check('surename', "Surename must be 3-20 symbols").isLength({ min: 3, max: 20 }),
  async (req, res) => {
      try {
          const errors = validationResult(req);

          if (!errors.isEmpty()) {
              return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
          }

          const { email, password, login, name, surename } = req.body;

          const candidateMail = await User.findOne({ email });
          const candidateLogin = await User.findOne({ login });

          if (candidateMail) {
              return res.status(400).json({ message: `User with this email is already exist` });
          }

          if (candidateLogin) {
              return res.status(400).json({ message: `User with this login is already exist` });
          }

          const hashPass = await bcrypt.hash(password, 10);
          const verificationToken = generateVerificationToken();
          const verificationTokenExpiry = new Date();
          verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 2);

          const user = new User({
              email,
              password: hashPass,
              login,
              name,
              surename,
              verificationToken,
              verificationTokenExpiry,
              wallets: [],
              activeWallet: null,
              cards: []
          });
          await user.save();

          const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                  user: config.get("EMAIL"),
                  pass: config.get("EMAIL_PASSWORD"),
              },
          });

          const mailOptions = {
              from: 'mymoney@gmail.com',
              to: user.email,
              subject: 'Confirm registration account',
              text: `Please, open link to confirm registration or after 2 hours account will be deleted: ${generateVerificationLink(verificationToken)}`
          };

          await transporter.sendMail(mailOptions);

          return res.json({ message: 'User registration successful. Please check your email for verification.' });

      } catch (e) {
          console.error('Server Error', e.message);
          res.status(500).json({ message: `Server Error: ${e.message}` });
      }
  }
];

exports.verification = async (req, res) => {
  try {
    const token = req.params.token;
    console.log('Received verification request with token:', token);

    console.log('Request params:', req.params);
    console.log('Request query:', req.query);

    if (!token) {
      console.log('Invalid token');
      return res.status(400).json({ message: 'Invalid token' });
    }

    console.log('Before user search');

    const unverifiedUsers = await User.find({ verified: { $ne: true } });

    console.log('After user search');

    let userFound = false;

    for (const user of unverifiedUsers) {
      if (user.verificationToken === token) {
        user.verified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiry = undefined;

        await user.save();
        userFound = true;

        console.log('Verification done');
        res.status(200).json({ message: 'User verified successfully.' });
        break; 
      }
    }

    if (!userFound) {
      console.log('Token not found or expired');
      return res.status(400).json({ message: 'Token not found or expired' });
    }
  } catch (error) {
    console.error('Verification Error', error.message);
    res.status(500).json({ message: `Verification Error: ${error.message}` });
  }
};



exports.login = async (req,res) =>{
    try {
        const { login, password } = req.body;
        const user = await User.findOne({ login });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.verified) {
            return res.status(401).json({ message: "Account is not verified. Please check your mail to verify account!" });
        }

        const validPass = bcrypt.compareSync(password, user.password);

        if (!validPass) {
            return res.status(400).json({ message: "Invalid password" });
        }

        const token = jwebt.sign({ id: user.id }, config.get("secretKey"), { expiresIn: "1h" });

        return res.json({
            token,
            user: {
                email: user.email,
                name: user.name,
                surename: user.surename,
            }
        });
    } catch (e) {
        res.status(500).json({ message: `Server Error` });
    }
}

exports.auth = async (req,res) => {
    try {
        const user = await User.findOne({ _id: req.user.id })
        const token = jwebt.sign({ id: user.id }, config.get("secretKey"), { expiresIn: "1h" })
        return res.json({
            token,
            user: {
                email: user.email,
                name: user.name,
                surename: user.surename,
                avatar: user.avatar,
            }
        })
    } catch (e) {
        console.error('Server Error', e.message);
        res.status(500).json({ message: `Server Error: ${e.message}` });
    }
}

exports.editProfile = async (req, res) => {
    const userId = req.user.id;
    const { field, value, oldPassword } = req.body;
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (field === 'password') {
        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: "Old password is not correct" });
        }
        if (value.length < 6) {
          return res.status(400).json({ message: "New password is too short (minimum 6 characters)" });
        }
      }
  
      if (field === 'name') {
        if (value.length < 3) {
          return res.status(400).json({ message: "Name is too short (minimum 3 characters)" });
        }
      }
      if (field === 'surename') {
        if (value.length < 3) {
          return res.status(400).json({ message: "Surename is too short (minimum 3 characters)" });
        }
      }
      if (field === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return res.status(400).json({ message: "Invalid email format" });
        }
  
        const existingUser = await User.findOne({ email: value });
        if (existingUser && existingUser._id.toString() !== userId) {
          return res.status(400).json({ message: "User with this email already exists" });
        }
      }
  
      if (req.file) {
        const params = {
          Bucket: config.get("s3Bucket"),
          Key: `avatars/${uuidv4()}`,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };
        const uploadResult = await s3Upload(params);
        const imageUrl = uploadResult.Location;
  
        user.avatar = imageUrl;
        await user.save();
  
        return res.json({ message: `${field} is successfully updated`, imageUrl });
      } else {
        switch (field) {
          case 'name':
            user.name = value;
            break;
          case 'surename':
            user.surename = value;
            break;
          case 'password':
            const hashedPassword = await bcrypt.hash(value, 10);
            user.password = hashedPassword;
            break;
          case 'email':
            user.email = value;
            break;
          default:
            return res.status(400).json({ message: "Invalid field" });
        }
      }
  
      await user.save();
      res.json({ message: `${field} is successfully updated` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: `Error trying to update ${field}` });
    }
  };