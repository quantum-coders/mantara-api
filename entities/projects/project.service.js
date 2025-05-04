import primate, { PrimateService } from '@thewebchimp/primate';
import 'dotenv/config';
import moment from 'moment-timezone';
moment.locale('es');

class ProjectService {
	/**
	 * Creates a new campaign with the given data.
	 *
	 * @param {Object} data - The data for the new campaign.
	 * @returns {Promise<Object>} - A promise that resolves to the created campaign object.
	 */
	static async create(data) {
		try {
			// Business Logic

			const metas = {};

			if(data.client) metas.client = data.client;
			if(data.productService) metas.productService = data.productService;

			// Primate Create
			return PrimateService.create('project', data);
		} catch(e) {
			throw e;
		}
	}

	/**
	 * Updates a campaign with the given data.
	 *
	 * @param {number} id - The ID of the campaign to update.
	 * @param {Object} data - The data to update the campaign with.
	 * @param {Object} [options={}] - Additional options for updating the campaign.
	 * @returns {Promise<Object>} - A promise that resolves to the updated campaign object.
	 */
	static async update(id, data, options = {}) {
		try {
			// Handle date conversions if provided
			if(data.startDate) data.startDate = new Date(data.startDate);
			if(data.endDate) data.endDate = new Date(data.endDate);

			return PrimateService.update('project', id, data);
		} catch(e) {
			throw e;
		}
	}

	/**
	 * Finds projects by user ID.
	 *
	 * @param {number} userId - The ID of the user to find projects for.
	 * @returns {Promise<Array>} - A promise that resolves to an array of campaign objects.
	 */
	static async findByUser(userId) {
		try {
			return await primate.prisma.project.findMany({
				where: {
					userId,
				},
				orderBy: {
					created: 'desc',
				},
			});
		} catch(e) {
			throw e;
		}
	}

	/**
	 * Activates a campaign by updating its status to 'Active'.
	 *
	 * @param {number} id - The ID of the campaign to activate.
	 * @returns {Promise<Object>} - A promise that resolves to the activated campaign object.
	 * @throws {Error} - Throws an error if the campaign is not found or if it cannot be activated.
	 */
	static async activate(id) {
		try {
			const project = await PrimateService.findById('project', id);

			if(!project) throw new Error('project not found');

			// Check if campaign can be activated (has required fields)
			if(!project.startDate) throw new Error('Cannot activate campaign without a start date');

			return await PrimateService.update('project', id, { status: 'Active' });
		} catch(e) {
			throw e;
		}
	}

	/**
	 * Pauses a campaign by updating its status to 'Paused'.
	 *
	 * @param {number} id - The ID of the campaign to pause.
	 * @returns {Promise<Object>} - A promise that resolves to the paused campaign object.
	 * @throws {Error} - Throws an error if the campaign is not found.
	 */
	static async pause(id) {
		try {
			const campaign = await PrimateService.findById('campaign', id);

			if(!campaign) throw new Error('Campaign not found');

			return await PrimateService.update('campaign', id, { status: 'Paused' });
		} catch(e) {
			throw e;
		}
	}

	/**
	 * Completes a campaign by updating its status to 'Completed'.
	 *
	 * @param {number} id - The ID of the campaign to complete.
	 * @returns {Promise<Object>} - A promise that resolves to the completed campaign object.
	 * @throws {Error} - Throws an error if the campaign is not found.
	 */
	static async complete(id) {
		try {
			const campaign = await PrimateService.findById('campaign', id);

			if(!campaign) throw new Error('Campaign not found');

			return await PrimateService.update('campaign', id, {
				status: 'Completed',
				endDate: new Date(), // Set end date to current date if not specified
			});
		} catch(e) {
			throw e;
		}
	}

	/**
	 * Updates campaign metrics.
	 *
	 * @param {number} id - The ID of the campaign to update metrics for.
	 * @param {Object} metrics - The metrics data to update.
	 * @returns {Promise<Object>} - A promise that resolves to the updated campaign object.
	 * @throws {Error} - Throws an error if the campaign is not found.
	 */
	static async updateMetrics(id, metrics) {
		try {
			const campaign = await PrimateService.findById('campaign', id);

			if(!campaign) throw new Error('Campaign not found');

			// Merge existing metrics with new metrics
			const updatedMetrics = { ...campaign.metrics, ...metrics };

			return await PrimateService.update('campaign', id, { metrics: updatedMetrics });
		} catch(e) {
			throw e;
		}
	}
}

export default ProjectService;