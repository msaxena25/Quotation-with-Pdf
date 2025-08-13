// Utility function to get element by ID
function getById(id) {
  return document.getElementById(id);
}

// Editable grid logic
const dimensionsGrid = getById('dimensionsGrid').getElementsByTagName('tbody')[0];

function addRow() {
  const row = document.createElement('tr');
  row.innerHTML = `
  <td><input type="text" class="form-control" placeholder="Detail" /></td>
  <td><input type="text" class="form-control" placeholder="Value" /></td>
  <td>
    <button type="button" class="btn btn-danger btn-sm delete-row">Delete</button>
    <button type="button" class="btn btn-primary btn-sm ms-2 add-row">Add More</button>
  </td>
`;
  dimensionsGrid.appendChild(row);
  updateRowActions();
}

function updateRowActions() {
  // Remove all add-row buttons except last row
  const rows = dimensionsGrid.querySelectorAll('tr');
  rows.forEach((row, idx) => {
    const addBtn = row.querySelector('.add-row');
    if (addBtn) addBtn.remove();
    if (idx === rows.length - 1) {
      // Only last row gets add-row button
      const td = row.cells[2];
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'btn btn-primary btn-sm ms-2 add-row';
      addBtn.textContent = 'Add More';
      td.appendChild(addBtn);
    }
  });
}

dimensionsGrid.addEventListener('click', function (e) {
  if (e.target.classList.contains('add-row')) {
    addRow();
  }
  if (e.target.classList.contains('delete-row')) {
    const row = e.target.closest('tr');
    if (dimensionsGrid.rows.length > 1) {
      row.remove();
      updateRowActions();
    }
  }
});

// Initial setup
updateRowActions();

const editBtn = getById('editTermsBtn');
const saveBtn = getById('saveTermsBtn');
const termsList = getById('termsList');
const termsEditArea = getById('termsEditArea');

editBtn.addEventListener('click', function () {
  // Convert list items to textarea lines
  const items = Array.from(termsList.querySelectorAll('li')).map(li => li.textContent);
  termsEditArea.value = items.join('\n');
  termsList.classList.add('d-none');
  termsEditArea.classList.remove('d-none');
  editBtn.classList.add('d-none');
  saveBtn.classList.remove('d-none');
});

saveBtn.addEventListener('click', function () {
  // Convert textarea lines back to list items
  const lines = termsEditArea.value.split('\n').map(line => line.trim()).filter(line => line);
  termsList.innerHTML = lines.map(line => `<li>${line}</li>`).join('');
  termsEditArea.classList.add('d-none');
  termsList.classList.remove('d-none');
  saveBtn.classList.add('d-none');
  editBtn.classList.remove('d-none');
});

function calculateFields() {
  const quantity = parseFloat(getById('quantity').value) || 0;
  const amount = parseFloat(getById('amount').value) || 0;
  const isAnyDiscount = getById('isAnyDiscount').value;
  let discount = parseFloat(getById('discount').value) || 0;

  const totalPrice = quantity * amount;
  getById('totalPrice').value = totalPrice.toFixed(2);

  // Set discount to 0 if "Already discounted" or "No" is selected
  if (isAnyDiscount === 'Already discounted' || isAnyDiscount === 'No') {
    discount = 0;
    getById('discount').value = '0';
  }

  const priceAfterDiscount = totalPrice * (1 - discount / 100);
  getById('priceAfterDiscount').value = priceAfterDiscount.toFixed(2);

  // Calculate SGST and CGST (both 9% of priceAfterDiscount)
  const sgstAmount = priceAfterDiscount * 0.09;
  const cgstAmount = priceAfterDiscount * 0.09;
  const totalGstAmount = sgstAmount + cgstAmount;

  getById('sgstAmount').value = sgstAmount.toFixed(2);
  getById('cgstAmount').value = cgstAmount.toFixed(2);

  const finalPriceWithGst = priceAfterDiscount + totalGstAmount;
  getById('finalPriceWithGst').value = finalPriceWithGst.toFixed(2);
}

getById('quantity').addEventListener('input', calculateFields);
getById('amount').addEventListener('input', calculateFields);
getById('discount').addEventListener('input', calculateFields);
getById('isAnyDiscount').addEventListener('change', calculateFields);

getById('inventoryForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const form = e.target;

  // Collect all product specifications from the grid
  const productSpecs = [];
  const specRows = document.querySelectorAll('#dimensionsGrid tbody tr');
  specRows.forEach(row => {
    const detail = row.cells[0].querySelector('input').value.trim();
    const value = row.cells[1].querySelector('input').value.trim();
    if (detail && value) {
      productSpecs.push({ detail, value });
    }
  });

  // Collect all terms and conditions
  const termsAndConditions = [];
  const termItems = document.querySelectorAll('#termsList li');
  termItems.forEach(item => {
    if (item.textContent.trim()) {
      termsAndConditions.push(item.textContent.trim());
    }
  });

  // Create quotationData object with all form data
  const quotationData = {
    customerInfo: {
      name: getById('customerName').value,
      phone: getById('customerPhone').value,
      address: getById('customerAddress').value
    },
    itemDetails: {
      itemName: getById('itemName').value,
      quantity: parseFloat(getById('quantity').value) || 0,
      amountPerUnit: parseFloat(getById('amount').value) || 0,
      totalPrice: parseFloat(getById('totalPrice').value) || 0
    },
    productSpecifications: productSpecs,
    pricing: {
      isAnyDiscount: getById('isAnyDiscount').value,
      discountPercentage: parseFloat(getById('discount').value) || 0,
      priceAfterDiscount: parseFloat(getById('priceAfterDiscount').value) || 0,
      sgstAmount: parseFloat(getById('sgstAmount').value) || 0,
      cgstAmount: parseFloat(getById('cgstAmount').value) || 0,
      finalPriceWithGst: parseFloat(getById('finalPriceWithGst').value) || 0
    },
    termsAndConditions: termsAndConditions,
    companyInfo: {
      name: "Sharda Windows",
      manager: "Abhishek Srivastava",
      email: "shardawindows@gmail.com",
      phone: "+91-8750101290",
      address: "A-324, Vijay Vihar, Phase 1, Sector 4, Delhi, 110085",
      specialty: "UPVC Windows & Plated Mesh",
      gstNumber: "07MMZPS7966J1ZD"
    },
    welcomeNote: `Dear Sir/Madam,
Thank you for giving my company the opportunity to provide you with the following quotation for your perusal. 
Should you require any further information, please feel free to contact me at the above number.`,
    notes: `All window and door styles shown are provisional and can be easily modified to match your exact requirements. Once you confirm your order, the final style selection will be made during the measurement process and full site survey, before frame manufacturing begins.
`,
    generatedDate: new Date().toISOString()
  };
  // Display the quotation data in read-only format
  // Console log the quotation data
  // console.log('Quotation Data:', quotationData);

  // Populate the read-only display section
  // populateQuotationDisplay(quotationData);

  // Function to load image and generate PDF
  async function generatePDFWithLogo() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Function to check if we need a new page and add one if necessary
    function checkPageBreak(requiredSpace = 20) {
      if (currentY + requiredSpace > 280) { // Page height is approximately 280
        doc.addPage();
        currentY = 20; // Reset to top of new page
        return true;
      }
      return false;
    }

    // Function to convert image to base64
    function getImageBase64(src) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Handle CORS
        img.onload = function () {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          try {
            const dataURL = canvas.toDataURL('image/png');
            resolve({ dataURL, width: img.width, height: img.height });
          } catch (e) {
            reject(e);
          }
        };
        img.onerror = () => reject(new Error('Image failed to load'));
        img.src = src;
      });
    }

    // Try to load and add logo
    let logoData = null;
    try {
      logoData = await getImageBase64('logo.png');
      console.log('Logo loaded successfully');
    } catch (error) {
      console.log('Logo not found or failed to load:', error.message);
    }

    // Header section with or without logo
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("Quotation", 105, 20, { align: "center" });

    // Company information on left side (matching HTML order)
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.text("Sharda Windows", 20, 35);
    doc.text("Address: A-324, Vijay Vihar, Phase 1, Sector 4, Delhi, 110085", 20, 42);
    doc.text("Specialist in: UPVC Windows & Plated Mesh", 20, 49);
    doc.text("GST Number: 07MMZPS7966J1ZD", 20, 56);
    doc.text("Marketing Manager: Abhishek Srivastava", 20, 63);
    doc.text("Email: shardawindows@gmail.com", 20, 70);
    doc.text("Website: upvcwindowsandpleatedmesh.in", 20, 77);
    doc.text("Phone: +91-8750101290", 20, 84);

    // Add logo on right side if available
    if (logoData) {
      try {
        const maxWidth = 30;
        const aspectRatio = logoData.height / logoData.width;
        const logoWidth = maxWidth;
        const logoHeight = logoWidth * aspectRatio;

        // Position logo on right side (x: 160, y: 35)
        doc.addImage(logoData.dataURL, 'PNG', 160, 35, logoWidth, logoHeight);
        console.log('Logo added to PDF successfully');
      } catch (error) {
        console.log('Error adding logo to PDF:', error.message);
      }
    }

    // Divider line
    doc.setLineWidth(0.5);
    doc.line(20, 91, 190, 91);

    let currentY = 101;

    // Quotation Information Section
    checkPageBreak(30); // Check if we need space for the section
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(40, 116, 166); // Blue color for headers
    doc.text("Quotation Information", 20, currentY);
    currentY += 10;

    // Generate quotation ID and date
    const quotationId = `QT-${Date.now().toString().slice(-6)}`;
    const quotationDate = new Date().toLocaleDateString();

    // Quotation Information Table
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);

    const quotationInfo = [
      ["Quotation ID", quotationId],
      ["Quotation Date", quotationDate]
    ];

    quotationInfo.forEach((row, index) => {
      checkPageBreak(10); // Check before each row
      const rowY = currentY;
      // Draw light gray background for rows
      doc.setFillColor(250, 250, 250);
      doc.rect(20, rowY - 5, 170, 7, 'F');
      // Draw thinner border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(20, rowY - 5, 170, 7, 'S');
      doc.rect(20, rowY - 5, 60, 7, 'S'); // Separator line

      // Add text
      doc.setFont(undefined, "bold");
      doc.text(row[0], 22, rowY);
      doc.setFont(undefined, "normal");
      doc.text(row[1], 82, rowY);
      currentY += 8;
    });
    currentY += 15;

    // Customer Information Section
    checkPageBreak(40); // Check if we need space for the section
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(40, 116, 166); // Blue color for headers
    doc.text("Customer Information", 20, currentY);
    currentY += 10;

    // Customer Information Table
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);

    const customerData = [
      ["Customer Name", quotationData.customerInfo.name || 'N/A'],
      ["Phone Number", quotationData.customerInfo.phone || 'N/A'],
      ["Address", quotationData.customerInfo.address || 'N/A']
    ];

    customerData.forEach((row, index) => {
      checkPageBreak(10); // Check before each row
      const rowY = currentY;
      // Draw light gray background for rows
      doc.setFillColor(250, 250, 250);
      doc.rect(20, rowY - 5, 170, 7, 'F');
      // Draw thinner border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(20, rowY - 5, 170, 7, 'S');
      doc.rect(20, rowY - 5, 60, 7, 'S'); // Separator line

      // Add text
      doc.setFont(undefined, "bold");
      doc.text(row[0], 22, rowY);
      doc.setFont(undefined, "normal");
      doc.text(row[1], 82, rowY);
      currentY += 8;
    });
    currentY += 15;

    // Welcome Note Section
    if (quotationData.welcomeNote) {
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);

      // Split the welcome note text to fit within page width
      const welcomeText = doc.splitTextToSize(quotationData.welcomeNote, 170);
      const requiredSpace = welcomeText.length * 5;
      checkPageBreak(requiredSpace);

      doc.text(welcomeText, 20, currentY);
      currentY += requiredSpace + 15;
    }

    // Item Details Section
    checkPageBreak(50); // Check if we need space for the section
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(40, 116, 166); // Blue color for headers
    doc.text("Item Details", 20, currentY);
    currentY += 10;

    // Item Details Table
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);

    const itemData = [
      ["Item Name", quotationData.itemDetails.itemName || 'N/A'],
      ["Quantity", quotationData.itemDetails.quantity.toString()],
      ["Amount (per unit)", `Rs.${parseFloat(quotationData.itemDetails.amountPerUnit || '0').toFixed(2)}`],
      ["Total Price", `Rs.${parseFloat(quotationData.itemDetails.totalPrice || '0').toFixed(2)}`]
    ];

    itemData.forEach((row, index) => {
      checkPageBreak(10); // Check before each row
      const rowY = currentY;
      // Highlight Total Price row with yellow background
      if (index === 3) {
        doc.setFillColor(255, 243, 205); // Light yellow for total price
      } else {
        doc.setFillColor(250, 250, 250);
      }
      doc.rect(20, rowY - 5, 170, 7, 'F');
      // Draw thinner border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(20, rowY - 5, 170, 7, 'S');
      doc.rect(20, rowY - 5, 60, 7, 'S'); // Separator line

      // Add text
      doc.setFont(undefined, "bold");
      doc.text(row[0], 22, rowY);
      doc.setFont(undefined, index === 3 ? "bold" : "normal"); // Bold for total price
      doc.text(row[1], 82, rowY);
      currentY += 8;
    });
    currentY += 5;

    // Product Specifications
    if (quotationData.productSpecifications && quotationData.productSpecifications.length > 0) {
      checkPageBreak(20 + (quotationData.productSpecifications.length * 8)); // Check space for header + all specs
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Product Specifications:", 20, currentY);
      currentY += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      quotationData.productSpecifications.forEach((spec, index) => {
        checkPageBreak(10); // Check before each specification
        const rowY = currentY;
        doc.setFillColor(250, 250, 250);
        doc.rect(20, rowY - 5, 170, 7, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.2);
        doc.rect(20, rowY - 5, 170, 7, 'S');
        doc.rect(20, rowY - 5, 85, 7, 'S'); // Separator line

        doc.text(spec.detail, 22, rowY);
        doc.text(spec.value, 107, rowY); // Left aligned
        currentY += 8;
      });
      currentY += 15;
    } else {
      currentY += 10;
    }

    // Price Summary Section
    checkPageBreak(70); // Check if we need space for the pricing section
    doc.setFontSize(14);
    doc.setFont(undefined, "bold");
    doc.setTextColor(40, 116, 166); // Blue color for headers
    doc.text("Price Summary", 20, currentY);
    currentY += 10;

    // Price Summary Table
    doc.setTextColor(0, 0, 0); // Reset to black
    doc.setFont(undefined, "normal");
    doc.setFontSize(10);

    let pricingData = [];

    if (quotationData.pricing.isAnyDiscount === 'Yes') {
      // Show discount details when discount is applied
      pricingData = [
        ["Any Discount Applied?", quotationData.pricing.isAnyDiscount || 'No'],
        ["Discount Percentage", `${parseFloat(quotationData.pricing.discountPercentage || '0').toFixed(2)}%`],
        ["Price After Discount", `Rs.${parseFloat(quotationData.pricing.priceAfterDiscount || '0').toFixed(2)}`],
        ["SGST Amount (9%)", `Rs.${parseFloat(quotationData.pricing.sgstAmount || '0').toFixed(2)}`],
        ["CGST Amount (9%)", `Rs.${parseFloat(quotationData.pricing.cgstAmount || '0').toFixed(2)}`],
        ["Final Price (With GST)", `Rs.${parseFloat(quotationData.pricing.finalPriceWithGst || '0').toFixed(2)}`]
      ];
    } else {
      // Show "Already discounted" or "No" when no additional discount is applied
      pricingData = [
        ["Any Discount Applied?", quotationData.pricing.isAnyDiscount || 'No'],
        ["SGST Amount (9%)", `Rs.${parseFloat(quotationData.pricing.sgstAmount || '0').toFixed(2)}`],
        ["CGST Amount (9%)", `Rs.${parseFloat(quotationData.pricing.cgstAmount || '0').toFixed(2)}`],
        ["Final Price (With GST)", `Rs.${parseFloat(quotationData.pricing.finalPriceWithGst || '0').toFixed(2)}`]
      ];
    }

    pricingData.forEach((row, index) => {
      checkPageBreak(10); // Check before each pricing row
      const rowY = currentY;

      // Determine which row is the final price with GST based on discount status
      let finalPriceWithGstIndex, calculatedValueIndices;

      if (quotationData.pricing.isAnyDiscount === 'Yes') {
        finalPriceWithGstIndex = 5; // "Final Price (With GST)" is at index 5 when discount is shown
        calculatedValueIndices = [2, 3, 4]; // Price After Discount, SGST, CGST
      } else {
        finalPriceWithGstIndex = 3; // "Final Price (With GST)" is at index 3 when no discount is shown
        calculatedValueIndices = [1, 2]; // SGST, CGST
      }

      // Highlight Final Price (With GST) with green background
      if (index === finalPriceWithGstIndex) {
        doc.setFillColor(212, 237, 218); // Light green for final price
      } else if (calculatedValueIndices.includes(index)) {
        doc.setFillColor(255, 243, 205); // Light yellow for calculated values
      } else {
        doc.setFillColor(250, 250, 250);
      }

      doc.rect(20, rowY - 5, 170, 7, 'F');
      // Draw thinner border
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(20, rowY - 5, 170, 7, 'S');
      doc.rect(20, rowY - 5, 100, 7, 'S'); // Separator line

      // Add text
      doc.setFont(undefined, "bold");
      doc.text(row[0], 22, rowY);
      doc.setFont(undefined, index === finalPriceWithGstIndex ? "bold" : "normal"); // Bold for final price with GST
      if (index === finalPriceWithGstIndex) {
        doc.setFontSize(12); // Larger font for final price
      }
      doc.text(row[1], 122, rowY); // Left align values (not right aligned)
      doc.setFontSize(10); // Reset font size
      currentY += 8;
    });
    currentY += 15;

    // Notes Section
    if (quotationData.notes) {
      checkPageBreak(30); // Check space for notes
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.setTextColor(40, 116, 166); // Blue color for headers
      doc.text("Important Notes", 20, currentY);
      currentY += 8;

      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);

      // Split the notes text to fit within page width
      const notesText = doc.splitTextToSize(quotationData.notes, 170);
      const requiredSpace = notesText.length * 5;
      checkPageBreak(requiredSpace);

      // Add light background for notes
      doc.setFillColor(255, 252, 230);
      doc.rect(20, currentY - 3, 170, requiredSpace + 6, 'F');
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.rect(20, currentY - 3, 170, requiredSpace + 6, 'S');

      doc.text(notesText, 22, currentY + 2);
      currentY += requiredSpace + 15;
    }

    // Terms and Conditions Section
    if (quotationData.termsAndConditions && quotationData.termsAndConditions.length > 0) {
      checkPageBreak(30); // Check space for terms header
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.setTextColor(40, 116, 166); // Blue color for headers
      doc.text("Terms and Conditions", 20, currentY);
      currentY += 8;

      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.setTextColor(0, 0, 0);

      quotationData.termsAndConditions.forEach((term, index) => {
        const termText = `${index + 1}. ${term}`;
        const splitText = doc.splitTextToSize(termText, 170);
        const requiredSpace = splitText.length * 4;
        checkPageBreak(requiredSpace + 5); // Check space for each term
        doc.text(splitText, 20, currentY);
        currentY += requiredSpace;
      });
      currentY += 8;
    }

    // Generation Date
    checkPageBreak(30); // Check space for generation date and signature
    doc.setFontSize(10);
    doc.setFont(undefined, "italic");
    doc.setTextColor(100, 100, 100);
    const generatedDate = new Date(quotationData.generatedDate);
    doc.text(`Generated on: ${generatedDate.toLocaleString()}`, 20, currentY);
    currentY += 15;

    // Divider before signature
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 0, 0);
    doc.line(20, currentY, 190, currentY);

    // Signature section (right side)
    doc.setFontSize(12);
    doc.setFont(undefined, "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Authorized Signature", 140, currentY + 20);

    // Draw signature line
    doc.setLineWidth(0.3);
    doc.line(140, currentY + 25, 190, currentY + 25);

    doc.save("quotation.pdf");

    // Show Bootstrap modal on success
    const modal = new bootstrap.Modal(document.getElementById('pdfSuccessModal'));
    modal.show();
  }

  // Call the function to generate PDF with logo
  await generatePDFWithLogo();
});

// Initial calculation
calculateFields();

// Function to populate the read-only quotation display
function populateQuotationDisplay(data) {
  // Show the display section
  getById('quotationDataDisplay').style.display = 'block';

  // Populate customer information
  getById('displayCustomerName').textContent = data.customerInfo.name || 'N/A';
  getById('displayCustomerPhone').textContent = data.customerInfo.phone || 'N/A';
  getById('displayCustomerAddress').textContent = data.customerInfo.address || 'N/A';

  // Populate item details
  getById('displayItemName').textContent = data.itemDetails.itemName || 'N/A';
  getById('displayQuantity').textContent = data.itemDetails.quantity || '0';
  getById('displayAmount').textContent = `₹${data.itemDetails.amountPerUnit || '0'}`;
  getById('displayTotalPrice').textContent = `₹${data.itemDetails.totalPrice || '0'}`;

  // Populate product specifications
  const specsContainer = getById('displayProductSpecs');
  if (data.productSpecifications && data.productSpecifications.length > 0) {
    let specsTable = `
      <table class="table table-bordered align-middle">
        <thead class="table-light">
          <tr>
            <th style="width: 50%;">Details</th>
            <th style="width: 50%;">Value</th>
          </tr>
        </thead>
        <tbody>
    `;
    data.productSpecifications.forEach(spec => {
      specsTable += `
        <tr>
          <td class="p-2">${spec.detail}</td>
          <td class="p-2">${spec.value}</td>
        </tr>
      `;
    });
    specsTable += `</tbody></table>`;
    specsContainer.innerHTML = specsTable;
  } else {
    specsContainer.innerHTML = '<div class="p-2 bg-white rounded border">No specifications added</div>';
  }

  // Populate pricing information
  getById('displayIsAnyDiscount').textContent = data.pricing.isAnyDiscount || 'No';
  getById('displayDiscount').textContent = `${data.pricing.discountPercentage || '0'}%`;
  getById('displayPriceAfterDiscount').textContent = `₹${data.pricing.priceAfterDiscount || '0'}`;
  getById('displaySgstAmount').textContent = `₹${data.pricing.sgstAmount || '0'}`;
  getById('displayCgstAmount').textContent = `₹${data.pricing.cgstAmount || '0'}`;
  getById('displayFinalPriceWithGst').textContent = `₹${data.pricing.finalPriceWithGst || '0'}`;

  // Populate company information
  getById('displayCompanyName').textContent = data.companyInfo.name || 'N/A';
  getById('displayManager').textContent = data.companyInfo.manager || 'N/A';
  getById('displayEmail').textContent = data.companyInfo.email || 'N/A';
  getById('displayPhone').textContent = data.companyInfo.phone || 'N/A';
  getById('displayAddress').textContent = data.companyInfo.address || 'N/A';
  getById('displayGstNumber').textContent = data.companyInfo.gstNumber || 'N/A';

  // Populate terms and conditions
  const termsContainer = getById('displayTermsAndConditions');
  if (data.termsAndConditions && data.termsAndConditions.length > 0) {
    let termsList = '<ol class="mb-0" style="font-size: 0.95rem;">';
    data.termsAndConditions.forEach(term => {
      termsList += `<li class="mb-1">${term}</li>`;
    });
    termsList += '</ol>';
    termsContainer.innerHTML = termsList;
  } else {
    termsContainer.innerHTML = 'No terms and conditions specified';
  }

  // Populate generation date
  const generatedDate = new Date(data.generatedDate);
  getById('displayGeneratedDate').textContent = generatedDate.toLocaleString();

  // Scroll to the display section
  getById('quotationDataDisplay').scrollIntoView({ behavior: 'smooth' });
}