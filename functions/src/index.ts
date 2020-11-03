import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';
import * as cors from 'cors';
const corsHandler = cors({ origin: true });

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
        const id = context.params.documentId;
        const data = snap.data();
        let d = new Date();
        d.setDate(d.getDate() + 7);

        const mailOptions = {
            from: 'Tony Robinson Coaching - Peer Assessment <tonyrobinson.selfawareness@gmail.com>',
            to: data.emailAddress,
            subject: 'Tony Robinson Coaching - Peer Assessment request',
            html: `Hi, ${data.fullName}! <br><br> You have been requested to complete a peer self-awareness assessment for <b>${data.selfUserFullName}</b>.<br> If you could complete
            this by ${d.toLocaleDateString()} that would be great! <br><br><a href="${'http://' + data.linkToAssessment}">Click here to take your peer assessment!</a> <br><br>Thank you so much for taking the time to assist in the leadership development of our 
            brothers and sisters in Christ.` //Email content in HTML
        };

        // Access the parameter `{documentId}` with `context.params`
        functions.logger.log('Starting Send E-mail for Peer-Assessment Contacts::', context.params.documentId);

        transporter.sendMail(mailOptions, (erro, info) => {
            if (erro) {
                functions.logger.error('Error sending e-mail::', erro.toString());
                return db.doc(`/peer-assessments/${id}`).set({
                    lastMailError: erro.toString(),
                    lastMailDate: null
                }, { merge: true });
            } else {
                functions.logger.log('E-mail delivered!');
                return db.doc(`/peer-assessments/${id}`).set({
                    lastMailError: '',
                    lastMailDate: new Date().toLocaleDateString()
                }, { merge: true });
            }
        });

        // You must return a Promise when performing asynchronous tasks inside a Functions such as
        // writing to Cloud Firestore.
    });


exports.emailPeerAssessmentContactsReminder = functions.https.onRequest((req, res) => {
    corsHandler(req, res, () => {
        const reminder = req.body;

        reminder.forEach((element: any) => {
            const mailOptions = {
                from: 'Tony Robinson Coaching - Peer Assessment <tonyrobinson.selfawareness@gmail.com>',
                to: element.emailAddress,
                subject: 'Tony Robinson Coaching - Peer Assessment reminder',
                html: `Hi, ${element.fullName}! <br><br> We want to send you a friendly reminder to complete your peer self-awareness assessment for <b>${element.selfUserFullName}</b>.<br><br>
            <a href="${'http://' + element.linkToAssessment}">Click here to take your peer assessment!</a> <br><br>Thank you so much for taking the time to assist in the leadership development of our 
            brothers and sisters in Christ.` //Email content in HTML
            };

            functions.logger.log('Starting Send E-mail for Peer-Assessment Contacts::', element.peerAssessmentId);

            transporter.sendMail(mailOptions, (erro, info) => {
                if (erro) {
                    functions.logger.error('Error sending e-mail::', erro.toString());
                    db.doc(`/peer-assessments/${element.peerAssessmentId}`).set({
                        lastMailError: erro.toString(),
                        lastMailDate: null
                    }, { merge: true });
                }
                else {
                    functions.logger.log('E-mail delivered!');
                    db.doc(`/peer-assessments/${element.peerAssessmentId}`).set({
                        lastMailError: '',
                        lastMailDate: new Date().toLocaleDateString()
                    }, { merge: true });
                }
            });
        });

        res.send({ status: 'done'});
    });
});

// Add email sent date to peer assessment record


// fucntions for when new user added to firestore authenticatoin
// insert row in users
