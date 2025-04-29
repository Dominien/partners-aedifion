// Partner Ecosystem Script for Webflow
document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const searchInput = document.querySelector('#name');
  const categorySelect = document.querySelector('#Kategorien-filtern');
  // Find all partners link - more flexible to work with both English and German versions
  const allPartnersLink = document.querySelector('.category-link.current') || 
                          Array.from(document.querySelectorAll('.category-link')).find(link => 
                             link.textContent.trim() === 'All partners' || 
                             link.textContent.trim() === 'Alle Partner'
                          );
  // Get all other category links
  const categoryLinks = document.querySelectorAll('.category-link:not(.current)');
  const partnerCards = document.querySelectorAll('.wrapper-partner-cards');
  
  // Variables for state management
  let currentCategory = 'all';
  let searchTerm = '';
  
  // Initialize the page with all partners shown
  showAllPartners();
  
  // Setup event listeners
  searchInput.addEventListener('input', handleSearch);
  searchInput.addEventListener('keydown', handleSearchKeydown);
  categorySelect.addEventListener('change', handleCategoryChange);
  
  // Make sure we have an "All Partners" link before adding event listener
  if (allPartnersLink) {
    allPartnersLink.addEventListener('click', handleAllPartnersClick);
  }
  
  // Also handle "All partners" links that might not have the current class initially
  document.querySelectorAll('.category-link').forEach(link => {
    if (link.textContent.trim() === 'All partners' || link.textContent.trim() === 'Alle Partner') {
      link.addEventListener('click', handleAllPartnersClick);
    }
  });
  
  // Prevent form submission on Enter key
  const form = document.querySelector('.w-form form');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    return false;
  });
  
  // Add event listeners to category links
  categoryLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const categoryName = this.textContent.trim();
      handleCategoryLinkClick(categoryName);
    });
  });
  
  // Functions
  function handleSearch(e) {
    searchTerm = e.target.value.toLowerCase();
    applyFilters();
  }
  
  function handleSearchKeydown(e) {
    // Prevent form submission on Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      return false;
    }
  }
  
  function handleCategoryChange(e) {
    const selectedOption = e.target.options[e.target.selectedIndex];
    const selectedCategory = e.target.value.trim();
    const selectedCategoryText = selectedOption.text.trim();
    
    if (selectedCategory) {
      // Create a mapping for German values to English display text
      const categoryValueToText = {
        "Asset-Property-Management": "Asset Property Management",
        "Facility-Management / CAFM": "Facility Management / CAFM",
        "Smart Metering / Submetering": "Smart Metering / Submetering",
        "Beratungs-, Planungs- und Umsetzungspartner": "Consulting, Planning, and Implementation Partner",
        "Standards und Zertifizierung": "Standards and Certification",
        "ESG-Software": "ESG Software",
        "Technisches-Monitoring-Software": "Technical Monitoring Software",
        "Aktive-Betriebsoptimierung-Software": "Active Operational Optimization Software",
        "Workspace Apps / Smart Building": "Workspace Apps / Smart Building",
        "Technische Gebäudeausrüstung": "Technical Building Equipment"
      };
      
      // Use the text from the mapping if available, otherwise use the option text
      const mappedCategory = categoryValueToText[selectedCategory.trim()] || selectedCategoryText;
      
      // Update current category
      currentCategory = mappedCategory;
      
      // Make sure to find the closest matching link in the UI
      document.querySelectorAll('.category-link').forEach(link => {
        if (link.textContent.trim() === "Facility Management / CAFM" && 
            (selectedCategory.includes("Facility-Management") || mappedCategory.includes("Facility Management"))) {
          updateActiveCategoryLink("Facility Management / CAFM");
          return;
        }
      });
      
      // If not special case, update normally
      updateActiveCategoryLink(mappedCategory);
    } else {
      currentCategory = 'all';
      updateActiveCategoryLink('all');
    }
    applyFilters();
  }
  
  function handleCategoryLinkClick(categoryName) {
    currentCategory = categoryName;
    updateActiveCategoryLink(categoryName);
    
    // Define category mappings between English display text and German dropdown values
    const categoryTextToValue = {
      "Asset Property Management": "Asset-Property-Management",
      "Facility Management / CAFM": "Facility-Management / CAFM",
      "Smart Metering / Submetering": "Smart Metering / Submetering",
      "Technical Building Equipment": "Technische Gebäudeausrüstung",
      "Consulting, Planning, and Implementation Partner": "Beratungs-, Planungs- und Umsetzungspartner",
      "Standards and Certification": "Standards und Zertifizierung",
      "ESG Software": "ESG-Software",
      "Technical Monitoring Software": "Technisches-Monitoring-Software",
      "Active Operational Optimization Software": "Aktive-Betriebsoptimierung-Software",
      "Workspace Apps / Smart Building": "Workspace Apps / Smart Building"
    };
    
    // First try direct mapping to dropdown value
    const dropdownValue = categoryTextToValue[categoryName];
    if (dropdownValue) {
      // Try to find this exact value in dropdown
      const matchingOption = Array.from(categorySelect.options).find(option => 
        option.value.trim() === dropdownValue.trim() || option.value.includes(dropdownValue.trim())
      );
      
      if (matchingOption) {
        categorySelect.value = matchingOption.value;
        return applyFilters();
      }
    }
    
    // If no direct mapping, try matching by text
    let foundMatch = false;
    Array.from(categorySelect.options).forEach(option => {
      // Check if option text matches the category name
      if (option.text.trim() === categoryName.trim()) {
        categorySelect.value = option.value;
        foundMatch = true;
      }
    });
    
    // If still no match, try a more flexible approach
    if (!foundMatch) {
      // Get all possible variant names for the category
      const allCategoryNames = Object.entries(categoryTextToValue).flatMap(([english, german]) => [english, german]);
      
      // Find variants that might match the current category name
      const possibleMatches = allCategoryNames.filter(name => 
        name.includes(categoryName) || categoryName.includes(name)
      );
      
      // Try to match any option text with possible matches
      Array.from(categorySelect.options).forEach(option => {
        if (possibleMatches.some(match => 
            option.text.trim().includes(match) || 
            match.includes(option.text.trim())
        )) {
          categorySelect.value = option.value;
          foundMatch = true;
        }
      });
      
      // Last resort - try partial matching
      if (!foundMatch) {
        Array.from(categorySelect.options).forEach(option => {
          // Handle partial match
          if (option.text.trim().includes(categoryName.trim()) || 
              categoryName.trim().includes(option.text.trim())) {
            categorySelect.value = option.value;
          }
        });
      }
    }
    
    applyFilters();
  }
  
  function handleAllPartnersClick(e) {
    e.preventDefault();
    currentCategory = 'all';
    updateActiveCategoryLink('all');
    categorySelect.value = ''; // Reset dropdown
    applyFilters();
  }
  
  function updateActiveCategoryLink(categoryName) {
    // Remove current class from all links
    document.querySelectorAll('.category-link').forEach(link => {
      link.classList.remove('current');
      if (link.parentElement.classList.contains('with-icon')) {
        link.classList.remove('current-white');
      }
    });
    
    document.querySelectorAll('.with-icon').forEach(container => {
      container.classList.remove('current');
    });
    
    document.querySelectorAll('.icon-embed-xsmall').forEach(icon => {
      icon.classList.remove('current-white');
    });
    
    // Add current class to selected link
    if (categoryName === 'all') {
      // Find any "All partners" link in either language
      const allPartnerLinks = Array.from(document.querySelectorAll('.category-link')).filter(link => 
        link.textContent.trim() === 'All partners' || 
        link.textContent.trim() === 'Alle Partner'
      );
      
      if (allPartnerLinks.length > 0) {
        allPartnerLinks.forEach(link => link.classList.add('current'));
      } else if (allPartnersLink) {
        allPartnersLink.classList.add('current');
      }
    } else {
      // Find matching category in both languages with all possible variations
      const categoryMap = {
        "Asset Property Management": ["Asset Property Management", "Asset-Property-Management", "Asset and real estate management", "Asset- und Immobilienverwaltung"],
        "Facility Management / CAFM": ["Facility Management / CAFM", "Facility-Management / CAFM", "Facility Management/CAFM", "Facility Management"],
        "Smart Metering / Submetering": ["Smart Metering / Submetering", "Smart metering/undermeasurement", "Smart Metering / Untermessung"],
        "Technical Building Equipment": ["Technical Building Equipment", "Technische Gebäudeausrüstung", "Technical building equipment"],
        "Consulting, Planning, and Implementation Partner": ["Consulting, Planning, and Implementation Partner", "Beratungs-, Planungs- und Umsetzungspartner", "Consulting & implementation", "Beratung & Implementierung"],
        "Standards and Certification": ["Standards and Certification", "Standards und Zertifizierung", "Standards and certification"],
        "ESG Software": ["ESG Software", "ESG-Software", "ESG software"],
        "Technical Monitoring Software": ["Technical Monitoring Software", "Technisches-Monitoring-Software", "Technical monitoring software", "Technische Überwachungssoftware"],
        "Active Operational Optimization Software": ["Active Operational Optimization Software", "Aktive-Betriebsoptimierung-Software", "Operational optimization", "Betriebliche Optimierung"],
        "Workspace Apps / Smart Building": ["Workspace Apps / Smart Building", "Workspace apps/smart building", "Workspace-Apps/Smart Building"]
      };
      
      // Find matching category variants
      let possibleMatches = [];
      for (const [key, variants] of Object.entries(categoryMap)) {
        if (variants.includes(categoryName) || variants.some(v => v.includes(categoryName) || categoryName.includes(v))) {
          possibleMatches = [...possibleMatches, ...variants];
        }
      }
      
      if (categoryName) {
        possibleMatches.push(categoryName);
      }
      
      // Apply current class to any matching link
      document.querySelectorAll('.category-link').forEach(link => {
        const linkText = link.textContent.trim();
        // Special case for Facility Management due to format issues
        if (categoryName && 
            (categoryName.includes("Facility") || categoryName.includes("CAFM")) && 
            (linkText.includes("Facility") || linkText.includes("CAFM"))) {
          if (link.closest('.with-icon')) {
            link.classList.add('current-white');
            link.closest('.with-icon').classList.add('current');
            link.closest('.with-icon').querySelector('.icon-embed-xsmall').classList.add('current-white');
          } else {
            link.classList.add('current');
          }
        }
        // Regular matching
        else if (possibleMatches.includes(linkText) || possibleMatches.some(m => linkText.includes(m) || m.includes(linkText))) {
          if (link.closest('.with-icon')) {
            link.classList.add('current-white');
            link.closest('.with-icon').classList.add('current');
            link.closest('.with-icon').querySelector('.icon-embed-xsmall').classList.add('current-white');
          } else {
            link.classList.add('current');
          }
        }
      });
    }
  }
  
  function applyFilters() {
    let hasVisiblePartners = false;
    
    // For each partner card section
    partnerCards.forEach(cardSection => {
      const categoryTitle = cardSection.querySelector('.heading-partner').textContent.trim();
      
      // Create a comprehensive mapping of category equivalents in both languages
      const categoryEquivalents = {
        "Asset Property Management": ["Asset Property Management", "Asset-Property-Management", "Asset and real estate management", "Asset- und Immobilienverwaltung"],
        "Facility Management / CAFM": ["Facility Management / CAFM", "Facility-Management / CAFM", "Facility Management/CAFM", "Facility Management"],
        "Smart Metering / Submetering": ["Smart Metering / Submetering", "Smart metering/undermeasurement", "Smart Metering / Untermessung"],
        "Technical Building Equipment": ["Technical Building Equipment", "Technische Gebäudeausrüstung", "Technical building equipment"],
        "Consulting, Planning, and Implementation Partner": ["Consulting, Planning, and Implementation Partner", "Beratungs-, Planungs- und Umsetzungspartner", "Consulting & implementation", "Beratung & Implementierung"],
        "Standards and Certification": ["Standards and Certification", "Standards und Zertifizierung", "Standards and certification"],
        "ESG Software": ["ESG Software", "ESG-Software", "ESG software"],
        "Technical Monitoring Software": ["Technical Monitoring Software", "Technisches-Monitoring-Software", "Technical monitoring software", "Technische Überwachungssoftware"],
        "Active Operational Optimization Software": ["Active Operational Optimization Software", "Aktive-Betriebsoptimierung-Software", "Operational optimization", "Betriebliche Optimierung"],
        "Workspace Apps / Smart Building": ["Workspace Apps / Smart Building", "Workspace apps/smart building", "Workspace-Apps/Smart Building"]
      };
      
      // Find all equivalent categories for the current category
      let equivalentCategories = [currentCategory];
      
      // If not 'all', find all possible equivalent categories
      if (currentCategory !== 'all') {
        for (const [key, values] of Object.entries(categoryEquivalents)) {
          if (values.includes(currentCategory) || values.some(v => 
              v.trim().includes(currentCategory.trim()) || 
              currentCategory.trim().includes(v.trim()) ||
              // Special case for Facility Management
              (v.includes("Facility") && currentCategory.includes("Facility")) ||
              (v.includes("CAFM") && currentCategory.includes("CAFM"))
          )) {
            equivalentCategories = [...equivalentCategories, ...values];
          }
        }
      }
      
      // Check if current card section matches any of the equivalent categories
      const isCurrentCategory = currentCategory === 'all' || 
                                equivalentCategories.includes(categoryTitle) ||
                                equivalentCategories.some(eq => 
                                  categoryTitle.includes(eq) || 
                                  eq.includes(categoryTitle) ||
                                  // Special case for Facility Management
                                  (eq.includes("Facility") && categoryTitle.includes("Facility")) ||
                                  (eq.includes("CAFM") && categoryTitle.includes("CAFM"))
                                );
      
      // Check if the section should be shown based on category
      if (isCurrentCategory) {
        // Get individual partner cards within this section
        const cards = cardSection.querySelectorAll('.card-under-partner');
        let hasVisibleCards = false;
        
        // Apply search filter to each card
        cards.forEach(card => {
          const partnerName = card.querySelector('h6').textContent.trim().toLowerCase();
          const partnerDescription = card.querySelector('p').textContent.trim().toLowerCase();
          const matchesSearch = searchTerm === '' || 
            partnerName.includes(searchTerm) || 
            partnerDescription.includes(searchTerm);
          
          if (matchesSearch) {
            card.closest('.w-dyn-item').style.display = '';
            hasVisibleCards = true;
            hasVisiblePartners = true;
          } else {
            card.closest('.w-dyn-item').style.display = 'none';
          }
        });
        
        // Show/hide the entire section based on if it has visible cards
        cardSection.style.display = hasVisibleCards ? '' : 'none';
      } else {
        // If category doesn't match, hide the entire section
        cardSection.style.display = 'none';
      }
    });
    
    // Show a "no results" message if needed
    const noResultsEl = document.querySelector('.no-results-message');
    if (!hasVisiblePartners) {
      if (!noResultsEl) {
        const message = document.createElement('div');
        message.className = 'no-results-message';
        
        // Check language to use correct message
        const isEnglish = document.querySelector('h2.text-center-no-margins')?.textContent.trim().toLowerCase().includes('aedifion partner ecosystem');
        
        if (isEnglish) {
          message.innerHTML = `
            <div class="text-center py-16">
              <p class="text-gray-500 text-lg">No partners found matching your criteria.</p>
              <button class="reset-button">Reset Filters</button>
            </div>
          `;
        } else {
          message.innerHTML = `
            <div class="text-center py-16">
              <p class="text-gray-500 text-lg">Keine Partner gefunden, die Ihren Kriterien entsprechen.</p>
              <button class="reset-button">Filter zurücksetzen</button>
            </div>
          `;
        }
        
        document.querySelector('.base-container').appendChild(message);
        message.querySelector('.reset-button').addEventListener('click', resetFilters);
      }
    } else if (noResultsEl) {
      noResultsEl.remove();
    }
  }
  
  function resetFilters() {
    searchInput.value = '';
    categorySelect.value = '';
    searchTerm = '';
    currentCategory = 'all';
    updateActiveCategoryLink('all');
    showAllPartners();
  }
  
  function showAllPartners() {
    partnerCards.forEach(section => {
      section.style.display = '';
      const cards = section.querySelectorAll('.w-dyn-item');
      cards.forEach(card => {
        card.style.display = '';
      });
    });
  }
  
  // Check for language to determine the reset button text
  const isEnglish = document.querySelector('h2.text-center-no-margins')?.textContent.trim().toLowerCase().includes('aedifion partner ecosystem');
  
  // Add some basic styles for the reset button
  const styles = document.createElement('style');
  styles.textContent = `
    .no-results-message {
      margin-top: 40px;
      text-align: center;
    }
    .reset-button {
      background-color: #e6007e;
      color: white;
      padding: 12px 24px;
      border-radius: 4px;
      border: none;
      font-weight: 500;
      margin-top: 16px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    .reset-button:hover {
      background-color: #c4006b;
    }
  `;
  document.head.appendChild(styles);
});