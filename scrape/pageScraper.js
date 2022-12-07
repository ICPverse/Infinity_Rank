const scraperObject = {
	url: 'https://entrepot.app/marketplace/btcflower', //replace with any link 
	async scraper(browser){
		return new Promise(async (resolve, reject) => {
			try {
		let page = await browser.newPage();
		console.log(`Analyzing NFTs on ${this.url}...`);
		console.log('Lots of data. This can and should take a while. Grab a coffee or something..')
		await page.goto(this.url,{
			waitUntil: 'networkidle0',
			timeout: 0,
		  });;
		
		let xyz = await page.evaluate(() => {
			let results1 = [];
			let results2 = []
			let items = document.querySelectorAll('div.MuiButtonBase-root.MuiListItem-root.MuiListItem-gutters.MuiListItem-button');
			const delay = ms => new Promise(res => setTimeout(res, ms));
			let i = 0;
			items.forEach((item) => {
				
				if (i > 0){
					item.click();
				
					delay(1000);
				

				results1.push({text: item.innerText});
				results2.push({text: item.innerText});
				let innerItems = document.querySelectorAll('span.MuiTypography-root.MuiFormControlLabel-label.MuiTypography-body1');
				
				innerItems.forEach((innerItem) => {
					console.log(innerItem.innerText);
					if (innerItem.innerText.length > 0)
						results1.push({text: innerItem.innerText});
				})
				let innerItems2 = document.querySelectorAll('div.MuiChip-root.MuiChip-outlined span.MuiChip-label');
				innerItems2.forEach((innerItem2) => {
					console.log(innerItem2.innerText);
					if (innerItem2.innerText.length > 0)
						results2.push({text: innerItem2.innerText});
				})
				
				item.click();
				}
				i += 1;
			});
			let j = 0;
			let results = [];
			while (j < results1.length){
				let r1 = ((JSON.stringify(results1[j])).split('"').join('')).replace('text','');
				let r2 = ((JSON.stringify(results2[j])).split('"').join('')).replace('text','');
				results.push((((r1.concat(r2)).replace('{:','')).replace('}{:','<<<>>>')).replace('}',''));
				j += 1;
			}
			
			return results;
		});

		//Choosing a value of factor for Weighted Infinity Rank:
		let w_factor = 1;
		let k = 1;
		let count = 0;
		let weights = [];
		let weight = 0;
		let ind = [];
		ind.push(0);
		while (k < xyz.length){
			let res = xyz[k].split('<<<>>>');
			if (res[0]===res[1]){
				weights.push(weight);
				weight = 0;
				ind.push(k);
			}
			else 
				weight += Math.pow(parseInt(res[1]),w_factor);
			k += 1;
		}
		weights.push(weight);
		ind.push(xyz.length);
		let winningVar = '';
		let winningRar = 1000;
		let m = 0;
		let n = 0;
		let genVar;
		let varList = [];
		let iteration = 0;
		let combinationList = [];
		let rarityList = [];
		/*
		50x is just a preference for the number of simulations. It could be anything. We had to use simulations
		because the number of loops was indeterminate
		*/
		while (iteration < 100000){
			m = 0
			varList = [];
			while (m < ind.length - 1){
				genVar =  Math.floor((Math.random() * (ind[m+1] - ind[m] - 1))+ ind[m]+1); 
				varList.push(genVar);
				m += 1;
			}
			let combinationName = '';
			let rarityScore = 0;
			n = 0;
			while (n < varList.length){
				let rslt = xyz[varList[n]].split('<<<>>>');
				combinationName = combinationName.concat('++',rslt[0]);
				rarityScore = rarityScore + (Math.pow(parseInt(rslt[1]), w_factor)/weights[n]);
				n += 1;
			}
			if (rarityScore < winningRar){
				winningRar = rarityScore;
				winningVar = combinationName;
			}
			if (!(combinationList.includes(combinationName))){
				combinationList.push(combinationName);
				rarityList.push(rarityScore);
			}
			iteration += 1;
		}
		n = 1;
		let i = 0;
		//select any variation like this separated by ++
		let inputCombination = '++gold++diamond++green++paypal++triple++grey';
		//'++Golden++ultimate black++gold colour teeth++hands down small black++8 bit grey++antenna spikes mixed++mid blue++3++4++2++3++3';
		//above is similar input for pokedbots
		
		let nVariations = inputCombination.split('++');
		let irankExtrapolated = 0;
		while (n < nVariations.length){
			while (i < xyz.length){
				let r = xyz[i].split('<<<>>>');
				if (r[0] === nVariations[n]){
					irankExtrapolated = irankExtrapolated + (Math.pow(parseInt(r[1]),w_factor)/weights[n-1]);
					break;
				}
				else 
					i += 1;
			}
			n += 1;
			i = 0;
		}
		console.log(irankExtrapolated);
		
		n = 0;
		let irank = 1;
		while (n < rarityList.length){
			if (rarityList[n] < irankExtrapolated)
				irank += 1;
			n += 1
		}
		irank = Math.floor(Math.pow(weights[1]-1, 1/w_factor)*(irank-1)/(rarityList.length-1));

		console.log("The Infinity Rank of the Selected Item is:")

		console.log(irank);
		
		console.log("Try a new link?");
		browser.close();
		return resolve(xyz);
        
			}
			catch (e) {
				return reject(e);
			}	
	})
}
}

module.exports = scraperObject;
