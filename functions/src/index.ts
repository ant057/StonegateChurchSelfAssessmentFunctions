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
        const id = context.params.documentId;
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
                db.doc(`/peer-assessments/${id}`).set({
                    lastMailError: erro.toString(),
                    lastMailDate: null
                }, { merge: true });
            } else {
                functions.logger.log('E-mail delivered!');
                db.doc(`/peer-assessments/${id}`).set({
                    lastMailError: '',
                    lastMailDate: new Date().toLocaleDateString()
                }, { merge: true });
            }
        });

        // You must return a Promise when performing asynchronous tasks inside a Functions such as
        // writing to Cloud Firestore.
    });


exports.emailPeerAssessmentContactsReminder = functions.https.onCall((data, context) => {
    // Message text passed from the client.
    functions.logger.log(data);
    //const reminder: any[] = data.reminder;
    // Authentication / user information is automatically added to the request.
    // const uid = context.auth?.uid || null;
    // const name = context.auth?.token.name || null;
    // functions.logger.log('Curious here::', uid + ' ' + name);

    //let retReminder: any[] = [];
    return data;

    // reminder.forEach((element: any) => {
    //     let peerAssessmentId = element.peerAssessmentId;
    //     let peerFullName = element.fullName;
    //     let link = element.LinkToAssessment;
    //     let selfFullName = element.selfUserFullName;
    //     let emailAddress = element.emailAddress;

    //     const mailOptions = {
    //         from: 'Tony Robinson Coaching - Peer Assessment <tonyrobinson.selfawareness@gmail.com>',
    //         to: emailAddress,
    //         subject: 'Tony Robinson Coaching - Peer Assessment reminder',
    //         html: `Hi, ${peerFullName}! <br><br> We want to send you a friendly reminder to complete your peer self-awareness assessment for <b>${selfFullName}.<br><br>
    //         <a href="${link}">Click here to take your peer assessment!</a> <br><br>Thank you so much for taking the time to assist in the leadership development of our 
    //         brothers and sisters in Christ.` //Email content in HTML
    //     };

    //     functions.logger.log('Starting Send E-mail for Peer-Assessment Contacts::', peerAssessmentId);

    //     transporter.sendMail(mailOptions, (erro, info) => {
    //         if (erro) {
    //             functions.logger.error('Error sending e-mail::', erro.toString());
    //             db.doc(`/peer-assessments/${peerAssessmentId}`).set({
    //                 lastMailError: erro.toString(),
    //                 lastMailDate: null
    //             }, { merge: true });

    //             retReminder.push({
    //                 peerAssessmentId: peerAssessmentId,
    //                 peerFullName: peerFullName,
    //                 successMail: false,
    //                 error: erro.toString()
    //             })
    //         }
    //         else {
    //             functions.logger.log('E-mail delivered!');
    //             db.doc(`/peer-assessments/${peerAssessmentId}`).set({
    //                 lastMailError: '',
    //                 lastMailDate: new Date().toLocaleDateString()
    //             }, { merge: true });

    //             retReminder.push({
    //                 peerAssessmentId: peerAssessmentId,
    //                 peerFullName: peerFullName,
    //                 successMail: true
    //             })
    //         }

    //         return retReminder;
    //     });
    // });
});

// Add email sent date to peer assessment record


// fucntions for when new user added to firestore authenticatoin
// insert row in users
