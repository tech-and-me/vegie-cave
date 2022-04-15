const fs = require('fs');
const http = require('http');
const url = require('url');

//SERVER
const replaceTemplateFunc = (htmlCard, product) => {
    let output = htmlCard.replace(/{%PRODUCTNAME%}/g, product.productName);
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(/{%ID%}/g, product.id);
    if (!product.organic) output = output.replace(/{%NOT_ORGANIC%}/g, 'not-organic');

    //the replacement 3 lines below are only applicable for product card (not the overview card template)
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%NUTRI%}/g, product.nutrients);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);

    return output;
}

const tempOverview = fs.readFileSync(`${__dirname}/templates/template-overview.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, 'utf-8');
const tempProduct = fs.readFileSync(`${__dirname}/templates/template-product.html`, 'utf-8');

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);


const server = http.createServer((req, res) => {
    //convert url link to object and then access two properties of the url
    const { query, pathname } = url.parse(req.url, true);

    //OVERVIEW PAGE
    if (pathname === '/' || pathname === '/overview') {
        res.writeHead(200, { 'Content-type': 'text/html' });
        // console.log(dataObj);

        const cardsHtml = dataObj.map(el => replaceTemplateFunc(tempCard, el)).join('');
        const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHtml);
        res.end(output);

        //PRODUCT PAGE    
    } else if (pathname === '/product') {
        const product = dataObj[query.id];
        const output = replaceTemplateFunc(tempProduct, product);
        res.writeHead(200, { 'Content-type': 'text/html' });
        res.end(output);

        //API
    } else if (pathname === '/api') {
        res.writeHead(200, { 'Content-type': 'application/json' });
        res.end(data);

        //NOT FOUND
    } else {
        res.writeHead(404, {
            'Content-type': 'text/html',
            'My-cusomized-header': "Hello-from-Phary"
        });
        res.end('<h1>Page no found!</h1>');
    }
});

server.listen(3000, () => {
    console.log("Listening to request on port 3000");
});


