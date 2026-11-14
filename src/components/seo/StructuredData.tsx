import React from 'react';

export const StructuredData: React.FC = () => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://uni-code-preeti-convertor.vercel.app';

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'नेपाली अनुवादक, बृहत् शब्दकोश र टाइपिङ मास्टर (Nepali Unicode ↔ Preeti Converter)',
    alternateName: ['Nepali Unicode to Preeti Converter', 'Preeti to Unicode', 'Nepali Typing Master Pro', 'Nepali Brihat Sabdakosh'],
    url: baseUrl,
    applicationCategory: 'EducationalApplication, UtilitiesApplication',
    operatingSystem: 'Windows, macOS, Linux, Android, iOS',
    inLanguage: ['ne', 'en'],
    description:
      'नेपालको नम्बर १ अनलाइन नेपाली युनिकोड र प्रिती द्वि-दिशात्मक अनुवादक, १,२३,०००+ बृहत् शब्दकोश, १५-तह टाइपिङ मास्टर, टाइप्सला क्यानभास गेमहरू र बहुउपयोगी नेपाली टुलकिट।',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NPR',
    },
    featureList: [
      'युनिकोड ↔ प्रिती तत्काल द्वि-दिशात्मक रूपान्तरण',
      '१,२३,०००+ आधिकारिक शब्दहरू सहितको नेपाली डिजिटल बृहत् शब्दकोश',
      '१५ तह नेपाली टाइपिङ मास्टर विथ ३डी वास्तविक हात गाइड',
      '३ क्यानभास टाइपिङ आर्केड गेमहरू (हिमाली शब्द रक्षा, बेलुन फोड्ने, नेपाल एक्सप्रेस)',
      'नेपाली उखान-टुक्का तथा वाग्धारा सङ्ग्रह',
      'नेपाली हिज्जे तथा हस्व-दीर्घ परीक्षक (Spell Checker with auto-suggestions)',
      'माइक्रोसफ्ट वर्ड (.docx) र एक्सेल (.xlsx) फन्ट रूपान्तरण',
      'अनुकूलित A4 मुद्रण तथा मार्जिन नियन्त्रण',
      'रोमनाइज्ड नेपाली र बहु-फन्ट रूपान्तरण (Kantipur, Fontasy Himali, PCS, Sagarmatha)',
      'अङ्क र अक्षर रूपान्तरण (बैंक चेक तथा भौचरका लागि)',
      'नेपाली मिति रूपान्तरक (वि.सं. ↔ ई.सं. BS ↔ AD)',
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'नेपाली युनिकोडलाई प्रिती फन्टमा कसरी परिवर्तन गर्ने?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'बायाँ बाकसमा युनिकोड नेपाली टाइप वा पेस्ट गर्नुहोस्, दायाँ बाकसमा तत्काल प्रिती फन्टमा रूपान्तरित नतिजा प्राप्त हुनेछ। त्यसपछि एक क्लिकमा कपी वा A4 साइजमा प्रिन्ट गर्न सक्नुहुन्छ।',
        },
      },
      {
        '@type': 'Question',
        name: 'प्रिती फन्टबाट युनिकोडमा कसरी रूपान्तरण गर्ने?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'दिशा बदल्नुहोस् (Swap Direction) बटन थिच्नुहोस् वा "प्रिती → युनिकोड" विकल्प छान्नुहोस्। त्यसपछि प्रिती फन्टको टेक्स्ट पेस्ट गर्दा तुरुन्त शुद्ध युनिकोड देवनागरीमा परिवर्तन हुनेछ।',
        },
      },
      {
        '@type': 'Question',
        name: 'नेपाली टाइपिङ मास्टर प्रो कसरी प्रयोग गर्ने?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'टाइपिङ मास्टर ट्याबमा जानुहोस् जहाँ १५ तहको चरणबद्ध पाठ्यक्रम उपलब्ध छ। यसमा होम रो, अनसिफ्ट र सिफ्ट कुञ्जीहरूको ३डी हात गाइड सहित अभ्यास गर्न सकिन्छ।',
        },
      },
      {
        '@type': 'Question',
        name: 'के यो नेपाली अनुवादक पूर्ण रूपमा सुरक्षित र निःशुल्क छ?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'हो, यो १००% निःशुल्क, सुरक्षित र क्लाइन्ट-साइड छ। तपाईंको कुनै पनि संवेदनशील कागजात वा व्यक्तिगत डेटा सर्भरमा पठाइँदैन।',
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
};
