import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tonyrobinson.selfawareness',
        pass: 'Selfaware8008!'
    }
});

exports.emailPeerAssessmentContacts = functions.firestore.document('/peer-assessments/{documentId}')
    .onCreate((snap, context) => {
        const data = snap.data();
        const emailAddress = data.emailAddress;
        const peerFullName = data.fullName;
        const selfFullName = data.selfUserFullName;
        const link = 'http://' + data.linkToAssessment;
        let d = new Date();
        d.setDate(d.getDate() + 7);

        const mailOptions = {
            from: 'Tony Robinson Coaching - Peer Assessment <tonyrobinson.selfawareness@gmail.com>',
            to: emailAddress,
            subject: 'Tony Robinson Coaching - Peer Assessment request',
            html: `Hi, ${peerFullName}! <br><br> You have been requested to complete a peer self-awareness assessment for <b>${selfFullName}</b>.<br> If you could complete
        this by ${d.toLocaleDateString()} that would be great! <br><br><a href="${link}">Click here to take your peer assessment!</a> <br><br>Thank you so much for taking the time to assist in the leadership development of our 
        brothers and sisters in Christ.` //Email content in HTML
        };

        // Access the parameter `{documentId}` with `context.params`
        functions.logger.log('Starting Send E-mail for Peer-Assessment Contacts::', context.params.documentId);

        return transporter.sendMail(mailOptions, (erro, info) => {
            if (erro) {
                functions.logger.error('Error sending e-mail::', erro.toString());
                // if error - save to peer assess record?
                // retry?
            }
            functions.logger.log('E-mail delivered!');
            // save to perr asses record date sent
        });

        // You must return a Promise when performing asynchronous tasks inside a Functions such as
        // writing to Cloud Firestore.
    });

    
// Add email sent date to peer assessment record


// fucntions for when new user added to firestore authenticatoin
// insert row in users colection