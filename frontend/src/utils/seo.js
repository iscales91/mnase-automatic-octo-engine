/**
 * SEO Utilities - Meta tags and structured data management
 */

/**
 * Update page meta tags
 */
export const updateMetaTags = ({
  title = 'MNASE Basketball League',
  description = 'Premier basketball league offering elite programs, camps, clinics, and competitive opportunities for youth athletes in Minneapolis.',
  keywords = 'basketball, youth sports, basketball league, basketball camps, basketball clinics, Minneapolis basketball, MNASE',
  image = '/logo.png',
  url = window.location.href,
  type = 'website'
}) => {
  // Update title
  document.title = title;

  // Update or create meta tags
  const metaTags = {
    // Standard meta tags
    'description': description,
    'keywords': keywords,
    
    // Open Graph tags for social media
    'og:title': title,
    'og:description': description,
    'og:image': image,
    'og:url': url,
    'og:type': type,
    'og:site_name': 'MNASE Basketball League',
    
    // Twitter Card tags
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': image,
  };

  Object.entries(metaTags).forEach(([name, content]) => {
    let element;
    
    // Check if it's an og: or twitter: tag
    if (name.startsWith('og:')) {
      element = document.querySelector(`meta[property="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', name);
        document.head.appendChild(element);
      }
    } else if (name.startsWith('twitter:')) {
      element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
    } else {
      element = document.querySelector(`meta[name="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('name', name);
        document.head.appendChild(element);
      }
    }
    
    element.setAttribute('content', content);
  });
};

/**
 * Generate structured data (JSON-LD) for SEO
 */
export const generateStructuredData = (type, data) => {
  const baseData = {
    '@context': 'https://schema.org',
  };

  let structuredData = { ...baseData };

  switch (type) {
    case 'organization':
      structuredData = {
        ...baseData,
        '@type': 'SportsOrganization',
        name: 'MNASE Basketball League',
        description: 'Premier basketball league offering elite programs, camps, clinics, and competitive opportunities for youth athletes.',
        url: 'https://courtside-22.preview.emergentagent.com',
        logo: 'https://courtside-22.preview.emergentagent.com/logo.png',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Minneapolis',
          addressRegion: 'MN',
          addressCountry: 'US'
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-612-555-1234',
          contactType: 'Customer Service',
          email: 'mnasebasketball@gmail.com'
        },
        sameAs: [
          'https://facebook.com/mnasebasketball',
          'https://instagram.com/mnasebasketball',
          'https://twitter.com/mnasebasketball'
        ]
      };
      break;

    case 'event':
      structuredData = {
        ...baseData,
        '@type': 'SportsEvent',
        name: data.title,
        description: data.description,
        startDate: data.date,
        location: {
          '@type': 'Place',
          name: data.location,
          address: data.address || 'Minneapolis, MN'
        },
        offers: {
          '@type': 'Offer',
          price: data.price || 0,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
          url: data.url || window.location.href
        },
        organizer: {
          '@type': 'Organization',
          name: 'MNASE Basketball League',
          url: 'https://courtside-22.preview.emergentagent.com'
        }
      };
      break;

    case 'breadcrumb':
      structuredData = {
        ...baseData,
        '@type': 'BreadcrumbList',
        itemListElement: data.items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.name,
          item: item.url
        }))
      };
      break;

    default:
      return null;
  }

  return structuredData;
};

/**
 * Add structured data script to page
 */
export const addStructuredData = (type, data) => {
  const structuredData = generateStructuredData(type, data);
  
  if (!structuredData) return;

  // Remove existing structured data of this type
  const existingScript = document.querySelector(`script[data-schema-type="${type}"]`);
  if (existingScript) {
    existingScript.remove();
  }

  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-schema-type', type);
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
};

/**
 * Page-specific SEO configurations
 */
export const pageSEO = {
  home: {
    title: 'MNASE Basketball League - Premier Youth Basketball Programs',
    description: 'Join MNASE Basketball League for elite youth basketball programs, competitive tournaments, professional camps, and skill development clinics in Minneapolis.',
    keywords: 'youth basketball, basketball league, Minneapolis basketball, basketball programs, elite basketball training'
  },
  
  programs: {
    title: 'Basketball Programs - MNASE Basketball League',
    description: 'Explore our comprehensive basketball programs including youth leagues, competitive tournaments, elite training, and development programs for all skill levels.',
    keywords: 'basketball programs, youth basketball league, competitive basketball, basketball training programs'
  },
  
  memberships: {
    title: 'Membership Plans - MNASE Basketball League',
    description: 'Choose from individual or team membership plans with exclusive access to facilities, events, training sessions, and priority registration.',
    keywords: 'basketball membership, sports membership, youth sports membership, basketball facility access'
  },
  
  events: {
    title: 'Events & Calendar - MNASE Basketball League',
    description: 'Browse upcoming basketball events, tournaments, camps, clinics, and workshops. Register for events and view our complete calendar.',
    keywords: 'basketball events, basketball tournaments, basketball camps, basketball clinics, sports calendar'
  },
  
  facilities: {
    title: 'Facilities - MNASE Basketball League',
    description: 'Book premium basketball courts and training facilities with state-of-the-art equipment in Minneapolis.',
    keywords: 'basketball facilities, basketball courts, sports facility rental, basketball venue'
  },
  
  about: {
    title: 'About Us - MNASE Basketball League',
    description: 'Learn about MNASE Basketball League, our mission to develop youth athletes, our coaching staff, and our commitment to excellence.',
    keywords: 'about MNASE, basketball organization, youth sports organization, Minneapolis basketball'
  },
  
  contact: {
    title: 'Contact Us - MNASE Basketball League',
    description: 'Get in touch with MNASE Basketball League. Contact us for program information, facility bookings, or general inquiries.',
    keywords: 'contact MNASE, basketball league contact, sports program inquiry'
  }
};

/**
 * Apply SEO for a specific page
 */
export const applySEO = (pageName, customData = {}) => {
  const pageConfig = pageSEO[pageName] || {};
  const seoData = { ...pageConfig, ...customData };
  
  updateMetaTags(seoData);
  
  // Add organization structured data on every page
  addStructuredData('organization');
  
  return seoData;
};

export default {
  updateMetaTags,
  generateStructuredData,
  addStructuredData,
  applySEO,
  pageSEO
};
