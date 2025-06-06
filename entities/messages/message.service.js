import primate from '@thewebchimp/primate';

class MessageService {

	static async getHistory(chatId, threadId) {

		// get the last 10 messages
		const messages = await primate.prisma.message.findMany({
			where: {
				chatId,
				threadId,
			},
			orderBy: {
				createdAt: 'desc',
			},
			take: 20,
		});

		// get last message with metas.context
		const lastMessageWithMeta = messages.reverse().find(message => message.metas.context);
		const context = lastMessageWithMeta ? lastMessageWithMeta.metas.context : null;

		// prepare messages for openai
		return {
			messages: messages.map(message => {
				return {
					role: message.role,
					content: message.text,
				};
			}),
			context,
		};
	}
}

export default MessageService;