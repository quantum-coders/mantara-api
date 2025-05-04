import { auth, Primate } from '@thewebchimp/primate';
import UserController from './user.controller.js';
import multer from 'multer';
import ProjectController from '#entities/projects/project.controller.js';

const router = Primate.getRouter();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// me
router.get('/me', auth, UserController.me);

// register a new user
router.post('/register', UserController.register);

// login
router.post('/login', UserController.login);

// get user avatar
router.get('/:id/avatar', UserController.avatar);

// Google Login
router.post('/google/authenticate', UserController.googleByPass);

// update user avatar
router.put('/:id/avatar', auth, upload.single('file'), UserController.updateAvatar);

// Recover account
router.post('/recover', UserController.recoverAccount);
router.post('/recover/validate', UserController.validateRecoveryToken);

router.get('/:id/projects', auth, ProjectController.getUserProjects);


router.get('/:id/projects/:idProject', auth, ProjectController.getUserProject);

// init a chat
router.post('/:id/chat', auth, UserController.initChat);

Primate.setupRoute('user', router, {
	searchField: [ 'username' ],
	queryableFields: [ 'nicename', 'email' ],
});
export { router };
