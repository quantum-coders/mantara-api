import 'dotenv/config';
import AIService from '#services/ai.service.js';
import UserController from '#entities/users/user.controller.js';
import { createLogger } from '#utils/logger.js';

/**
 * Enhanced AiController with support for multiple providers including:
 * - OpenAI, Google, Perplexity, Groq, OpenRouter
 * - Context management
 * - Function calling
 * - Streaming capabilities
 */

class AiController {

	// Create a logger instance for the controller
	static logger = createLogger({ name: 'AiController' });

	static async initialBrief(req, res) {
		try {
			const { prompt } = req.body;
			if(!prompt) return res.respond({ status: 400, message: 'Objectives not provided' });

			const aiCampaign = await AIService.initialBrief(prompt);

			return res.respond({
				data: aiCampaign,
				message: 'Program generated successfully',
			});

		} catch(e) {
			console.error('Error generating program:', e);
			return res.respond({
				status: 500,
				message: 'Error generating program',
			});
		}
	}

	/**
	 * Enhanced AI message handler with context management and tool execution
	 * @param {Object} req - Express request object
	 * @param {Object} res - Express response object
	 */
	static async aiMessage(req, res) {
		try {
			// Authenticate user
			const user = await UserController.getMe(req);
			if(!user) return res.respond({ status: 401, error: 'Unauthorized' });

			// Validate required fields
			const { prompt, idChat, idThread } = req.body;
			if(!prompt) return res.respond({ status: 400, error: 'No prompt provided' });
			if(!idChat) return res.respond({ status: 400, error: 'No chat ID provided' });
			if(!idThread) return res.respond({ status: 400, error: 'No thread ID provided' });

			// Delegate to the AIService's handleAiMessage method
			await AIService.handleAiMessage(req, res, user.id);

		} catch(error) {
			this.logger.error('Error in aiMessage handler:', error);

			try {
				if(!res.headersSent) {
					return res.respond({ status: 500, error: error.message || 'Internal server error' });
				} else {
					res.write(`data: ${ JSON.stringify({
						type: 'error',
						error: error.message || 'Internal server error',
					}) }\n\n`);
					res.end();
				}
			} catch(responseError) {
				this.logger.error('Error sending error response:', responseError);
				if(!res.finished) res.end();
			}
		}
	}
}

export default AiController;
