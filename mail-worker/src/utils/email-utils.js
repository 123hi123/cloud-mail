import { parseHTML } from 'linkedom';

const CLAUDE_MAGIC_LINK_REGEX = /https:\/\/(?:claude\.ai|platform\.claude\.com)\/magic-link(?:\/android)?#[^\s"'<>]+/i;

const emailUtils = {

	getDomain(email) {
		if (typeof email !== 'string') return '';
		const parts = email.split('@');
		return parts.length === 2 ? parts[1] : '';
	},

	getName(email) {
		if (typeof email !== 'string') return '';
		const parts = email.trim().split('@');
		return parts.length === 2 ? parts[0] : '';
	},

	formatText(text) {
		if (!text) return ''
		return text
			.split('\n')
			.map(line => {
				return line.replace(/[\u200B-\u200F\uFEFF\u034F\u200B-\u200F\u00A0\u3000\u00AD]/g, '')
					.replace(/\s+/g, ' ')
					.trim();
			})
			.join('\n')
			.replace(/\n{3,}/g, '\n')
			.trim();
	},

	escapeHtml(text) {
		if (text == null) return '';
		return String(text)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	},

	truncateText(text, maxLength = 3000) {
		if (!text) return '';
		if (text.length <= maxLength) return text;
		return `${text.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
	},

	extractHtmlLinks(content) {
		if (!content) return [];
		try {
			const wrappedContent = content.includes('<body')
				? content
				: `<!DOCTYPE html><html><body>${content}</body></html>`;
			const { document } = parseHTML(wrappedContent);
			return [...document.querySelectorAll('a[href]')]
				.map(el => el.getAttribute('href') || '')
				.map(link => link.trim())
				.filter(Boolean);
		} catch (e) {
			console.error(e);
			return [];
		}
	},

	extractClaudeMagicLink(email) {
		const content = email?.content || '';
		const text = email?.text || '';
		const candidates = [
			...this.extractHtmlLinks(content),
			text,
			content
		];

		for (const candidate of candidates) {
			const match = String(candidate || '').match(CLAUDE_MAGIC_LINK_REGEX);
			if (match) {
				return match[0];
			}
		}
		return '';
	},

	htmlToText(content) {
		if (!content) return ''
		try {
			const wrappedContent = content.includes('<body')
				? content
				: `<!DOCTYPE html><html><body>${content}</body></html>`;
			const { document } = parseHTML(wrappedContent);
			document.querySelectorAll('style, script, title').forEach(el => el.remove());
			let text = document.body.innerText;
			return this.formatText(text);
		} catch (e) {
			console.error(e)
			return ''
		}
	}
};

export default emailUtils;
