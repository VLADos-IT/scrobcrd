const defaultTemplate = require('./default');
const compactTemplate = require('./compact');
const osxTemplate = require('./osx');
const retroTemplate = require('./retro');
const xorgTemplate = require('./xorg');

const templates = {
	default: defaultTemplate,
	compact: compactTemplate,
	osx: osxTemplate,
	retro: retroTemplate,
	xorg: xorgTemplate
};

function normalizeTemplate(template) {
	return (typeof template === 'function') ? { render: template } : template;
}

function cardDispatcher(params) {
	const theme = templates[params.theme] ? params.theme : 'default';
	const numericWidth = parseInt(params.width, 10);
	const templateObj = normalizeTemplate(templates[theme]);
	const defaultObj = normalizeTemplate(defaultTemplate);

	if (theme !== 'compact' && numericWidth < 190) {
		if (numericWidth === 120) {
			const tiny = templateObj.renderTiny || (defaultObj && defaultObj.renderTiny);
			if (tiny) return tiny(params);
		}
		if (numericWidth > 120) {
			const narrow = templateObj.renderNarrow || (defaultObj && defaultObj.renderNarrow);
			if (narrow) return narrow(params);
		}
	}

	return templateObj.render(params);
}

module.exports = cardDispatcher;
