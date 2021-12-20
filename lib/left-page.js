const pug = require('pug');
const express = require('express');
const fs = require('fs');
const path = require('path');
const joi = require('joi');

function indentString(str, n) {
	return str.split('\n').map(line => {
		return `${' '.repeat(n)}${line}`;
	}).join('\n');
}

const relativePath = joi.string().regex(/^\/[a-z0-9\/]*$/);

function LeftPage(theme, title, home, addHomeLink=true) {
    this.setTheme(theme);
    this.templateHtml = 'extends /templates/leftpane.pug';
    this.pages = [];
    this.links = [];
    this.addPage({
			path: '/',
			pugFile: home.pugFile,
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
	const themeFile = path.join(__dirname, '..', 'themes', `${theme}.css`);
	if (!fs.existsSync(themeFile)) {
		throw new Error(`Theme "${theme}" does not exist`);
	}
	this.themeFile = `/themes/${theme}.css`;
}

LeftPage.prototype.setHeader = function(pugFile) {
    const pugCode = fs.readFileSync(pugFile, 'utf-8');
    this.headerHtml = pugCode;
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
			pugFile: joi.string().min(1).required(),
			gen: joi.func().required(),
			title: joi.string().min(1).required(),
			method: joi.string().valid('get', 'post').default('get'),
			middleware: joi.array().default([])
    }));

		validatedPage.pugCode = fs.readFileSync(validatedPage.pugFile, 'utf-8');
    this.pages.push(validatedPage);
}

LeftPage.prototype.renderLinks = function(link) {
	this.linksHtml = this.links.map(link => {
		return `a(href="${link.url}") ${link.text}`;
	}).join('\n');
}

LeftPage.prototype.renderPage = async function(page, req, res) {
	let parameters = await page.gen(req, res);
	parameters = Object.assign({
		basedir: path.join(__dirname, '..')
	}, parameters);

	this.renderLinks();

	const baseHtml = [
		this.templateHtml,
		'block style',
		'  style',
		`    include ${this.themeFile}`,
		'block banner',
		indentString(this.headerHtml, 2),
		'block links',
		indentString(this.linksHtml, 2),
		'block title',
		`  title ${page.title}`,
		page.pugCode
	].join('\n');

	return pug.render(baseHtml, parameters);
}

LeftPage.prototype.start = function() {

	const leftPage = this;

	this.pages.forEach(page => {
		const renderPage = async function(req, res) {
			try {
				const renderedPage = await leftPage.renderPage(page, req, res);
				res.status(200).send(renderedPage);
			} catch (err) {
				const statusCode = err.status || 500;
				return res.status(err.status).send(err.message);
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
