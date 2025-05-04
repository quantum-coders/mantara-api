import { auth, Primate } from '@thewebchimp/primate';
import AIController from '../controllers/ai.controller.js';
const router = Primate.getRouter();

router.post('/message/converse', auth, AIController.aiMessage);

router.post('/message/brief', auth, AIController.initialBrief);

export { router };
