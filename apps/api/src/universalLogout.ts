import {Router} from 'express';
export const universalLogoutRoute = Router();
import { PrismaClient } from '@prisma/client';
import { store }  from './sessionStore';


const prisma = new PrismaClient();
interface IRequestSchema {
  'sub_id': {format:string; email: string};
}

universalLogoutRoute.post('/global-token-revocation', async (req, res) => {
  // 204 When the request is successful
  const httpStatus = 204;

  // 400 If the request is malformed
  if (!req.body) {
    res.status(400);
  }

  // Find the user by email linked to the org id associated with the API key provided
  const domainOrgId = req['user']['id'];
  const newRequest:IRequestSchema = req.body;
  const { email } = newRequest.sub_id;
  const user = await prisma.user.findFirst({
    where: {
      email: email,
      org: { id: domainOrgId } ,
    },
  });

  // 404 User not found
  if (!user) {
    res.sendStatus(404);
  }

  // End user session
  const storedSession = store.sessions;
  const userId = user.id;
  const sids = [];
  Object.keys(storedSession).forEach((key) => {
    const sess = JSON.parse(storedSession[key]);
    if (sess.passport.user === userId) {
      sids.push(key);
    }
  });

  for (const sid of sids) {
    store.destroy(sid);
  }
  console.log('User session deleted')
  return res.sendStatus(httpStatus);
});

universalLogoutRoute.use((err,req,res,next) => {
  if(err){

    return res.sendStatus(404)
  }
})
