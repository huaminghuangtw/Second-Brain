let { arr } = input;

let callout = "> [!SUMMARY]- 🌸 Retrospection" + arr.map(element => 
    `\n> ### ${element.headerText}\n` + 
    element.pages.map(({ page, url }) => `> * <sub>[${page.date.toISODate()} (${page.dayOfWeek})](${url})</sub>`).join('\n')
).join('');

dv.paragraph(callout);