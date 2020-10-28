import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tonyrobinson.selfawareness',
        pass: 'Selfaware8008!'
    }
});

// Take the text parameter passed to this HTTP endpoint and insert it into 
// Cloud Firestore under the path /messages/:documentId/original
exports.addMessage = functions.https.onRequest(async (req, res) => {
    // getting dest email by query string
    const dest = 'oxa547@gmail.com';

    const mailOptions = {
        from: 'Tony Robinson - Peer Assessment <tonyrobinson.selfawareness@gmail.com>', //Adding sender's email
        to: dest, //Getting recipient's email by query string
        subject: 'Tony Robinson Coaching - Peer Assessment request', //Email subject
        html: `Hi! <br> You have been requested to complete a peer self-awareness assessment for [].<br> If you could complete
        this by ${new Date().toLocaleDateString()} that would be great! <br><br>Thank you so much for taking the time to assist in the leadership development of our 
        brothers and sisters in Christ.` //Email content in HTML
    };

    functions.logger.log('Starting Send E-mail for Peer-Assessment Contacts');
    // returning result
    return transporter.sendMail(mailOptions, (erro, info) => {
        if (erro) {
            return res.send(erro.toString());
        }
        return res.send('Sended');
    });
});



exports.emailPeerAssessmentContacts = functions.firestore.document('/peer-assessments/{documentId}')
    .onCreate((snap, context) => {
        // Grab the current value of what was written to Cloud Firestore.
        const data = snap.data();
        const emailAddress = data.emailAddress;

        const mailOptions = {
            from: 'Tony Robinson - Peer Assessment <tonyrobinson.selfawareness@gmail.com>', //Adding sender's email
            to: emailAddress, //Getting recipient's email by query string
            subject: 'Tony Robinson Coaching - Peer Assessment request', //Email subject
            html: `Hi! <br> You have been requested to complete a peer self-awareness assessment for [].<br> If you could complete
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

// listen for new peer assessments added to /peer-assessments
// Generate email for each one w/ valid email
// Add email sent date to peer assessment record


// fucntions for when new user added to firestore authenticatoin
// insert row in users colection