const axios = require('axios');

class Qiwi {
	constructor(options = {}) {
		this.options = {
			...options
		};
	}

	getUrl(path) {
		return `https://edge.qiwi.com/${path}`;
	}

	getHeaders() {
		const { token } = this.options;

		return {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization': `Bearer ${token}`
		};
	}

	call(methodName, requestType = 'GET', body = {}) {
		const params = {
			method: requestType.toLowerCase(),
			url: this.getUrl(methodName),
			headers: this.getHeaders()
		};

		if (params.method === 'post') {
			params.data = body;
		} else {
			params.params = body;
		}

		const handleResponse = ({ data }) =>
			data;
		const handleError = err => {
			console.error('An error happened', err.message);

			return this.call(methodName, requestType, body);
		};

		return axios(params)
			.then(handleResponse)
			.catch(handleError);
	}

	getBalance(currency) {
		const { account } = this.options;

		return this.call(`funding-sources/v2/persons/${account}/accounts`).then(response => {
			const accounts = response.accounts ?
				response.accounts:
				[];

			if (!currency) {
				return accounts;
			}

			for (let i = 0; i < accounts.length; i++) {
				const accountInfo = accounts[i];

				if (accountInfo.currency === currency) {
					return accountInfo;
				}
			}

			return accounts;
		});
	}

	getHistory(params) {
		const { account } = this.options;

		return this.call(`payment-history/v2/persons/${account}/payments`, 'GET', params)
			.then(({ data }) =>
				data
			);
	}
}

module.exports = Qiwi;