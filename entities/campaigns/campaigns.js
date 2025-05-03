import { auth, Primate } from '@thewebchimp/primate';
import CampaignController from './campaign.controller.js';
import multer from 'multer';

const router = Primate.getRouter();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Create a new campaign
router.post('/', auth, CampaignController.create);

// Get authenticated user's campaigns
router.get('/my-campaigns', auth, CampaignController.getMyList);

// Get a specific campaign by ID
router.get('/:id', auth, CampaignController.get);

// Update a campaign
router.put('/:id', auth, CampaignController.update);

// Delete a campaign
router.delete('/:id', auth, CampaignController.delete);

// Update campaign status
router.put('/:id/status', auth, CampaignController.updateStatus);

// Update campaign cover image
router.put('/:id/cover', auth, upload.single('file'), CampaignController.updateCoverImage);

// Update campaign metrics
router.put('/:id/metrics', auth, CampaignController.updateMetrics);

Primate.setupRoute('campaign', router, {
	searchField: ['name'],
	queryableFields: ['name', 'type', 'status'],
});

export { router };