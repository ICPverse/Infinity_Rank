const puppeteer = require('puppeteer');

async function startBrowser(){
	let browser;
	try {
	    console.log("Initializing ICPverse Infinity Rank analyzer......");
	    browser = await puppeteer.launch({
	        headless: true,
	        args: ["--disable-setuid-sandbox"],
	        'ignoreHTTPSErrors': true
	    });
	} catch (err) {
	    console.log("Failed to create a browser instance => : ", err);
	}
	return browser;
}

module.exports = {
	startBrowser
};
