export default {
	setAgentName: {
		'name': 'setAgentName',
		'description': 'Sets the name of the agent. If the user a name directly use it, in the other case, invent one',
		'parameters': {
			'type': 'object',
			'properties': {
				'name': {
					'type': 'string',
				},
			},
			'required': [
				'name',
			],
		},
	},
	setAgentDescription: {
		'name': 'setAgentDescription',
		'description': 'Sets the description of the agent. If the user a description directly use it, in the other case, invent one',
		'parameters': {
			'type': 'object',
			'properties': {
				'description': {
					'type': 'string',
				},
			},
			'required': [
				'description',
			],
		},
	},
	chatResponse: {
		'name': 'chatResponse',
		'description': 'Function that tell the system to call a streaming message',
		'parameters': {
			'type': 'object',
			'properties': {
				'originalPrompt': {
					'type': 'string',
				},
			},
			'required': [
				'originalPrompt',
			],
		},
	},
	updateAgent: {
		'name': 'updateAgent',
		'description': 'Send the signal to update the agent.',
	},
	addEntity: {
		'name': 'addEntity',
		'description': 'Add a new entity to the agent.',
		'parameters': {
			'type': 'object',
			'properties': {
				'name': {
					'type': 'string',
				},
				'description': {
					'type': 'string',
				},
			},
			'required': [
				'name',
				'description',
			],
		},
	},
};