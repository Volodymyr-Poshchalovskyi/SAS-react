import React from 'react';

// Дані політики конфіденційності залишаються без змін
const policyData = [
  // ... (вміст масиву policyData не змінюється)
  {
    type: 'intro',
    content: [
      'Welcome to the Sinners and Saints, LLC website located at www.sinnersandsaints.la (“Website”). The Website is operated by Sinners and Saints, LLC (“we,” “us,” or “our”). We believe that the privacy and security of your information and data is very important. This Privacy Policy (“Policy”) explains the type of personal information (“Personal Information”) we collect from users of the Website (“You”), how that Personal Information is used, how the Information may be shared with other parties, and what controls You have regarding Your Personal Information. We collect, use and make available this Personal Information in accordance with the principles set out in this Policy and applicable law.',
      'Residents of the European Economic Area (“EEA”), which includes the member states of the European Union (“EU”), residents of the United Kingdom (“UK”) and residents of Switzerland, should consult the sections below of this policy relating to “International Data Transfers” and the “Rights of EEA, UK and Swiss Residents” for provisions that may apply to them.',
      'Users in California and states with comparable privacy laws should consult the section below regarding their rights and choices in regard to Personal Information.',
      'We encourage you to read this Policy carefully. We reserve the right to change this Policy at any time. Any updates or modifications to this Policy will be posted to our website on this page. By using or accessing the Website, you signify that you have read, understand and agree to be bound by this Policy. This Policy is effective as of October 1st, 2024.',
    ],
  },
  {
    title: '1. When this Policy applies',
    content: [
      'This Policy applies when you use the Website or otherwise gather Personal Information about you. Please note that this Policy does not apply to our current or former employees or contractors. If you are a current or former employee or contractor, you may contact us about your privacy practices and rights at dataprivacy@sinnersandsaints.la.',
    ],
  },
  {
    title: '2. Personal Information we collect and how your Personal Information is collected',
    content: [
      'You may enter the Website and browse its contents without submitting any Personal Information. However, if you communicate with us we may at that time require that you provide Personal Information. Although our Website does not collect Personal Information about individuals, we may collect aggregated information regarding users of the Website that does not identify individual users.',
      'We may also collect technical information which includes information about your computer (for example your internet protocol (IP) address, your login data, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform, and other technology on the devices you use to access the Website).',
      'We may also collect usage data which includes information about your use of the Website, products and services. We also collect aggregated data such as statistical or demographic data for legitimate business purposes not prohibited herein or by applicable data protection law. Aggregated data may be derived from an individual’s personal information but is not considered personal data under applicable data protection law as this data will not directly or indirectly reveal your identity. For example, we may aggregate your Usage Data to calculate the percentage of users accessing a specific website feature.',
    ],
  },
  {
    title: '3. Uses and sharing of Personal Information',
    content: [
      { type: 'paragraph', text: 'We use your Personal Information where:' },
      {
        type: 'list',
        items: [
          'It is necessary for our legitimate interests (or those of a third party) and your interests and fundamental rights do not override those interests.',
          'We need to comply with a legal or regulatory obligation.',
          'We have your consent.',
        ],
      },
      { type: 'paragraph', text: 'If we contact you or provide any materials or information to you, you always will be given the opportunity to unsubscribe from further emails in any promotional messages we send you.' },
      { type: 'paragraph', text: 'We will not disclose, rent, sell or share any Personal Information to unaffiliated third parties for marketing purposes.' },
      { type: 'paragraph', text: 'We contract with companies or individuals to provide certain services including email and hosting services, software development, career or personnel services, etc. We call them our “Service Providers.” We may share your Personal Information with Service Providers solely as appropriate for them to perform their functions.' },
      { type: 'paragraph', text: 'We may share your Personal Information with analytics providers, such as Google Analytics and Tag Manager services, to tell us how the Website is doing, such as to which part interest visitors and how long they visit before leaving.' },
      { type: 'paragraph', text: 'Usage Data may be used in aggregate (anonymized) form for internal business purposes, such as generating statistics and developing marketing plans.' },
      { type: 'paragraph', text: 'Finally, we may share your Information:' },
      { type: 'paragraph', text: 'In response to subpoenas, court orders, or other legal process; to establish or exercise our legal rights; to defend against legal claims; or as otherwise required by law.' },
      { type: 'paragraph', text: 'When we believe it is appropriate to investigate, prevent, or take action regarding illegal or suspected illegal activities; to protect and defend the rights, property, or safety of our company, our users, or others; and in connection with our Terms of Use and other agreements.' },
      { type: 'paragraph', text: 'In connection with a corporate transaction, such as a divestiture, merger, consolidation, or asset sale, or in the unlikely event of bankruptcy.' },
      { type: 'paragraph', text: 'Please contact us if you need details about the specific legal ground we are relying on to process your personal data.' },
    ],
  },
  {
    title: '4. Data Retention – How long will we use your Personal Information?',
    content: [
      'We will only retain your personal data for as long as reasonably necessary to fulfil the purposes we collected it for as specified in this Policy, including for the purposes of satisfying any legal, regulatory, tax, accounting or reporting requirements.',
      'To determine the appropriate retention period, we consider the amount, nature, and sensitivity of the data, the potential risk of harm from unauthorized use or disclosure, and the applicable legal requirements.',
    ],
  },
  {
    title: '5. International Data Transfers',
    content: [
      'Personal Information that is transferred to us may be stored or processed in the United States, which does not have data protection laws equivalent to those in the UK or the EEA and other jurisdictions.',
      'If you do not wish your Personal Information to be stored or processed in the United States, please do not provide such information to us.',
    ],
  },
  {
    title: '6. Privacy and security',
    content: [
      'It is entirely your choice whether or not you provide Personal Information to us. We take commercially reasonable precautions to protect Personal Information against loss, misuse, unauthorized disclosure, alteration, and destruction. However, no transmission over the Internet can be guaranteed 100% secure.',
      'If you believe your Personal Information is being improperly used, please immediately notify us via email at dataprivacy@sinnersandsaints.la.',
    ],
  },
  {
    title: '7. Cookies',
    content: [
      'We may use cookies, web beacons, or similar tracking technologies to improve your user experience. You can configure your browser to prevent cookies, but this may make certain features of the Website unavailable.',
    ],
  },
  {
    title: '8. Children under 16',
    content: [
      'We do not knowingly collect or solicit personal information directly from anyone under the age of 16. If we learn that we have collected such information, we will delete it immediately. If you are a parent or guardian and believe your child has provided us with Personal Information, please contact us at dataprivacy@sinnersandsaints.la.',
    ],
  },
  {
    title: '9. Links to third-party websites',
    content: [
      'Our Website or emails may contain links to third party websites to which we have no affiliation. We are not responsible for the privacy practices of those websites.',
    ],
  },
  {
    title: '10. Your rights and obligations',
    content: [
      'Please keep your Personal Information current and correct any inaccuracies by contacting us at dataprivacy@sinnersandsaints.la.',
    ],
  },
  {
    title: '11. Your California and other state privacy rights',
    content: [
      'This section applies if you reside in California or another U.S. state with comparable privacy laws. To submit a request to exercise a privacy right, please email dataprivacy@sinnersandsaints.la (with “Personal Information Request” in the subject line) or write to:',
    ],
  },
  {
    type: 'address',
    content: [
      'Sinners and Saints, LLC<br />7080 Hollywood Boulevard, 7th Floor<br />Los Angeles, California 90028',
    ],
  },
  {
    title: '12. Rights of EEA, UK and Swiss Residents',
    content: [
      'If you are a resident of the EEA, UK, or Switzerland and believe we have Personal Information about you, you may exercise your rights under applicable law by contacting us at dataprivacy@sinnersandsaints.la.',
    ],
  },
  {
    title: '13. Changes to this Privacy Policy',
    content: [
      'We reserve the right to change this Policy at any time. Please review it periodically for updates.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white text-black">
      <div className="w-[85%] mx-auto px-6 pt-[150px] pb-16 sm:pb-24 lg:px-8">
        <h1 className="font-['Inter'] text-3xl sm:text-4xl font-bold uppercase tracking-wider text-center mb-12">
          Privacy Policy
        </h1>

        {/* ✨ Змінено: Висота рядка зменшена з leading-normal на leading-tight */}
        <div className="font-['Inter'] text-xs leading-tight">
          {policyData.map((section, sectionIndex) => (
            <React.Fragment key={sectionIndex}>
              {section.title && (
                <p className="mb-4">{section.title}</p>
              )}
              
              {section.content.map((item, itemIndex) => {
                const uniqueKey = `${sectionIndex}-${itemIndex}`;

                if (typeof item === 'string') {
                   return (
                    <p key={uniqueKey} className="mb-4">{item}</p>
                  );
                }

                switch (item.type) {
                  case 'paragraph':
                    return (
                      <p key={uniqueKey} className="mb-4">{item.text}</p>
                    );
                  case 'list':
                    return (
                      <ul key={uniqueKey} className="list-disc pl-5 mb-4 space-y-2">
                        {item.items.map((listItem, listItemIndex) => (
                          <li key={`${uniqueKey}-${listItemIndex}`}>{listItem}</li>
                        ))}
                      </ul>
                    );

                  case 'address':
                    // У цьому випадку ми рендеримо HTML напряму, тому клас className не застосовується
                    // до внутрішніх тегів. Якщо потрібно, треба буде стилізувати інакше.
                    return (
                      <p
                        key={uniqueKey}
                        className="mb-4"
                        dangerouslySetInnerHTML={{ __html: item.content.join('') }}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}