const Location = require('../models/locationsModel'); // Import the Location model
const Template = require('../models/templatesModel'); // Ensure this import is correct

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

    const baseTemplate = await Template.findOne({ tier: templateTier });
    if (!baseTemplate) {
      return res.status(404).json({ error: "Base template not found." });
    }

    const areaFactor = totalArea / baseTemplate.bom.totalArea;
    const floorFactor = numFloors / baseTemplate.bom.numFloors;
    const heightFactor = avgFloorHeight / baseTemplate.bom.avgFloorHeight;
    const scaleFactor = areaFactor * floorFactor * heightFactor;

    const scaledMaterials = baseTemplate.bom.materials.map(material => {
      let scaledQuantity;
      switch (material.category.toLowerCase().trim()) {
        case 'earthwork':
          scaledQuantity = material.quantity * areaFactor * heightFactor;
          break;
        case 'concrete':
          scaledQuantity = material.quantity * areaFactor * floorFactor * heightFactor;
          break;
        default:
          scaledQuantity = material.quantity * scaleFactor;
      }
      const scaledTotalAmount = material.unitCost * scaledQuantity;
      return { ...material, quantity: scaledQuantity, totalAmount: scaledTotalAmount };
    });

    const groupedMaterials = scaledMaterials.reduce((acc, material) => {
      const category = material.category && material.category.trim() !== '' ? material.category.trim().toUpperCase() : 'UNCATEGORIZED';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(material);
      return acc;
    }, {});

    let originalLaborCost = baseTemplate.bom.laborCost * (0.5 * areaFactor + 0.3 * floorFactor + 0.2 * heightFactor);
    const totalMaterialsCost = scaledMaterials.reduce((sum, material) => sum + material.totalAmount, 0);
    let originalTotalProjectCost = totalMaterialsCost + originalLaborCost;

    let markedUpLaborCost = originalLaborCost;
    let markedUpTotalProjectCost = originalTotalProjectCost;
    let locationMarkup = 0; // Default markup to 0

    if (locationName) {
      const location = await Location.findOne({ name: locationName });
      if (!location) {
        return res.status(404).json({ error: "Location not found." });
      }

      locationMarkup = location.markup; // Capture markup percentage
      const markupPercentage = locationMarkup / 100;
      markedUpLaborCost += originalLaborCost * markupPercentage;
      markedUpTotalProjectCost += originalTotalProjectCost * markupPercentage;
    }

    const bom = {
      projectDetails: {
        totalArea,
        numFloors,
        avgFloorHeight,
        location: { name: locationName, markup: locationMarkup }, // Include location markup
      },
      materials: groupedMaterials,
      originalCosts: {
        laborCost: originalLaborCost,
        totalProjectCost: originalTotalProjectCost,
      },
      markedUpCosts: {
        laborCost: markedUpLaborCost,
        totalProjectCost: markedUpTotalProjectCost,
      },
    };

    res.status(200).json({ success: true, bom });

  } catch (error) {
    console.error("Error generating BOM:", error.message);
    res.status(500).json({ error: "Failed to generate BOM.", details: error.message });
  }
};


module.exports = { generateBOM };
