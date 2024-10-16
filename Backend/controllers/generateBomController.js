const Location = require('../models/locationsModel');
const Template = require('../models/templatesModel');

const generateBOM = async (req, res) => {
  let { totalArea, numFloors, avgFloorHeight, templateTier, locationName } = req.body;

  try {
    totalArea = parseFloat(totalArea);
    numFloors = parseInt(numFloors, 10);
    avgFloorHeight = parseFloat(avgFloorHeight);

    const validTiers = ['economy', 'standard', 'premium'];
    if (!validTiers.includes(templateTier)) {
      return res.status(400).json({ error: "Invalid template tier. Must be one of: economy, standard, premium." });
    }

    const baseTemplate = await Template.findOne({ tier: templateTier }).lean();
    if (!baseTemplate) {
      return res.status(404).json({ error: "Base template not found." });
    }

    // Calculate scale factors
    const areaFactor = totalArea / baseTemplate.bom.totalArea;
    const floorFactor = numFloors / baseTemplate.bom.numFloors;
    const heightFactor = avgFloorHeight / baseTemplate.bom.avgFloorHeight;
    const scaleFactor = areaFactor * floorFactor * heightFactor;

    // Scale the materials based on the category
    const scaledCategories = baseTemplate.bom.categories.map((category) => {
      const scaledMaterials = category.materials.map((material) => {
        let scaledQuantity;

        switch (category.category.toLowerCase().trim()) {
          case 'earthwork':
            scaledQuantity = material.quantity * areaFactor * heightFactor;
            break;
          case 'concrete':
            scaledQuantity = material.quantity * areaFactor * floorFactor * heightFactor;
            break;
          case 'rebars':
            scaledQuantity = material.quantity * areaFactor * floorFactor * heightFactor;
            break;
          case 'formworks':
            scaledQuantity = material.quantity * areaFactor * floorFactor;
            break;
          case 'roofing':
            scaledQuantity = material.quantity * areaFactor;
            break;
          case 'painting':
            scaledQuantity = material.quantity * areaFactor * floorFactor;
            break;
          case 'electrical':
          case 'plumbing':
            scaledQuantity = material.quantity * areaFactor * floorFactor;
            break;
          default:
            scaledQuantity = material.quantity * scaleFactor;  // Default scaling
        }

        // Total amount calculated based on scaled quantity and cost
        const scaledTotalAmount = material.cost * scaledQuantity;

        return {
          ...material,
          quantity: scaledQuantity,
          totalAmount: scaledTotalAmount,
        };
      });

      // Calculate total for each category
      const categoryTotal = scaledMaterials.reduce((sum, material) => sum + material.totalAmount, 0);

      return { ...category, materials: scaledMaterials, categoryTotal };
    });

    // Recalculate labor costs
    let originalLaborCost = baseTemplate.bom.laborCost * (0.5 * areaFactor + 0.3 * floorFactor + 0.2 * heightFactor);
    const totalMaterialsCost = scaledCategories.reduce((sum, category) => sum + category.categoryTotal, 0);
    let originalTotalProjectCost = totalMaterialsCost + originalLaborCost;

    // Apply location markup if selected
    let markedUpLaborCost = originalLaborCost;
    let markedUpTotalProjectCost = originalTotalProjectCost;
    let locationMarkup = 0;

    if (locationName) {
      const location = await Location.findOne({ name: locationName });
      if (!location) {
        return res.status(404).json({ error: "Location not found." });
      }

      locationMarkup = location.markup;
      const markupPercentage = locationMarkup / 100;
      markedUpLaborCost += originalLaborCost * markupPercentage;
      markedUpTotalProjectCost += originalTotalProjectCost * markupPercentage;
    }

    const bom = {
      projectDetails: {
        totalArea,
        numFloors,
        avgFloorHeight,
        location: { name: locationName, markup: locationMarkup },
      },
      categories: scaledCategories,
      originalCosts: {
        laborCost: originalLaborCost,
        totalProjectCost: originalTotalProjectCost,
      },
      markedUpCosts: {
        laborCost: markedUpLaborCost,
        totalProjectCost: markedUpTotalProjectCost,
      },
    };

    if (!bom || !bom.categories || !bom.categories.length || bom.categories.some(c => !c.materials || !c.materials.length)) {
      return res.status(400).json({ message: 'BOM must include categories and materials data' });
    }

    res.status(200).json({ success: true, bom });

  } catch (error) {
    console.error("Error generating BOM:", error.message);
    res.status(500).json({ error: "Failed to generate BOM.", details: error.message });
  }
};



module.exports = { generateBOM };
