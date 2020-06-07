import { NextFunction, Request, Response } from "express";
import firebase from "../firebase/fireConnection";


export namespace userController {
    export class UserDataContoller {
        public async AddUser(req: Request, res: Response, next: NextFunction) {
            let Id = req.body.uid;

            return firebase.database()
                .ref(`users/${Id}`)
                .set(req.body, function (error) {
                    if (error) {
                        res.send({ message: "Failed" });// The write failed...
                    } else {
                        res.send({ message: "Success" });
                        // Data saved successfully!
                    }
                });
        }

        public async GetUser(req: Request, res: Response, next: NextFunction) {
            return firebase.database().ref('/users/' + req.params.id)
                .once('value')
                .then(function (snapshot:any) {
                    res.status(200)
           
                    const lol = snapshot.val();
                    res.send(lol);
                }).catch(() => {
                    res.status(400)
                    res.send({ message: "Failed" });
                });
        }

        public async GetDiscussion(req: Request, res: Response, next: NextFunction) {
            return firebase.database().ref('/discussions/' + req.params.id)
                .once('value')
                .then(function (snapshot:any) {
                    res.status(200)
                  
                    const lol = snapshot.val();
                    res.send(lol);
                }).catch(() => {
                    res.status(400)
                    res.send({ message: "Failed" });
                });
        }

        public async GetDiscussions(req: Request, res: Response, next: NextFunction) {
           
        }


        public async SearchDiscussions(req: Request, res: Response, next: NextFunction) {
           
        }
    }


}