import emailUtils from '../utils/email-utils';

export default function emailMsgTemplate(email, tgMsgTo, tgMsgFrom, tgMsgText) {

	let template = `<b>${email.subject}</b>`

		if (tgMsgFrom === 'only-name') {
			template += `

From\u200B：${email.name}`
		}

		if (tgMsgFrom === 'show') {
			template += `

From\u200B：${email.name}  &lt;${email.sendEmail}&gt;`
		}

		if(tgMsgTo === 'show' && tgMsgFrom === 'hide') {
			template += `

To：\u200B${email.toEmail}`

		} else if(tgMsgTo === 'show') {
		template += `
To：\u200B${email.toEmail}`
	}

	const magicLink = emailUtils.extractClaudeMagicLink(email);
	const text = emailUtils.truncateText(
		emailUtils.formatText(email.text) || emailUtils.htmlToText(email.content),
		3000
	);

	if (magicLink) {
		const escapedMagicLink = emailUtils.escapeHtml(magicLink);
		template += `

Magic Link：\u200B<a href="${escapedMagicLink}">${escapedMagicLink}</a>`
	}

	if(tgMsgText === 'show') {
		const escapedText = emailUtils.escapeHtml(text);
		template += `

${escapedText}`
	}

	return template;

}
