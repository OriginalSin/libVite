import Utils from './Utils';

const hosts = {};

const getHost = (hostName) => {
// console.log('getHost ', hostName);
	return hosts[hostName || Utils.HOST] || {};
};

const setHost = (data, hostName) => {
	hosts[hostName || Utils.HOST] = data || {};
	return data;
};
export default {
	hosts,
	setHost,
	getHost
};