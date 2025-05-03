import sharp from 'sharp';
import primate, { PrimateService, PrimateController } from '@thewebchimp/primate';
import CampaignService from './campaign.service.js';
import UploadService from '#services/upload.service.js';
import UserController from '#entities/users/user.controller.js';

class CampaignController extends PrimateController {

	/**
	 * Creates a new campaign.
	 *
	 * This method handles the creation of a campaign. It checks for user authentication,
	 * merges user ID with request body, creates the campaign, and returns the new campaign.
	 *
	 * @param {Object} req - The request object containing campaign data.
	 * @param {Object} res - The response object used to return campaign data or error.
	 * @returns {Promise<void>}
	 */
	static async create(req, res) {
		try {
			if (!req.user?.payload?.id) {
				return res.respond({ status: 401, message: 'Unauthorized' });
			}

			const campaignData = {
				...req.body,
				idUser: req.user.payload.id,
			};

			const campaign = await CampaignService.create(campaignData);

			return res.respond({
				data: campaign,
				message: 'Campaign created successfully',
			});
		} catch (e) {
			console.error(e);
			return res.respond({
				status: 400,
				message: 'Error creating campaign: ' + e.message,
			});
		}
	}

	/**
	 * Retrieves a campaign by ID.
	 *
	 * Verifies user ownership of the campaign before returning it.
	 *
	 * @param {Object} req - The request object with campaign ID.
	 * @param {Object} res - The response object with campaign data or error.
	 * @returns {Promise<void>}
	 */
	static async get(req, res) {
		try {
			if (!req.user?.payload?.id) {
				return res.respond({ status: 401, message: 'Unauthorized' });
			}

			const campaign = await PrimateService.findById('campaign', req.params.id);

			if (!campaign) {
				return res.respond({ status: 404, message: 'Campaign not found' });
			}

			if (campaign.idUser !== req.user.payload.id) {
				return res.respond({ status: 403, message: 'Access denied' });
			}

			return res.respond({
				data: campaign,
				message: 'Campaign retrieved successfully',
			});
		} catch (e) {
			console.error(e);
			return res.respond({
				status: 400,
				message: 'Error retrieving campaign: ' + e.message,
			});
		}
	}

	/**
	 * Updates an existing campaign.
	 *
	 * Authenticates the user, checks campaign ownership, and updates the data.
	 *
	 * @param {Object} req - Request with campaign ID and update data.
	 * @param {Object} res - Response with updated campaign or error.
	 * @returns {Promise<void>}
	 */
	static async update(req, res) {
		try {
			if (!req.user?.payload?.id) {
				return res.respond({ status: 401, message: 'Unauthorized' });
			}

			const campaign = await PrimateService.findById('campaign', req.params.id);

			if (!campaign) {
				return res.respond({ status: 404, message: 'Campaign not found' });
			}

			if (campaign.idUser !== req.user.payload.id) {
				return res.respond({ status: 403, message: 'Access denied' });
			}

			const updatedCampaign = await CampaignService.update(req.params.id, req.body);

			return res.respond({
				data: updatedCampaign,
				message: 'Campaign updated successfully',
			});
		} catch (e) {
			console.error(e);
			return res.respond({
				status: 400,
				message: 'Error updating campaign: ' + e.message,
			});
		}
	}

	/**
	 * Deletes a campaign.
	 *
	 * Validates user access, then deletes the campaign by ID.
	 *
	 * @param {Object} req - Request with campaign ID.
	 * @param {Object} res - Response with status message.
	 * @returns {Promise<void>}
	 */
	static async delete(req, res) {
		try {
			if (!req.user?.payload?.id) {
				return res.respond({ status: 401, message: 'Unauthorized' });
			}

			const campaign = await PrimateService.findById('campaign', req.params.id);

			if (!campaign) {
				return res.respond({ status: 404, message: 'Campaign not found' });
			}

			if (campaign.idUser !== req.user.payload.id) {
				return res.respond({ status: 403, message: 'Access denied' });
			}

			await PrimateService.delete('campaign', req.params.id);

			return res.respond({
				message: 'Campaign deleted successfully',
			});
		} catch (e) {
			console.error(e);
			return res.respond({
				status: 400,
				message: 'Error deleting campaign: ' + e.message,
			});
		}
	}

	/**
	 * Retrieves all campaigns for the authenticated user.
	 *
	 * @param {Object} req - Request object.
	 * @param {Object} res - Response with user's campaigns or error.
	 * @returns {Promise<void>}
	 */
	static async getMyList(req, res) {
		try {
			if (!req.user?.payload?.id) {
				return res.respond({ status: 401, message: 'Unauthorized' });
			}

			const campaigns = await CampaignService.findByUser(req.user.payload.id);

			return res.respond({
				data: campaigns,
				message: 'Campaigns retrieved successfully',
			});
		} catch (e) {
			console.error(e);
			return res.respond({
				status: 400,
				message: 'Error retrieving campaigns: ' + e.message,
			});
		}
	}

	/**
	 * Updates the status of a campaign (activate, pause, complete).
	 *
	 * @param {Object} req - Request with campaign ID and action.
	 * @param {Object} res - Response with updated campaign or error.
	 * @returns {Promise<void>}
	 */
	static async updateStatus(req, res) {
		try {
			if (!req.user?.payload?.id) {
				return res.respond({ status: 401, message: 'Unauthorized' });
			}

			const { id } = req.params;
			const { action } = req.body;

			const campaign = await PrimateService.findById('campaign', id);

			if (!campaign) {
				return res.respond({ status: 404, message: 'Campaign not found' });
			}

			if (campaign.idUser !== req.user.payload.id) {
				return res.respond({ status: 403, message: 'Access denied' });
			}

			let updatedCampaign;

			switch (action) {
				case 'activate':
					updatedCampaign = await CampaignService.activate(id);
					break;
				case 'pause':
					updatedCampaign = await CampaignService.pause(id);
					break;
				case 'complete':
					updatedCampaign = await CampaignService.complete(id);
					break;
				default:
					return res.respond({ status: 400, message: 'Invalid action' });
			}

			return res.respond({
				data: updatedCampaign,
				message: `Campaign ${action}d successfully`,
			});
		} catch (e) {
			console.error(e);
			return res.respond({
				status: 400,
				message: 'Error updating campaign status: ' + e.message,
			});
		}
	}

	/**
	 * Updates the campaign's cover image.
	 *
	 * Validates ownership and uploads a new resized image.
	 *
	 * @param {Object} req - Request with file and campaign ID.
	 * @param {Object} res - Response with campaign and cover image.
	 * @returns {Promise<void>}
	 */
	static async updateCoverImage(req, res) {
		try {
			if (!req.user?.payload?.id) {
				return res.respond({ status: 401, message: 'Unauthorized' });
			}

			if (!req.file) {
				return res.respond({ status: 400, message: 'No file received' });
			}

			const campaign = await PrimateService.findById('campaign', req.params.id);

			if (!campaign) {
				return res.respond({ status: 404, message: 'Campaign not found' });
			}

			if (campaign.idUser !== req.user.payload.id) {
				return res.respond({ status: 403, message: 'Access denied' });
			}

			const coverBuffer = await sharp(req.file.buffer)
				.resize(1200, 630, { fit: 'cover' })
				.toBuffer();

			const coverAttachment = await UploadService.createAttachment({
				buffer: coverBuffer,
				size: coverBuffer.length,
				originalname: `cover-${req.file.originalname}`,
				mimetype: req.file.mimetype,
			}, {
				metas: { type: 'cover', campaignId: campaign.id }
			});

			const updatedCampaign = await CampaignService.update(req.params.id, {
				coverImage: coverAttachment.id,
				metas: {
					...campaign.metas,
					coverAttachment: coverAttachment.id,
				},
			});

			return res.respond({
				data: {
					campaign: updatedCampaign,
					cover: coverAttachment,
				},
				message: 'Campaign cover image updated successfully',
			});
		} catch (e) {
			console.error(e);
			return res.respond({
				status: 400,
				message: 'Error updating campaign cover image: ' + e.message,
			});
		}
	}

	/**
	 * Updates the campaign metrics.
	 *
	 * Verifies ownership and updates analytics or performance data.
	 *
	 * @param {Object} req - Request with metrics data.
	 * @param {Object} res - Response with updated campaign.
	 * @returns {Promise<void>}
	 */
	static async updateMetrics(req, res) {
		try {
			if (!req.user?.payload?.id) {
				return res.respond({ status: 401, message: 'Unauthorized' });
			}

			const campaign = await PrimateService.findById('campaign', req.params.id);

			if (!campaign) {
				return res.respond({ status: 404, message: 'Campaign not found' });
			}

			if (campaign.idUser !== req.user.payload.id) {
				return res.respond({ status: 403, message: 'Access denied' });
			}

			const updatedCampaign = await CampaignService.updateMetrics(req.params.id, req.body.metrics);

			return res.respond({
				data: updatedCampaign,
				message: 'Campaign metrics updated successfully',
			});
		} catch (e) {
			console.error(e);
			return res.respond({
				status: 400,
				message: 'Error updating campaign metrics: ' + e.message,
			});
		}
	}

	static async getUserCampaigns(req, res) {
		try {
			const user = await UserController.getMe(req, req.params.id);
			if(!user) return res.respond({ status: 401, message: 'User not found or error fetching user' });

			const campaigns = await PrimateService.all('campaign', req.query, {
				idUser: user.id,
			});

			return res.respond({
				data: campaigns.data,
				message: 'Campaigns retrieved successfully',
				props: {
					count: campaigns.count
				}
			});

		} catch(e) {
			console.error(e);
			return res.respond({ status: 400, message: 'Error getting campaigns: ' + e.message });
		}
	}

	static async getUserCampaign(req, res) {
		try {
			const user = await UserController.getMe(req, req.params.id);
			if(!user) return res.respond({ status: 401, message: 'User not found or error fetching user' });

			const campaign = await PrimateService.findById('campaign', req.params.idCampaign, {
				idUser: user.id,
			});

			if(!campaign) return res.respond({ status: 404, message: 'Campaign not found' });

			return res.respond({
				data: campaign,
				message: 'Campaign retrieved successfully',
			});

		} catch(e) {
			console.error(e);
			return res.respond({ status: 400, message: 'Error getting campaign: ' + e.message });
		}
	}
}

export default CampaignController;
