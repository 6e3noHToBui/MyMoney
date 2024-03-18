const cron = require('node-cron');
const nodemailer = require('nodemailer');
const Task = require("../models/Task")
const User = require("../models/User");
const config = require("config")

exports.taskScheduler = cron.schedule('0 0 * * *', async () => {
    console.log('Task scheduler is running...');
    const currentDate = new Date();
    const tasks = await Task.find({ startDate: { $lte: currentDate } });

    tasks.forEach(async (task) => {
        const { title, notification, description, user, startDate, number, method } = task;

        if (notification) {
            const nextNotificationDate = calculateNextNotificationDate(startDate, number, method);

            if (currentDate >= nextNotificationDate) {
                const notificationText = `Task: ${title}\nDescription: ${description}`;
                await sendNotificationEmail(user._id, 'Task Notification', notificationText);

                const newNextNotificationDate = calculateNextNotificationDate(currentDate, number, method);
                await Task.updateOne({ _id: task._id }, { $set: { nextNotificationDate: newNextNotificationDate } });
            }
        }
    });
});

async function sendNotificationEmail(to, subject, text) {
    console.log(`Sending notification email to ${to}...`);
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.get("EMAIL"),
            pass: config.get("EMAIL_PASSWORD"),
        },
    });

    const user = await User.findOne({ _id: to });
    if (!user) {
        console.error(`User not found with ID: ${to}`);
        return;
    }

    const mailOptions = {
        from: 'mymoney@gmail.com',
        to: user.email,
        subject: 'Don\'t forget about your task',
        text,
    };

    await transporter.sendMail(mailOptions);
}

function calculateNextNotificationDate(startDate, number, method) {
    console.log('Calculating next notification date...');
    const date = new Date(startDate);
    
    switch (method) {
        case 'day':
            date.setDate(date.getDate() + parseInt(number, 10));
            break;
        case 'week':
            date.setDate(date.getDate() + parseInt(number, 10) * 7);
            break;
        case 'month':
            date.setMonth(date.getMonth() + parseInt(number, 10));
            break;
        case 'minute':
            date.setMinutes(date.getMinutes() + parseInt(number, 10));
            break;
        default:
            break;
    }

    return date;
}

