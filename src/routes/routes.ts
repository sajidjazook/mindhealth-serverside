import { Router, Request, Response, NextFunction } from "express";
import firebase from "../firebase/fireConnection";
import {documentController} from '../controllers/documentController'
import {userController} from '../controllers/userController'
import { discussionController } from "../controllers/discussionController";

var jwt = require('jsonwebtoken');
const rateLimit = require("express-rate-limit");
const regLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100000 // limit each IP to 100 requests per windowMs
});

// //  apply to all requests
// app.use(limiter);
const router: Router = Router();

const Chatkit = require('@pusher/chatkit-server');
const chatkit = new Chatkit.default({
    instanceLocator: process.env.CHATKIT_INSTANCE_LOCATOR,
    key: process.env.CHATKIT_SECRET_KEY,
  });


var arr = []
router.post("/user", (req, res, next) => {
    const controller = new userController.UserDataContoller;
    controller.AddUser(req, res, next);    
});

router.get("/user/:id", (req, res, next) => {
  const controller = new userController.UserDataContoller;
  controller.GetUser(req, res, next);    
});

router.post("/documents", (req, res, next) => {
    const controller = new documentController.documentData;
    controller.Adddocument(req, res, next);    
});

router.get("/documents/:dID/:nID", (req, res, next) => {
    const controller = new documentController.documentData;
    controller.Getdocument(req, res, next);   
});

router.get("/documents/:dID", (req, res, next) => {
    const controller = new documentController.documentData;
    controller.Getdocuments(req, res, next);   
});

router.post("/discussion", (req, res, next) => {
    const controller = new discussionController.DiscussionData;
    controller.AddDiscussion(req, res, next);    
});

router.post("/addDiscussionParticipant", (req, res, next) => {
  const controller = new discussionController.DiscussionData;
  controller.AddDiscussionParticipant(req, res, next);    
});

router.post("/updateDiscussionLikes", (req, res, next) => {
  const controller = new discussionController.DiscussionData;
  controller.updateDiscussionLikes(req, res, next);    
});

router.post("/updateDiscussionDislikes", (req, res, next) => {
  const controller = new discussionController.DiscussionData;
  controller.updateDiscussionDislikes(req, res, next);    
});

router.post("/removeDiscussionParticipant", (req, res, next) => {
  const controller = new discussionController.DiscussionData;
  controller.RemoveDiscussionParticipant(req, res, next);    
});

router.get("/discussion/:id", (req, res, next) => {
    const controller = new discussionController.DiscussionData;
    controller.GetDiscussion(req, res, next);   
});

router.get("/discussionByUser/:uid", (req, res, next) => {
  const controller = new discussionController.DiscussionData;
  controller.GetDiscussionByUserId(req, res, next);   
});

router.get("/discussion", (req, res, next) => {
    const controller = new discussionController.DiscussionData;
    controller.GetDiscussions(req, res, next);   
});

router.get("/search/:key", (req, res, next) => {
    const controller = new discussionController.DiscussionData;
    controller.SearchDiscussions(req, res, next);   
});

router.post("/token", regLimiter, (req, res, next) => {

    if (req.headers.authorization) {
        const lol = req.headers.authorization;
        const token: string[] = lol.split(" ");

        jwt.verify(token[1], process.env.SECRET, async (err: any, decodedToken: any) => {
            if (err || !decodedToken) {
                return res.status(403).json({ err: "Authentication failed" });
            } else {
                const snapshot = await firebase.database().ref(`users/${decodedToken.emailHash}`).once('value');
                if (snapshot.val() != null) {
                    let tokenBody = snapshot.val()
                    tokenBody.exp = Math.floor(new Date().getTime() / 1000.0) + 6000
                    var token = jwt.sign(tokenBody, process.env.SECRET);
                    return res.status(200).json({ token: token });
                }
            }
        });
    } else {
        return res.status(400).json({ err: "The Authorization token is not found" });
    }

});

router.post('/chatUsers', (req, res) => {
    const { username,id } = req.body;

    chatkit
      .createUser({
        id: id,
        name: username,
      })
      .then(() => {
        res.sendStatus(201);
      })
      .catch((err:any) => {
        if (err.error === 'services/chatkit/user_already_exists') {
          res.sendStatus(200);
        } else {
          res.status(err.status).json(err);
        }
      });
  });

  router.post('/authenticate', (req, res) => {
    const authData = chatkit.authenticate({
      userId: req.query.user_id,
    });
    res.status(authData.status).send(authData.body);
  });

//   router.set('port', process.env.PORT || 5200);
//   const server = app.listen(app.get('port'), () => {
//     console.log(`Express running → PORT ${server.address().port}`);
//   });


export { router };

