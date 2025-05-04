import { auth, Primate } from '@thewebchimp/primate';
import ProjectController from './project.controller.js';
import multer from 'multer';

const router = Primate.getRouter();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new campaign
router.post('/', auth, ProjectController.create);

// Get authenticated user's projects
router.get('/my-projects', auth, ProjectController.getMyList);

// Get a specific campaign by ID
router.get('/:id', auth, ProjectController.get);

// Update a campaign
router.put('/:id', auth, ProjectController.update);

// Delete a campaign
router.delete('/:id', auth, ProjectController.delete);

// Update campaign status
router.put('/:id/status', auth, ProjectController.updateStatus);

// Update campaign cover image
router.put('/:id/cover', auth, upload.single('file'), ProjectController.updateCoverImage);

// Update campaign metrics
router.put('/:id/metrics', auth, ProjectController.updateMetrics);

Primate.setupRoute('campaign', router, {
	searchField: ['name'],
	queryableFields: ['name', 'type', 'status'],
});

export { router };