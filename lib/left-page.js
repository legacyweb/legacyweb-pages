const ejs = require('ejs');
const express = require('express');
const fs = require('fs');
const path = require('path');
const joi = require('joi');

const template = fs.readFileSync(path.join(__dirname, '..', 'templates', 'leftpane.ejs'), 'utf-8');

function indentString(str, n) {
	return str.split('\n').map(line => {
		return `${' '.repeat(n)}${line}`;
	}).join('\n');
}

const relativePath = joi.string().regex(/^\/[a-z0-9\/]*$/);

function LeftPage(theme, title, home, addHomeLink=true) {
    this.setTheme(theme);
    this.pages = [];
    this.links = [];
    this.addPage({
			path: '/',
			gen: home.gen,
			title,
			method: 'get'
    });
    if (addHomeLink) {
			this.addLink({
	    	url: '/',
	    	text: 'Home'
			});
    }
    this.headerHtml = '';
    this.port = process.env.EXPRESS_PORT || 3000;
    this.app = express();
    
    // Define static paths
    this.app.use('/images', express.static(path.join(__dirname, '..', 'images')));
}

LeftPage.prototype.setTheme = function(theme) {
	const themeFile = path.join(__dirname, '..', 'themes', `${theme}.json`);
	if (!fs.existsSync(themeFile)) {
		throw new Error(`Theme "${theme}" does not exist`);
	}
	this.theme = JSON.parse(fs.readFileSync(themeFile), 'utf-8');
}

LeftPage.prototype.setHeader = function(code) {
    this.headerHtml = code;
}

LeftPage.prototype.addLink = function(link) {
    joi.attempt(link, joi.object({
			url: joi.alternatives().try(joi.string().uri(), relativePath).required(),
			text: joi.string().min(1).required()
    }));
    this.links.push(link);
}

LeftPage.prototype.addPage = function(page) {
    let validatedPage = joi.attempt(page, joi.object({
			path: relativePath.required(),
			gen: joi.func().required(),
			title: joi.string().min(1).required(),
			method: joi.string().valid('get', 'post').default('get'),
			middleware: joi.array().default([])
    }));

    this.pages.push(validatedPage);
}

LeftPage.prototype.start = function() {

	const leftPage = this;

	this.pages.forEach(page => {
		const renderPage = async function(req, res) {
			try {
				// Render content first in case we want to change the theme, header, etc. as part of the gen fn
				const content = await page.gen(req, res);

				const data = Object.assign({
					page: {
						header: leftPage.headerHtml,
						links: leftPage.links,
						content
					}
				}, leftPage.theme);
				const renderedPage = ejs.render(template, data);

				res.status(200).send(renderedPage);
			} catch (err) {
				const statusCode = err.status || 500;
				return res.status(statusCode).send(err.message);
			}
		}

		switch (page.method) {
			case 'post':
				leftPage.app.post(page.path, page.middleware, renderPage);
				return;
			default:
				leftPage.app.get(page.path, page.middleware, renderPage);
				return;
		}
	});

    this.app.listen(this.port);
}

module.exports = LeftPage
