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

let d = new Date();
d.setHours(d.getHours() - 5); // utc - 5
let d2 = new Date();
d2.setHours(d2.getHours() - 5); // utc - 5
d2.setDate(d2.getDate() + 7);

exports.emailPeerAssessmentContacts = functions.firestore.document('peer-assessments/{documentId}')
    .onCreate((snap, context) => {
        const id = context.params.documentId;
        const data = snap.data();

        const mailOptions = {
            from: 'Tony Robinson Coaching - Peer Assessment <tonyrobinson.selfawareness@gmail.com>',
            to: data.emailAddress,
            subject: 'Tony Robinson Coaching - Peer Assessment request',
            html: `Hi, ${data.fullName}! <br><br> You have been requested to complete a peer self-awareness assessment for <b>${data.selfUserFullName}</b>.<br> If you could complete
            this by ${d2.toLocaleDateString()} that would be great! <br><br><a href="${data.linkToAssessment}">Click here to take your peer assessment!</a> <br><br>Thank you so much for taking the time to assist in the leadership development of our 
            brothers and sisters in Christ.`
        };

        functions.logger.log('Starting Send E-mail for Peer-Assessment Contacts::', context.params.documentId);

        return transporter.sendMail(mailOptions).then(res => {
            functions.logger.log('E-mail delivered!');
            return db.doc(`/peer-assessments/${id}`).set({
                lastMailError: '',
                lastMailDate: d.toLocaleDateString()
            }, { merge: true })
                .then(x => functions.logger.log(`Success writing e-mail delivered to peer assessment:: ${id}`, x))
                .catch(err => functions.logger.error(`Error writing e-mail delivered to peer assessment:: ${id}`, err));
        }
        ).catch(erro => {
            functions.logger.error('Error sending e-mail::', erro.toString());
            return db.doc(`/peer-assessments/${id}`).set({
                lastMailError: erro.toString(),
                lastMailDate: null
            }, { merge: true })
                .then(x => functions.logger.log(`Success writing error to peer assessment:: ${id}`, x))
                .catch(err => functions.logger.error(`Error writing error to peer assessment:: ${id}`, err));
        })
    });


exports.emailPeerAssessmentContactsReminder = functions.https.onRequest((req, res) => {
    corsHandler(req, res, () => {
        const reminder = req.body;

        reminder.forEach(async (element: any) => {
            const mailOptions = {
                from: 'Tony Robinson Coaching - Peer Assessment <tonyrobinson.selfawareness@gmail.com>',
                to: element.emailAddress,
                subject: 'Tony Robinson Coaching - Peer Assessment reminder',
                html: `Hi, ${element.fullName}! <br><br> We want to send you a friendly reminder to complete your peer self-awareness assessment for <b>${element.selfUserFullName}</b>.<br><br>
            <a href="${element.linkToAssessment}">Click here to take your peer assessment!</a> <br><br>Thank you so much for taking the time to assist in the leadership development of our 
            brothers and sisters in Christ.`
            };

            functions.logger.log('Starting Send E-mail for Peer-Assessment Contacts::', element.peerAssessmentId);

            await transporter.sendMail(mailOptions).then(res => {
                functions.logger.log('E-mail delivered!');
                return db.doc(`/peer-assessments/${element.peerAssessmentId}`).set({
                    lastMailError: '',
                    lastMailDate: d.toLocaleDateString()
                }, { merge: true })
                    .then(x => functions.logger.log(`Success writing error to peer assessment:: ${element.peerAssessmentId}`, x))
                    .catch(err => functions.logger.error(`Error writing error to peer assessment:: ${element.peerAssessmentId}`, err));;
            }).catch(erro => {
                functions.logger.error('Error sending e-mail::', erro.toString());
                return db.doc(`/peer-assessments/${element.peerAssessmentId}`).set({
                    lastMailError: erro.toString(),
                    lastMailDate: null
                }, { merge: true })
                    .then(x => functions.logger.log(`Success writing e-mail delivered to peer assessment:: ${element.peerAssessmentId}`, x))
                    .catch(err => functions.logger.error(`Error writing e-mail delivered to peer assessment:: ${element.peerAssessmentId}`, err));
            })
        });

        res.send({ status: 'done' });
    });
});