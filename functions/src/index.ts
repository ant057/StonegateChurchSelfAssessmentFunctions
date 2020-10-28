import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

const db = admin.firestore();

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
        const selfAssessmentId = data.selfAssessmentId;
        let selfFullName = '';

        db.doc(`self-assessments/${selfAssessmentId}`).get().then(doc => {
            if(doc.exists) {
                selfFullName = doc.data()?.selfUserFullName;
            }
        });

        functions.logger.log('ok here now::' + selfFullName);

        const mailOptions = {
            from: 'Tony Robinson Coaching - Peer Assessment <tonyrobinson.selfawareness@gmail.com>',
            to: emailAddress,
            subject: 'Tony Robinson Coaching - Peer Assessment request',
            html: `Hi, ${peerFullName}! <br><br> You have been requested to complete a peer self-awareness assessment for <b>${selfFullName}</b>.<br> If you could complete
        this by ${new Date().toLocaleDateString()} that would be great! <br><br>Thank you so much for taking the time to assist in the leadership development of our 
        brothers and sisters in Christ.` //Email content in HTML
        };

        // Access the parameter `{documentId}` with `context.params`
        functions.logger.log('Starting Send E-mail for Peer-Assessment Contacts', context.params.documentId);

        return transporter.sendMail(mailOptions, (erro, info) => {
            if (erro) {
                functions.logger.error('Error sending e-mail', erro.toString());
            }
            functions.logger.log('E-mail delivered!');
        });

        // You must return a Promise when performing asynchronous tasks inside a Functions such as
        // writing to Cloud Firestore.
    });

    
// Add email sent date to peer assessment record


// fucntions for when new user added to firestore authenticatoin
// insert row in users colection