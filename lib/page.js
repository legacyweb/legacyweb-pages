const ejs = require('ejs');
const express = require('express');
const fs = require('fs');
const path = require('path');
const joi = require('joi');

const relativePath = joi.string().regex(/^\/[a-z0-9\/]*$/);

function Page(template, theme, title, home, addHomeLink=true) {
	this.setTemplate(template);
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

Page.prototype.setTemplate = function(template) {
	const templateFile = path.join(__dirname, '..', 'templates', `${template}.ejs`);
	if (!fs.existsSync(templateFile)) {
		throw new Error(`Theme "${templateFile}" does not exist`);
	}
	this.template = fs.readFileSync(templateFile, 'utf-8');
}

Page.prototype.setTheme = function(theme) {
	const themeFile = path.join(__dirname, '..', 'themes', `${theme}.json`);
	if (!fs.existsSync(themeFile)) {
		throw new Error(`Theme "${theme}" does not exist`);
	}
	this.theme = JSON.parse(fs.readFileSync(themeFile), 'utf-8');
}

Page.prototype.setHeader = function(code) {
    this.headerHtml = code;
}

Page.prototype.addLink = function(link) {
    joi.attempt(link, joi.object({
			url: joi.alternatives().try(joi.string().uri(), relativePath).required(),
			text: joi.string().min(1).required()
    }));
    this.links.push(link);
}

Page.prototype.addPage = function(page) {
    let validatedPage = joi.attempt(page, joi.object({
			path: relativePath.required(),
			gen: joi.func().required(),
			title: joi.string().min(1).required(),
			method: joi.string().valid('get', 'post').default('get'),
			middleware: joi.array().default([])
    }));

    this.pages.push(validatedPage);
}

Page.prototype.start = function() {

	const legacyPage = this;

	this.pages.forEach(page => {
		const renderPage = async function(req, res) {
			try {
				// Render content first in case we want to change the theme, header, etc. as part of the gen fn
				const content = await page.gen(req, res);

				const data = Object.assign({
					page: {
						header: legacyPage.headerHtml,
						links: legacyPage.links,
						content
					}
				}, legacyPage.theme);
				const renderedPage = ejs.render(legacyPage.template, data);

				res.status(200).send(renderedPage);
			} catch (err) {
				const statusCode = err.status || 500;
				return res.status(statusCode).send(err.message);
			}
		}

		switch (page.method) {
			case 'post':
				legacyPage.app.post(page.path, page.middleware, renderPage);
				return;
			default:
				legacyPage.app.get(page.path, page.middleware, renderPage);
				return;
		}
	});

    this.app.listen(this.port);
}

module.exports = Page
